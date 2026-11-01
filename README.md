# Jastip Tracker

**Jastip Tracker** adalah aplikasi web untuk membantu jastiper mencatat perjalanan, pesanan pelanggan, rute belanja, dan keuntungan dalam satu tempat. Harga barang dari luar negeri otomatis dikonversi ke Rupiah, jadi Anda tidak perlu lagi menghitung manual di spreadsheet.

Cocok untuk jastiper perorangan maupun tim kecil yang ingin tahu **uang masuk, modal, dan margin** secara real-time.

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.2.10-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)

</div>

> Semua screenshot di bawah diambil dari aplikasi yang berjalan dengan data demo.

---

## Daftar Isi

- [Tampilan Aplikasi](#tampilan-aplikasi)
- [Fitur Utama](#fitur-utama)
- [Cara Kerja Singkat](#cara-kerja-singkat)
- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [Struktur Database](#struktur-database)
- [Alur Status](#alur-status)
- [Menjalankan di Komputer Sendiri](#menjalankan-di-komputer-sendiri)
- [Environment Variable](#environment-variable)
- [Perintah NPM](#perintah-npm)
- [API Endpoints](#api-endpoints)
- [Catatan Teknis](#catatan-teknis)
- [Deploy ke Vercel](#deploy-ke-vercel)
- [Troubleshooting](#troubleshooting)
- [Keterbatasan dan Rencana Pengembangan](#keterbatasan-dan-rencana-pengembangan)
- [Lisensi](#lisensi)

---

## Tampilan Aplikasi

### Dashboard

Ringkasan bisnis: total revenue, margin, jumlah trip, order, pelanggan, dan daftar trip terbaru.

<div align="center">
  <img src="docs/screenshots/dashboard.png" alt="Dashboard Jastip Tracker" width="100%" />
</div>

### Daftar Trip

Semua perjalanan terlihat lengkap dengan status, jumlah order, revenue, margin, dan tanggal keberangkatan.

<div align="center">
  <img src="docs/screenshots/trips.png" alt="Daftar trip" width="100%" />
</div>

### Detail Trip dan Rute

Setiap trip punya peta interaktif, daftar tempat belanja yang bisa diurutkan, dan daftar order pelanggan.

<div align="center">
  <img src="docs/screenshots/trip-detail.png" alt="Detail trip dengan peta rute dan order" width="100%" />
</div>

### Tambah Order

Satu order bisa berisi banyak item. Harga asing langsung dikonversi ke Rupiah dan margin dihitung otomatis.

<div align="center">
  <img src="docs/screenshots/add-order.png" alt="Form tambah order dengan beberapa item" width="100%" />
</div>

### Tampilan Mobile

Aplikasi dibuat mobile-first. Di HP, navigasi berpindah menjadi bottom bar yang mudah dijangkau.

<div align="center">
  <img src="docs/screenshots/dashboard-mobile.png" alt="Dashboard di mobile" width="270" />
  <img src="docs/screenshots/trip-detail-mobile.png" alt="Detail trip di mobile" width="270" />
  <img src="docs/screenshots/customers-mobile.png" alt="Pelanggan di mobile" width="270" />
</div>

<details>
<summary><strong>Lihat screenshot lainnya</strong> (login, register, pelanggan, detail pelanggan, profil, trip Jogja)</summary>

<br />

**Login**

<img src="docs/screenshots/login.png" alt="Halaman login" width="100%" />

**Register**

<img src="docs/screenshots/register.png" alt="Halaman register" width="100%" />

**Daftar Pelanggan**

<img src="docs/screenshots/customers.png" alt="Daftar pelanggan" width="100%" />

**Detail Pelanggan dan Riwayat Order**

<img src="docs/screenshots/customer-detail.png" alt="Detail pelanggan dengan riwayat order" width="100%" />

**Profil**

<img src="docs/screenshots/settings.png" alt="Halaman profil" width="100%" />

**Contoh Trip dengan Banyak Rute**

<img src="docs/screenshots/trip-detail-jogja.png" alt="Detail trip Jogja dengan rute perjalanan" width="100%" />

**Daftar Trip di Mobile**

<img src="docs/screenshots/trips-mobile.png" alt="Daftar trip di mobile" width="320" />

**Login di Mobile**

<img src="docs/screenshots/login-mobile.png" alt="Login di mobile" width="320" />

</details>

---

## Fitur Utama

### 1. Dashboard yang informatif

Halaman utama menampilkan angka-angka penting tanpa perlu membuka menu lain:

- Total trip dan jumlah trip yang sedang berlangsung
- Total order dan total pelanggan
- Total revenue dalam Rupiah
- Total margin dan **margin rate** (persentase margin terhadap revenue)
- Lima trip terbaru beserta order, revenue, dan margin masing-masing

### 2. Manajemen trip

- Buat trip dengan nama, destinasi (negara **atau** kota), tanggal berangkat, dan tanggal pulang.
- Destinasi bisa diketik bebas dengan bantuan daftar negara, atau diisi nama kota seperti "Jogja" atau "Jakarta".
- Status trip: **Perencanaan**, **Berlangsung**, **Selesai**, dan **Dibatalkan**.
- Edit dan hapus trip langsung dari dashboard atau halaman daftar trip.
- Menghapus trip juga menghapus semua order dan rute di dalamnya (dengan konfirmasi terlebih dahulu).

### 3. Rute perjalanan dengan peta

- Tambahkan tempat belanja ke rute trip lewat pencarian nama tempat atau dengan mengklik peta.
- Pencarian tempat memakai **Nominatim / OpenStreetMap**, jadi tidak perlu API key.
- Setiap tempat bisa diganti nama, diurutkan naik/turun, dan dihapus.
- Peta langsung memperbarui titik dan garis rute saat daftar tempat berubah.
- Order bisa dikaitkan ke salah satu tempat di rute, sehingga ketahuan barang itu dibeli di mana.

### 4. Manajemen order multi-item

- Satu order dapat berisi banyak item sekaligus.
- Pilih pelanggan, pilih tempat belanja (opsional), lalu isi item satu per satu.
- Setiap item punya nama, jumlah, harga satuan dalam mata uang asing, margin per unit, dan catatan.
- Order bisa diedit atau dihapus, dan statusnya bisa diperbarui dari halaman detail trip.
- Total order dihitung otomatis dari seluruh item.

### 5. Manajemen pelanggan

- Simpan nama, nomor HP, email, dan catatan pelanggan.
- Halaman detail pelanggan menampilkan seluruh riwayat order dan total belanja.
- Pelanggan yang masih punya order tidak bisa dihapus, supaya riwayat transaksi tidak hilang.

### 6. Konversi mata uang otomatis

- Harga barang diinput dalam mata uang asing (JPY, KRW, USD, THB, EUR, dan lainnya).
- Kurs diambil dari **Frankfurter API** yang berbasis data Bank Sentral Eropa (ECB).
- Hasil konversi langsung terlihat saat mengisi form order.
- Kurs disimpan di tabel `CurrencyRate` dan dipakai ulang selama **1 jam** untuk menghemat request.
- Nilai Rupiah disimpan saat order dibuat, jadi laporan lama tidak berubah walaupun kurs hari ini berubah.

### 7. Pelacakan modal dan margin

Margin dihitung per unit, bukan sekadar angka total. Rumusnya:

```text
Harga modal per unit (IDR) = harga asing × kurs
Margin baris               = margin per unit × jumlah
Total baris (IDR)          = (harga modal per unit × jumlah) + margin baris
```

Contoh:

| Komponen | Nilai |
|---|---|
| Harga barang | 100 USD |
| Kurs | Rp16.000 / USD |
| Harga modal per unit | Rp1.600.000 |
| Jumlah | 2 |
| Margin per unit | Rp50.000 |
| Margin total | Rp100.000 |
| **Total yang dibayar pelanggan** | **Rp3.300.000** |

Revenue di dashboard adalah jumlah seluruh `totalIDR`, sedangkan margin adalah jumlah seluruh `margin`. Margin rate dihitung dengan:

```text
Margin rate = (total margin ÷ total revenue) × 100%
```

### 8. Autentikasi multi-user

- Register dan login dengan email + password.
- Password di-hash memakai **bcrypt** (cost factor 12), bukan disimpan sebagai teks biasa.
- Sesi memakai **JWT** dari NextAuth.js v5.
- Setiap query API dibatasi ke `userId` yang sedang login, jadi data antar-user tidak bercampur.

### 9. Responsif dan nyaman di HP

- Bottom navigation di mobile, top navigation di desktop.
- Layout menyesuaikan lebar layar dengan container maksimum.
- Ukuran input minimal 16px agar iOS tidak otomatis melakukan zoom saat input difokuskan.
- Tombol dan area sentuh dibuat cukup besar untuk digunakan dengan jempol.

---

## Cara Kerja Singkat

Alur pemakaian yang umum:

1. **Daftar akun** di `/register`, lalu login.
2. **Buat trip** dengan destinasi dan tanggal keberangkatan.
3. **Tambah rute** tempat belanja di halaman detail trip (opsional, tetapi membantu saat belanja).
4. **Tambah pelanggan** yang akan menitip barang.
5. **Buat order** untuk pelanggan tersebut, lalu isi item, harga asing, dan margin.
6. **Perbarui status order** saat barang dipesan, dibayar, dikirim, dan sampai.
7. **Pantau dashboard** untuk melihat revenue dan margin yang sudah terkumpul.
8. Setelah semua beres, ubah status trip menjadi **Selesai**.

Dashboard dan halaman trip akan otomatis menghitung ulang angka setelah ada perubahan.

---

## Tech Stack

| Kategori | Teknologi | Versi |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.10 |
| Bahasa | TypeScript | 5.9.3 |
| UI | React | 19.2.4 |
| Styling | Tailwind CSS v4 | 4.3.2 |
| Database | PostgreSQL (Neon) | pg 8.23.1 |
| Autentikasi | NextAuth.js v5 (Credentials) | 5.0.0-beta.31 |
| Hash password | bcryptjs | 3.0.3 |
| Ikon | Lucide React | 1.24.0 |
| Tanggal | date-fns | 4.4.0 |
| Peta | Leaflet + OpenStreetMap | 1.9.4 |
| Kurs mata uang | Frankfurter API (ECB) | API eksternal |
| Geocoding | Nominatim / OpenStreetMap | API eksternal |

---

## Struktur Proyek

```text
jastip-tracker/
├─ src/
│  ├─ app/
│  │  ├─ (auth)/                 # Halaman login dan register
│  │  │  ├─ layout.tsx           # Panel branding + form
│  │  │  ├─ login/page.tsx
│  │  │  └─ register/page.tsx
│  │  ├─ (dashboard)/            # Halaman yang butuh login
│  │  │  ├─ customers/           # Daftar, tambah, detail, edit pelanggan
│  │  │  ├─ settings/            # Profil dan logout
│  │  │  └─ trips/               # Daftar, tambah, detail, edit trip,
│  │  │                          # tambah/edit order, rute perjalanan
│  │  ├─ api/                    # Route handler (API)
│  │  ├─ globals.css             # Design token dan utility Tailwind
│  │  ├─ layout.tsx              # Root layout
│  │  └─ page.tsx                # Dashboard
│  ├─ components/                # BottomNav, TripMap, CurrencyInput, dll.
│  ├─ lib/                       # auth, db, exchange, destinations
│  └─ types/                     # Tipe TypeScript bersama
├─ sql/
│  ├─ setup.postgres.sql          # Setup lengkap + data demo (PostgreSQL/Neon)
│  ├─ migrate_postgres_camelcase.sql
│  ├─ migrate_margin_selling_price.sql
│  └─ setup.sql, migrate_*.sql    # Legacy SQL Server (tidak dipakai)
├─ docs/screenshots/              # Screenshot untuk README
├─ public/                        # Aset statis
├─ .env.example                   # Contoh environment variable
└─ package.json
```

---

## Struktur Database

### Diagram relasi

```mermaid
erDiagram
    User ||--o{ Customer : "memiliki"
    User ||--o{ Trip : "memiliki"
    Trip ||--o{ Order : "berisi"
    Trip ||--o{ TripStop : "memiliki rute"
    Customer ||--o{ Order : "memesan"
    Order ||--o{ OrderItem : "terdiri dari"
    TripStop |o--o{ Order : "tempat belanja (opsional)"
    CurrencyRate {
        uuid id
        string baseCurrency
        string targetCurrency
        float rate
        timestamp fetchedAt
    }
```

### Penjelasan tabel

| Tabel | Isi |
|---|---|
| `User` | Akun pengguna: `id` UUID, `email` unik, `password` (hash bcrypt), `name`, `createdAt` |
| `Customer` | Pelanggan milik user: `id`, `userId`, `name`, `phone`, `email`, `notes`, `createdAt` |
| `Trip` | Perjalanan: `id`, `userId`, `name`, `country` (negara atau kota), `startDate`, `endDate`, `status`, `createdAt` |
| `TripStop` | Tempat pada rute: `id`, `tripId`, `name`, `latitude`, `longitude`, `orderIndex`, `createdAt` |
| `Order` | Pesanan: `id`, `tripId`, `customerId`, `stopId` (opsional), `status`, `notes`, `receiptUrl`, `createdAt` |
| `OrderItem` | Item pesanan: `id`, `orderId`, `itemName`, `quantity`, `unitPriceForeign`, `currency`, `unitPriceIDR`, `totalIDR`, `margin`, `notes` |
| `CurrencyRate` | Cache kurs: `id`, `baseCurrency`, `targetCurrency`, `rate`, `fetchedAt` (unik per pasangan mata uang) |

### Aturan hapus data

- Hapus **User** → semua `Customer` dan `Trip` miliknya ikut terhapus.
- Hapus **Trip** → semua `Order` dan `TripStop` di dalamnya ikut terhapus.
- Hapus **Order** → semua `OrderItem` di dalamnya ikut terhapus.
- Hapus **TripStop** → `stopId` pada order terkait di-set `NULL`, order tetap ada.
- Hapus **Customer** → ditolak jika pelanggan masih punya order. Hapus ordernya terlebih dahulu.
- Semua ID memakai UUID yang dibuat dengan `gen_random_uuid()`.

> **Penting:** nama kolom memakai **camelCase** dan di-quote, misalnya `"userId"`, `"startDate"`, `"totalIDR"`. Ini menjaga bentuk JSON API tetap konsisten. Saat menulis query SQL manual, jangan lupa meng-quote identifier tersebut.

---

## Alur Status

### Status trip

```text
PLANNING ──► ONGOING ──► COMPLETED
    │            │
    └────────────┴──────► CANCELLED
```

| Status | Arti |
|---|---|
| `PLANNING` | Trip masih direncanakan |
| `ONGOING` | Trip sedang berlangsung |
| `COMPLETED` | Trip sudah selesai |
| `CANCELLED` | Trip dibatalkan |

Aturan yang dijaga oleh API:

- Trip hanya bisa menjadi **COMPLETED** jika tidak ada order berstatus `PENDING` atau `ORDERED`.
- Trip hanya bisa menjadi **CANCELLED** jika tidak ada order berstatus `PAID`.

### Status order

```text
PENDING ──► ORDERED ──► PAID ──► SHIPPED ──► DELIVERED

CANCELLED dapat dipilih selama trip masih PLANNING atau ONGOING.
```

| Status | Arti |
|---|---|
| `PENDING` | Menunggu dipesan |
| `ORDERED` | Sudah dipesan ke toko |
| `PAID` | Sudah dibayar |
| `SHIPPED` | Sedang dikirim |
| `DELIVERED` | Sudah sampai ke pelanggan |
| `CANCELLED` | Dibatalkan |

Aturan yang dijaga oleh API:

- Status order hanya bisa diubah saat trip berstatus **PLANNING** atau **ONGOING**.
- Urutan perubahan status tidak dipaksa oleh aplikasi; dropdown menampilkan semua status yang tersedia agar Anda tetap fleksibel.

---

## Menjalankan di Komputer Sendiri

### 1. Prasyarat

Pastikan sudah terpasang:

- [Node.js](https://nodejs.org/) **v20.9 atau lebih baru** (dibutuhkan Next.js 16). npm sudah otomatis terpasang bersama Node.js.
- [Git](https://git-scm.com/) untuk clone repository.
- Akun [Neon](https://neon.com) untuk database PostgreSQL gratis. Tidak perlu kartu kredit.

Cek versi Node.js:

```bash
node -v
```

Jika versi masih di bawah 20.9, perbarui Node.js terlebih dahulu.

### 2. Clone repository

```bash
git clone https://github.com/username/jastip-tracker.git
cd jastip-tracker
```

Ganti `username` dengan username GitHub Anda.

### 3. Install dependency

```bash
npm install
```

### 4. Siapkan database di Neon

1. Masuk ke [console.neon.tech](https://console.neon.tech) dan buat project baru.
2. Buka **Connection Details** di dashboard Neon.
3. Salin connection string yang memakai host **`-pooler`**, karena aplikasi berjalan di lingkungan serverless. Contoh:

   ```text
   postgresql://user:password@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

4. Buka **SQL Editor** di Neon.
5. Salin isi file [`sql/setup.postgres.sql`](sql/setup.postgres.sql), tempel di SQL Editor, lalu jalankan.

Script setup akan:

- Membuat semua tabel, index, dan foreign key.
- Mengisi data demo: 2 user, 5 pelanggan, 3 trip, 6 order, 14 item order, dan 19 kurs mata uang.

> **Peringatan:** `sql/setup.postgres.sql` menghapus tabel yang sudah ada (`DROP TABLE ... CASCADE`) sebelum membuat ulang. **Jangan jalankan pada database yang sudah berisi data penting.**

Jika database Anda berasal dari versi lama, gunakan migrasi yang sesuai:

| File | Kapan dipakai |
|---|---|
| `sql/migrate_postgres_camelcase.sql` | Database lama yang nama kolomnya masih huruf kecil (`userid`, `tripid`, `totalidr`) |
| `sql/migrate_margin_selling_price.sql` | Data lama yang `totalIDR`-nya belum memasukkan margin |
| `sql/migrate_trip_stop.sql`, `sql/migrate_order_stop.sql`, `sql/setup.sql` | Legacy SQL Server, **tidak dipakai** untuk PostgreSQL |

### 5. Buat file `.env`

Salin contoh dari `.env.example`, lalu sesuaikan isinya:

```bash
cp .env.example .env
```

Di Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Isi `.env`:

```env
DATABASE_URL="postgresql://user:password@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
AUTH_SECRET="hasil-generate-secret"
AUTH_TRUST_HOST="true"

# Opsional
DB_POOL_MAX=5
```

Buat `AUTH_SECRET` baru dengan salah satu perintah berikut:

```bash
# macOS / Linux / Git Bash
openssl rand -base64 32
```

```powershell
# Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 6. Jalankan aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Akun demo

Akun berikut tersedia jika Anda sudah menjalankan `sql/setup.postgres.sql`:

| Email | Password | Nama |
|---|---|---|
| `budi@gmail.com` | `password123` | Budi Santoso |
| `sari@gmail.com` | `password123` | Sari Dewi |

Akun `budi@gmail.com` sudah memiliki data contoh yang lengkap. Anda juga bisa mendaftar akun baru lewat halaman **Register**.

> Jika Anda memakai database yang sudah pernah dipakai, akun demo bisa saja sudah diubah atau dihapus. Gunakan akun yang benar-benar terdaftar di database tersebut, atau daftar akun baru.

> Untuk produksi, jangan gunakan akun demo atau password contoh. Daftar akun baru dan gunakan `AUTH_SECRET` yang berbeda.

---

## Environment Variable

| Variable | Wajib | Deskripsi |
|---|---|---|
| `DATABASE_URL` | Ya | Connection string PostgreSQL. Untuk Neon, gunakan host `-pooler` dan sertakan `?sslmode=require`. |
| `AUTH_SECRET` | Ya | Kunci rahasia untuk menandatangani sesi JWT NextAuth. Buat nilai acak yang panjang. |
| `AUTH_TRUST_HOST` | Disarankan | Set `true` agar NextAuth mempercayai host header. Wajib di Vercel dan sebagian besar hosting lain. |
| `DB_POOL_MAX` | Tidak | Jumlah maksimum koneksi database per instance. Default `5`. |

> Jangan commit file `.env` ke Git. File tersebut sudah masuk `.gitignore`.

---

## Perintah NPM

```bash
npm run dev      # Jalankan development server (hot reload)
npm run build    # Build aplikasi untuk produksi
npm run start    # Jalankan hasil build produksi
npm run lint     # Jalankan ESLint
```

Port default adalah `3000`. Jika port sedang dipakai, jalankan dengan port lain:

```bash
npm run dev -- -p 3001
```

---

## API Endpoints

Semua endpoint di bawah ini memerlukan login, **kecuali** register, handler autentikasi, dan `/api/currency` (kurs dapat diambil tanpa login). Data selalu dibatasi ke user yang sedang login.

| Route | Method | Deskripsi |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | Handler NextAuth (login, logout, session) |
| `/api/auth/register` | POST | Daftar akun baru |
| `/api/dashboard` | GET | Statistik dashboard dan trip terbaru |
| `/api/trips` | GET, POST | Daftar trip / buat trip |
| `/api/trips/[id]` | GET, PATCH, DELETE | Detail trip (beserta order dan total), update, hapus |
| `/api/trips/[id]/stops` | GET, POST | Daftar tempat rute / tambah tempat |
| `/api/trips/[id]/stops/[stopId]` | PATCH, DELETE | Update / hapus tempat rute |
| `/api/customers` | GET, POST | Daftar pelanggan / tambah pelanggan |
| `/api/customers/[id]` | GET, PATCH, DELETE | Detail pelanggan + riwayat order, update, hapus |
| `/api/orders` | POST | Buat order beserta item-itemnya |
| `/api/orders/[id]` | GET, PATCH, DELETE | Detail, update (termasuk item), hapus order |
| `/api/currency` | GET | Ambil kurs, contoh: `/api/currency?from=JPY&to=IDR` |
| `/api/geocode` | GET | Cari tempat (`?q=`) atau reverse geocode (`?reverse=1&lat=&lon=`) |

Contoh request:

```bash
# Ambil kurs JPY ke IDR
curl "http://localhost:3000/api/currency?from=JPY&to=IDR"

# Cari tempat bernama Shibuya
curl "http://localhost:3000/api/geocode?q=Shibuya"
```

Respons error dari API menggunakan bentuk yang konsisten:

```json
{ "error": "Pesan kesalahan dalam bahasa Indonesia" }
```

---

## Catatan Teknis

Beberapa keputusan desain yang perlu diketahui jika Anda ingin mengembangkan aplikasi ini:

1. **Nilai Rupiah disimpan sebagai snapshot.** Saat order dibuat, `unitPriceIDR`, `totalIDR`, dan `margin` dihitung lalu disimpan. Perubahan kurs setelahnya tidak mengubah laporan lama.
2. **Cache kurs 1 jam.** Kurs disimpan di tabel `CurrencyRate`. Jika umurnya kurang dari satu jam, aplikasi memakai nilai cache; jika lebih, aplikasi mengambil kurs baru dari Frankfurter API.
3. **Halaman dashboard adalah client component.** Karena itu `npm run build` tidak membutuhkan koneksi database. Database baru diakses saat aplikasi berjalan dan menerima request.
4. **Query database memakai `pg` langsung**, bukan ORM. Semua identifier camelCase harus di-quote, misalnya `SELECT "userId" FROM "Trip"`.
5. **Upload bukti pembayaran dinonaktifkan.** Vercel tidak mengizinkan penulisan file ke filesystem. Kolom `receiptUrl` tetap ada di database agar bisa dipakai lagi nanti, misalnya dengan Vercel Blob atau S3.
6. **Geocoding memakai Nominatim.** Layanan ini gratis, tetapi memiliki batas pemakaian. Untuk produksi dengan trafik tinggi, pertimbangkan layanan berbayar atau cache hasil pencarian.
7. **Data terisolasi per user.** Setiap endpoint memeriksa kepemilikan resource sebelum membaca atau mengubah data. Jangan menghapus pengecekan ini saat menambah fitur baru.

---

## Deploy ke Vercel

1. Push repository ke GitHub.
2. Buka [vercel.com](https://vercel.com), klik **Add New → Project**, lalu import repository.
3. Pada bagian **Environment Variables**, tambahkan:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_TRUST_HOST=true`
4. Klik **Deploy**. Tidak perlu konfigurasi build tambahan.
5. Setelah deploy selesai, jalankan `sql/setup.postgres.sql` di **SQL Editor Neon** untuk database produksi. **Perhatian:** script ini menghapus data yang ada, jadi hanya jalankan pada database baru.
6. Buka URL produksi, lalu login dengan akun demo atau daftar akun baru.

Catatan Neon free tier:

- Compute otomatis suspend setelah sekitar 5 menit tanpa aktivitas.
- Request pertama setelah idle bisa terasa lebih lambat karena database perlu bangun.
- Gunakan connection string ber-host `-pooler` agar koneksi lebih efisien di lingkungan serverless.

---

## Troubleshooting

### `relation "Trip" does not exist`

Tabel belum dibuat. Jalankan `sql/setup.postgres.sql` di SQL Editor Neon pada database yang benar.

### Gagal konek ke database / `password authentication failed`

- Pastikan `DATABASE_URL` sudah benar dan tidak ada spasi tambahan.
- Jika password mengandung karakter khusus seperti `@`, `:`, `/`, atau `#`, encode karakter tersebut (contoh `@` menjadi `%40`).
- Pastikan host memakai `-pooler` dan connection string memiliki `?sslmode=require`.

### Login selalu gagal dengan akun demo

Data demo belum di-seed, atau email/password salah. Jalankan `sql/setup.postgres.sql` pada database baru, lalu coba lagi dengan `budi@gmail.com` / `password123`.

### Aplikasi terbuka tetapi data kosong

Setiap user memiliki data sendiri. Akun demo `budi@gmail.com` berisi data contoh, sedangkan akun baru akan mulai kosong.

### Peta tidak muncul atau pencarian tempat kosong

Peta dan pencarian memakai layanan OpenStreetMap yang membutuhkan koneksi internet. Jika sedang offline atau layanan sedang dibatasi, peta/pencarian bisa gagal sementara. Coba beberapa saat lagi.

### Build gagal karena environment variable

Pastikan `AUTH_SECRET` tersedia di environment build dan runtime. Untuk Vercel, tambahkan variable tersebut di semua environment yang dipakai (Production, Preview, Development).

### Port 3000 sudah dipakai

```bash
npm run dev -- -p 3001
```

### Perubahan `.env` tidak terbaca

Hentikan dev server (`Ctrl + C`), lalu jalankan `npm run dev` lagi. Next.js membaca environment variable saat server dimulai.

---

## Keterbatasan dan Rencana Pengembangan

Fitur yang belum tersedia:

- Upload bukti pembayaran / struk (kolom database sudah disiapkan).
- Verifikasi email dan fitur lupa password.
- Ekspor laporan ke Excel atau PDF.
- Notifikasi pengingat pembayaran.
- Laporan laba-rugi per periode atau per mata uang.

Ide pengembangan yang cocok berikutnya:

- Menghubungkan `receiptUrl` dengan Vercel Blob.
- Menambahkan filter dan pencarian pada daftar trip serta pelanggan.
- Menambahkan grafik revenue dan margin per bulan.
- Menambahkan peran admin dan staf untuk tim.

---

## Lisensi

MIT License

---

<div align="center">

Dibuat untuk mempermudah bisnis jastip. Selamat mencoba!

</div>
