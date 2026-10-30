# Jastip Tracker

Aplikasi web manajemen bisnis jastip (jasa titip) untuk melacak trip, order, pelanggan, dan keuntungan secara real-time dengan konversi mata uang asing otomatis.

## Fitur Utama

- **Dashboard** -- Ringkasan statistik: total trip, order, revenue (IDR), margin, dan rate margin
- **Manajemen Trip** -- Buat trip dengan destinasi negara, tanggal keberangkatan/pulang, dan status (Perencanaan / Berlangsung / Selesai / Dibatalkan)
- **Manajemen Pelanggan** -- CRUD pelanggan dengan riwayat order, edit inline, dan catatan
- **Manajemen Order** -- Tambah order ke trip dengan multiple item dan update status
- **Konversi Mata Uang Otomatis** -- Harga mata uang asing otomatis dikonversi ke IDR menggunakan live exchange rate (Frankfurter API) dengan caching 1 jam
- **Pelacakan Margin** -- Margin per item (IDR) yang diagregasi per order dan per trip
- **Autentikasi Multi-User** -- Setiap user memiliki data yang terisolasi

## Tech Stack

| Kategori | Teknologi | Versi |
|----------|-----------|-------|
| Framework | Next.js (App Router) | 16.2.10 |
| Bahasa | TypeScript | ^5 |
| UI Library | React | 19.2.4 |
| Styling | Tailwind CSS v4 | ^4 |
| Database | PostgreSQL (Neon.com) | pg ^8 |
| Autentikasi | NextAuth.js v5 (Credentials) | ^5.0.0-beta.31 |
| Password Hashing | bcryptjs | ^3.0.3 |
| Icons | Lucide React | ^1.24.0 |
| Date Utilities | date-fns | ^4.4.0 |
| Exchange Rate | Frankfurter API (ECB-based) | External API |

## Struktur Database

| Tabel | Deskripsi |
|-------|-----------|
| `User` | Data user (id UUID, email, password hash, name) |
| `Customer` | Data pelanggan (id UUID, userId FK, name, phone, email, notes) |
| `Trip` | Data trip (id UUID, userId FK, name, country, startDate, endDate, status) |
| `Order` | Data order (id UUID, tripId FK, customerId FK, stopId FK opsional, status, notes, receiptUrl) |
| `OrderItem` | Item order (id UUID, orderId FK, itemName, quantity, unitPriceForeign, currency, unitPriceIDR, totalIDR, margin) |
| `CurrencyRate` | Cache exchange rate (baseCurrency, targetCurrency, rate, fetchedAt) |
| `TripStop` | Tempat/rute trip (id UUID, tripId FK, name, latitude, longitude, orderIndex) |

Semua ID menggunakan UUID (`uuid`), dibuat dengan `gen_random_uuid()`. Cascade delete: User -> Customer/Trip, Trip -> Order, Trip -> TripStop, Order -> OrderItem. Order dapat merujuk ke tempat pada rute trip melalui `stopId` (opsional).

> Nama kolom memakai camelCase dan di-quote (`"userId"`, `"totalIDR"`) supaya bentuk JSON yang dikembalikan API tetap sama seperti sebelumnya. Jangan lupa meng-quote identifier camelCase saat menulis query manual.

## Status Workflow

### Trip

```
PLANNING -> ONGOING -> COMPLETED
                  \-> CANCELLED
```

### Order

```
PENDING -> ORDERED -> PAID -> SHIPPED -> DELIVERED
                                        \-> CANCELLED
```

> Trip hanya bisa ditandai COMPLETED jika tidak ada order berstatus PENDING atau ORDERED.
> Trip hanya bisa dibatalkan (CANCELLED) jika tidak ada order berstatus PAID.
> Status order hanya bisa diubah jika trip berstatus PLANNING atau ONGOING.

## Persiapan

### 1. Prasyarat

