# Jastip Tracker

Aplikasi web manajemen bisnis jastip (jasa titip) untuk melacak trip, order, pelanggan, dan keuntungan secara real-time dengan konversi mata uang asing otomatis.

## Fitur Utama

- **Dashboard** -- Ringkasan statistik: total trip, order, revenue (IDR), margin, dan rate margin
- **Manajemen Trip** -- Buat trip dengan destinasi negara, tanggal keberangkatan/pulang, dan status (Perencanaan / Berlangsung / Selesai / Dibatalkan)
- **Manajemen Pelanggan** -- CRUD pelanggan dengan riwayat order, edit inline, dan catatan
- **Manajemen Order** -- Tambah order ke trip dengan multiple item, upload bukti pembayaran, dan update status
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
| Database | Microsoft SQL Server (MSSQL) | mssql ^12.7.0 |
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
| `Order` | Data order (id UUID, tripId FK, customerId FK, status, notes, receiptUrl) |
| `OrderItem` | Item order (id UUID, orderId FK, itemName, quantity, unitPriceForeign, currency, unitPriceIDR, totalIDR, margin) |
| `CurrencyRate` | Cache exchange rate (baseCurrency, targetCurrency, rate, fetchedAt) |

Semua ID menggunakan UUID. Cascade delete: User -> Customer/Trip, Trip -> Order, Order -> OrderItem.

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

> Trip hanya bisa ditandai COMPLETED jika semua ordernya berstatus DELIVERED.
> Status order hanya bisa diubah jika trip berstatus ONGOING.

## Persiapan

### 1. Prasyarat

- [Node.js](https://nodejs.org/) v18+
- [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server) (SQL Express atau lebih)
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

Buka SQL Server Management Studio (SSMS) atau tool SQL Server lainnya, lalu jalankan script:

```sql
-- Jalankan file sql/setup.sql
```

Script ini akan:
- Membuat database `jastip_tracker` (jika belum ada)
- Membuat semua tabel dengan cascade delete
- Insert data demo (2 user, 5 pelanggan, 3 trip, 6 order, 16 item order, 19 currency rates)

### 5. Konfigurasi Environment Variable

Buat file `.env` di root project:

```env
DB_SERVER="localhost\SQLEXPRESS"
DB_USER="sa"
DB_PASSWORD="your_password"
DB_NAME="jastip_tracker"
DB_ENCRYPT="true"
DB_TRUST="true"
AUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

| Variable | Deskripsi |
|----------|-----------|
| `DB_SERVER` | Instance SQL Server (contoh: `localhost\SQLEXPRESS`) |
| `DB_USER` | Username SQL Server (hilangkan untuk Windows Auth) |
| `DB_PASSWORD` | Password SQL Server (hilangkan untuk Windows Auth) |
| `DB_NAME` | Nama database |
| `DB_ENCRYPT` | Aktifkan enkripsi (`true`/`false`) |
| `DB_TRUST` | Trust server certificate (`true`/`false`) |
| `AUTH_SECRET` | Secret key untuk signing JWT NextAuth |
| `NEXTAUTH_URL` | Base URL aplikasi |

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
| `/api/customers` | GET, POST | List / buat pelanggan |
| `/api/customers/[id]` | GET, PATCH, DELETE | Detail / update / hapus pelanggan |
| `/api/orders` | POST | Buat order dengan items |
| `/api/orders/[id]` | PATCH, DELETE | Update / hapus order |
| `/api/currency` | GET | Dapatkan exchange rate |
| `/api/upload` | POST | Upload gambar bukti pembayaran |

> Semua API (kecuali register dan auth) memerlukan autentikasi dan data di-scoping per user.

## Fitur Mobile-First

- Navigasi bawah (bottom nav) di mobile
- Navigasi atas (top navbar) di desktop
- Layout responsif dengan max-width container
- Input minimum 16px (mencegah zoom otomatis di iOS)

## Lisensi

MIT License