- [Node.js](https://nodejs.org/) v18+
- Database PostgreSQL — paling mudah pakai [Neon](https://neon.com) (free, tanpa kartu kredit)
- npm, yarn, atau pnpm

### 2. Clone Repository

```bash
git clone https://github.com/your-username/jastip-tracker.git
cd jastip-tracker
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Setup Database

1. Buat project di [Neon](https://console.neon.tech) (sign in dengan GitHub/Google, tanpa kartu kredit).
2. Salin **connection string** dari dashboard Neon. Gunakan host yang mengandung `-pooler` karena aplikasi berjalan di serverless:
   `postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`
3. Buka **SQL Editor** di dashboard Neon, tempel isi file `sql/setup.postgres.sql`, lalu jalankan.

Script ini akan:
- Membuat semua tabel dengan cascade delete
- Insert data demo (2 user, 5 pelanggan, 3 trip, 6 order, 14 item order, 19 currency rates)

> File `sql/setup.sql` dan `sql/migrate_trip_stop.sql` / `sql/migrate_order_stop.sql` adalah versi lama untuk SQL Server dan sudah tidak dipakai.

Jika database sudah berisi data hasil migrasi dari SQL Server (nama kolom masih huruf kecil seperti `userid`, `tripid`), jalankan `sql/migrate_postgres_camelcase.sql` di SQL Editor Neon. Script itu hanya me-rename kolom ke camelCase (aman diulang) tanpa menyentuh data.

### 5. Konfigurasi Environment Variable

Buat file `.env` di root project (lihat `.env.example`):

```env
DATABASE_URL="postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
AUTH_SECRET="your-random-secret-here"
AUTH_TRUST_HOST="true"
```

| Variable | Deskripsi |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL (Neon: pakai host `-pooler`, wajib `?sslmode=require`) |
| `DB_POOL_MAX` | Opsional, jumlah koneksi maksimum per instance (default `5`) |
| `AUTH_SECRET` | Secret key untuk signing JWT NextAuth (generate baru untuk produksi: `openssl rand -base64 32`) |
| `AUTH_TRUST_HOST` | Set `true` agar NextAuth percaya host header (wajib di Vercel) |

### 6. Jalankan Aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Akun Demo

| Email | Password |
|-------|----------|
| budi@gmail.com | password123 |
| sari@gmail.com | password123 |

## Perintah Tersedia

```bash
npm run dev      # Jalankan development server
npm run build    # Build untuk produksi
npm run start    # Jalankan production server
npm run lint     # Jalankan ESLint
```

## API Endpoints

| Route | Method | Deskripsi |
|-------|--------|-----------|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth.js handler |
| `/api/auth/register` | POST | Registrasi user baru |
| `/api/dashboard` | GET | Statistik dashboard |
| `/api/trips` | GET, POST | List / buat trip |
| `/api/trips/[id]` | GET, PATCH, DELETE | Detail / update / hapus trip |
| `/api/trips/[id]/stops` | GET, POST | List / tambah tempat rute (stop) |
| `/api/trips/[id]/stops/[stopId]` | PATCH, DELETE | Update / hapus tempat rute |
| `/api/customers` | GET, POST | List / buat pelanggan |
| `/api/customers/[id]` | GET, PATCH, DELETE | Detail / update / hapus pelanggan |
| `/api/orders` | POST | Buat order dengan items |
| `/api/orders/[id]` | PATCH, DELETE | Update / hapus order |
| `/api/currency` | GET | Dapatkan exchange rate |

> Semua API (kecuali register dan auth) memerlukan autentikasi dan data di-scoping per user.

> Fitur upload bukti pembayaran (`/api/upload`) sementara dihapus karena Vercel tidak mengizinkan penulisan file ke filesystem. Kolom `receiptUrl` masih ada di database untuk dipakai lagi nanti (mis. dengan Vercel Blob).

## Deploy ke Vercel (gratis)

1. Import repo ke Vercel (plan Hobby gratis untuk proyek personal/non-komersial).
2. Tambahkan Environment Variables: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`.
3. Deploy. Tidak perlu konfigurasi build lain — `npm run build` sudah jalan tanpa akses database (semua halaman dashboard berupa client component).
4. Setelah deploy, jalankan `sql/setup.postgres.sql` pada project Neon yang dipakai produksi, lalu login dengan akun demo atau daftar akun baru.

Catatan Neon free tier: compute otomatis suspend setelah 5 menit idle dan bangun sendiri saat ada request, jadi request pertama bisa terasa lebih lambat.

## Fitur Mobile-First

- Navigasi bawah (bottom nav) di mobile
- Navigasi atas (top navbar) di desktop
- Layout responsif dengan max-width container
- Input minimum 16px (mencegah zoom otomatis di iOS)

## Lisensi

MIT License
