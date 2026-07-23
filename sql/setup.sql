-- ============================================
-- Jastip Tracker - Database Setup
-- Password semua user: password123
-- ============================================

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'jastip_tracker')
BEGIN
    CREATE DATABASE jastip_tracker;
END
GO

USE jastip_tracker;
GO

-- ============================================
-- Hapus tabel lama jika ada (reverse order)
-- ============================================
IF OBJECT_ID('OrderItem', 'U') IS NOT NULL DROP TABLE OrderItem;
IF OBJECT_ID('[Order]', 'U') IS NOT NULL DROP TABLE [Order];
IF OBJECT_ID('Trip', 'U') IS NOT NULL DROP TABLE Trip;
IF OBJECT_ID('Customer', 'U') IS NOT NULL DROP TABLE Customer;
IF OBJECT_ID('CurrencyRate', 'U') IS NOT NULL DROP TABLE CurrencyRate;
IF OBJECT_ID('[User]', 'U') IS NOT NULL DROP TABLE [User];
GO

-- ============================================
-- Buat Tabel
-- ============================================

CREATE TABLE [User] (
    id          NVARCHAR(36) PRIMARY KEY DEFAULT (NEWID()),
    email       NVARCHAR(255) NOT NULL UNIQUE,
    password    NVARCHAR(255) NOT NULL,
    name        NVARCHAR(255) NOT NULL,
    createdAt   DATETIME2 NOT NULL DEFAULT (GETDATE())
);
GO

CREATE TABLE Customer (
    id          NVARCHAR(36) PRIMARY KEY DEFAULT (NEWID()),
    userId      NVARCHAR(36) NOT NULL,
    name        NVARCHAR(255) NOT NULL,
    phone       NVARCHAR(50) NULL,
    email       NVARCHAR(255) NULL,
    notes       NVARCHAR(MAX) NULL,
    createdAt   DATETIME2 NOT NULL DEFAULT (GETDATE()),
    CONSTRAINT FK_Customer_User FOREIGN KEY (userId) REFERENCES [User](id) ON DELETE CASCADE
);
GO

CREATE TABLE Trip (
    id          NVARCHAR(36) PRIMARY KEY DEFAULT (NEWID()),
    userId      NVARCHAR(36) NOT NULL,
    name        NVARCHAR(255) NOT NULL,
    country     NVARCHAR(100) NOT NULL,
    startDate   DATETIME2 NOT NULL,
    endDate     DATETIME2 NULL,
    status      NVARCHAR(50) NOT NULL DEFAULT 'PLANNING',
    createdAt   DATETIME2 NOT NULL DEFAULT (GETDATE()),
    CONSTRAINT FK_Trip_User FOREIGN KEY (userId) REFERENCES [User](id) ON DELETE CASCADE
);
GO

CREATE TABLE [Order] (
    id          NVARCHAR(36) PRIMARY KEY DEFAULT (NEWID()),
    tripId      NVARCHAR(36) NOT NULL,
    customerId  NVARCHAR(36) NOT NULL,
    status      NVARCHAR(50) NOT NULL DEFAULT 'PENDING',
    notes       NVARCHAR(MAX) NULL,
    receiptUrl  NVARCHAR(500) NULL,
    createdAt   DATETIME2 NOT NULL DEFAULT (GETDATE()),
    CONSTRAINT FK_Order_Trip FOREIGN KEY (tripId) REFERENCES Trip(id) ON DELETE CASCADE,
    CONSTRAINT FK_Order_Customer FOREIGN KEY (customerId) REFERENCES Customer(id)
);
GO

CREATE TABLE OrderItem (
    id               NVARCHAR(36) PRIMARY KEY DEFAULT (NEWID()),
    orderId          NVARCHAR(36) NOT NULL,
    itemName         NVARCHAR(255) NOT NULL,
    quantity         INT NOT NULL DEFAULT 1,
    unitPriceForeign FLOAT NOT NULL,
    currency         NVARCHAR(10) NOT NULL,
    unitPriceIDR     FLOAT NOT NULL,
    totalIDR         FLOAT NOT NULL,
    margin           FLOAT NOT NULL DEFAULT 0,
    notes            NVARCHAR(MAX) NULL,
    CONSTRAINT FK_OrderItem_Order FOREIGN KEY (orderId) REFERENCES [Order](id) ON DELETE CASCADE
);
GO

CREATE TABLE CurrencyRate (
    id             NVARCHAR(36) PRIMARY KEY DEFAULT (NEWID()),
    baseCurrency   NVARCHAR(10) NOT NULL,
    targetCurrency NVARCHAR(10) NOT NULL,
    rate           FLOAT NOT NULL,
    fetchedAt      DATETIME2 NOT NULL DEFAULT (GETDATE()),
    CONSTRAINT UQ_CurrencyRate UNIQUE (baseCurrency, targetCurrency)
);
GO

CREATE INDEX IX_Customer_userId ON Customer(userId);
CREATE INDEX IX_Trip_userId ON Trip(userId);
CREATE INDEX IX_Order_tripId ON [Order](tripId);
CREATE INDEX IX_Order_customerId ON [Order](customerId);
CREATE INDEX IX_OrderItem_orderId ON OrderItem(orderId);
GO

-- ============================================
-- Data Dummy (semua dalam 1 batch, tanpa GO)
-- ============================================
INSERT INTO [User] (id, email, password, name, createdAt) VALUES
('A1B2C3D4-E5F6-7890-ABCD-EF1234567890', 'budi@gmail.com', '$2b$12$IATqM0OZGwnwtkcOr7C3Yu6DfUrLfXeg9N9XSTM1pKzCiEw5/H0D.', 'Budi Santoso', '2025-01-15 08:00:00'),
('F9E8D7C6-B5A4-3210-FEDC-BA0987654321', 'sari@gmail.com',  '$2b$12$IATqM0OZGwnwtkcOr7C3Yu6DfUrLfXeg9N9XSTM1pKzCiEw5/H0D.', 'Sari Dewi', '2025-02-01 09:30:00');

INSERT INTO Customer (id, userId, name, phone, email, notes, createdAt) VALUES
('11111111-1111-1111-1111-111111111111', 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890', 'Andi Wijaya',    '081234567890', 'andi@gmail.com',   'Pelanggan setia, suka beli kosmetik Korea', '2025-02-10 10:00:00'),
('22222222-2222-2222-2222-222222222222', 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890', 'Rina Marlina',   '085678901234', 'rina@gmail.com',   'Pembeli tas branded', '2025-02-15 14:00:00'),
('33333333-3333-3333-3333-333333333333', 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890', 'Dedi Kurniawan', '087890123456', 'dedi@gmail.com',   'Suka beli elektronik Jepang', '2025-03-01 09:00:00'),
('44444444-4444-4444-4444-444444444444', 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890', 'Maya Putri',     '082345678901', 'maya@gmail.com',   NULL, '2025-03-10 11:00:00'),
('55555555-5555-5555-5555-555555555555', 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890', 'Tommy Salim',    '083456789012', 'tommy@gmail.com',  'Langganan vitamin & suplemen', '2025-03-20 08:30:00');

INSERT INTO Trip (id, userId, name, country, startDate, endDate, status, createdAt) VALUES
('AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE', 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890', 'Jepang Maret 2025',  'Jepang',       '2025-03-15', '2025-03-25', 'ONGOING',  '2025-02-20 10:00:00'),
('1111AAAA-2222-BBBB-3333-CCCC4444DDDD', 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890', 'Korea April 2025',   'Korea Selatan','2025-04-10', '2025-04-18', 'PLANNING', '2025-03-01 14:00:00'),
('FFFFAAAA-BBBB-CCCC-DDDD-EEEEEEEEFFFF', 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890', 'Thailand Mei 2025',  'Thailand',     '2025-05-05', NULL,         'PLANNING', '2025-03-25 09:00:00');

INSERT INTO [Order] (id, tripId, customerId, status, notes, receiptUrl, createdAt) VALUES
('AAAAAAAA-1111-2222-3333-444455556666', 'AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE', '11111111-1111-1111-1111-111111111111', 'CONFIRMED', 'Minta wrap bubble untuk skincare', NULL, '2025-03-01 10:00:00'),
('BBBBBBBB-1111-2222-3333-444455556666', 'AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE', '33333333-3333-3333-3333-333333333333', 'SHIPPED',  'Tas ransel kamera', NULL, '2025-03-02 11:00:00'),
('CCCCCCCC-1111-2222-3333-444455556666', 'AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE', '44444444-4444-4444-4444-444444444444', 'PENDING',  NULL, NULL, '2025-03-05 09:00:00'),
('DDDDDDDD-1111-2222-3333-444455556666', '1111AAAA-2222-BBBB-3333-CCCC4444DDDD', '11111111-1111-1111-1111-111111111111', 'PENDING',  'Paket skincare Korea lengkap', NULL, '2025-03-10 14:00:00'),
('EEEEEEEE-1111-2222-3333-444455556666', '1111AAAA-2222-BBBB-3333-CCCC4444DDDD', '22222222-2222-2222-2222-222222222222', 'PENDING',  'Tas Coach & MK', NULL, '2025-03-12 10:00:00'),
('FFFFFFFF-1111-2222-3333-444455556666', 'FFFFAAAA-BBBB-CCCC-DDDD-EEEEEEEEFFFF', '55555555-5555-5555-5555-555555555555', 'PENDING',  'Vitamin dari Boots Pharmacy', NULL, '2025-03-28 08:00:00');

INSERT INTO OrderItem (id, orderId, itemName, quantity, unitPriceForeign, currency, unitPriceIDR, totalIDR, margin, notes) VALUES
-- Order 1: Skincare Jepang untuk Andi
('AA000001-0000-0000-0000-000000000001', 'AAAAAAAA-1111-2222-3333-444455556666', 'Shiseido Ultimune 50ml',      2, 8500,  'JPY', 925000,  1850000, 50000,  'Petugas toko bilang diskon 10%'),
('AA000001-0000-0000-0000-000000000002', 'AAAAAAAA-1111-2222-3333-444455556666', 'SK-II Facial Treatment 75ml',  1, 15000, 'JPY', 1650000, 1650000, 75000, NULL),
('AA000001-0000-0000-0000-000000000003', 'AAAAAAAA-1111-2222-3333-444455556666', 'DHC Lip Cream 3pcs',           3, 700,   'JPY', 77000,   231000,  15000, NULL),
-- Order 2: Tas kamera untuk Dedi
('BB000001-0000-0000-0000-000000000001', 'BBBBBBBB-1111-2222-3333-444455556666', 'Peak Design Travel Backpack 30L', 1, 28900, 'JPY', 3100000, 3100000, 150000, 'Warna hitam, ready stock'),
('BB000001-0000-0000-0000-000000000002', 'BBBBBBBB-1111-2222-3333-444455556666', 'Sony WH-1000XM5',               1, 44000, 'JPY', 4750000, 4750000, 200000, 'Garansi internasional'),
-- Order 3: Aksesoris untuk Maya
('CC000001-0000-0000-0000-000000000001', 'CCCCCCCC-1111-2222-3333-444455556666', 'Gel Pens Pilot 10pcs set',      2, 550,  'JPY', 60000,  120000, 10000, NULL),
('CC000001-0000-0000-0000-000000000002', 'CCCCCCCC-1111-2222-3333-444455556666', 'Tsum Tsum mini pouch',           1, 1200, 'JPY', 130000, 130000, 15000, 'Pilih motif sakura'),
-- Order 4: Skincare Korea untuk Andi
('DD000001-0000-0000-0000-000000000001', 'DDDDDDDD-1111-2222-3333-444455556666', 'COSRX Snail Mucin 96%',         2, 21000, 'KRW', 240000, 480000, 30000, NULL),
('DD000001-0000-0000-0000-000000000002', 'DDDDDDDD-1111-2222-3333-444455556666', 'Laneige Lip Sleeping Mask',      2, 25000, 'KRW', 280000, 560000, 25000, 'Rasa berry & vanilla'),
('DD000001-0000-0000-0000-000000000003', 'DDDDDDDD-1111-2222-3333-444455556666', 'Innisfree Green Tea Serum',      1, 32000, 'KRW', 360000, 360000, 20000, NULL),
-- Order 5: Tas untuk Rina
('EE000001-0000-0000-0000-000000000001', 'EEEEEEEE-1111-2222-3333-444455556666', 'Coach Tabby 26',                 1, 350,   'USD', 5600000, 5600000, 300000, 'Warna kulit coklat'),
('EE000001-0000-0000-0000-000000000002', 'EEEEEEEE-1111-2222-3333-444455556666', 'Michael Kors Jet Set',           1, 198,   'USD', 3170000, 3170000, 200000, NULL),
-- Order 6: Vitamin untuk Tommy
('FF000001-0000-0000-0000-000000000001', 'FFFFFFFF-1111-2222-3333-444455556666', 'Blackmores Fish Oil 1000mg',     3, 299,   'THB', 140000, 420000, 25000, 'Exp 2027'),
('FF000001-0000-0000-0000-000000000002', 'FFFFFFFF-1111-2222-3333-444455556666', 'Centrum Silver 50+ 30pcs',       2, 590,   'THB', 280000, 560000, 35000, NULL);

INSERT INTO CurrencyRate (id, baseCurrency, targetCurrency, rate, fetchedAt) VALUES
(NEWID(), 'JPY', 'IDR', 110,   '2025-03-28 08:00:00'),
(NEWID(), 'KRW', 'IDR', 11.5,  '2025-03-28 08:00:00'),
(NEWID(), 'USD', 'IDR', 16000, '2025-03-28 08:00:00'),
(NEWID(), 'THB', 'IDR', 470,   '2025-03-28 08:00:00'),
(NEWID(), 'SGD', 'IDR', 12000, '2025-03-28 08:00:00'),
(NEWID(), 'MYR', 'IDR', 3600,  '2025-03-28 08:00:00'),
(NEWID(), 'EUR', 'IDR', 17200, '2025-03-28 08:00:00'),
(NEWID(), 'GBP', 'IDR', 20500, '2025-03-28 08:00:00'),
(NEWID(), 'AUD', 'IDR', 10500, '2025-03-28 08:00:00'),
(NEWID(), 'CNY', 'IDR', 2200,  '2025-03-28 08:00:00'),
(NEWID(), 'HKD', 'IDR', 2050,  '2025-03-28 08:00:00'),
(NEWID(), 'TWD', 'IDR', 500,   '2025-03-28 08:00:00'),
(NEWID(), 'PHP', 'IDR', 280,   '2025-03-28 08:00:00'),
(NEWID(), 'VND', 'IDR', 640,   '2025-03-28 08:00:00'),
(NEWID(), 'AED', 'IDR', 4350,  '2025-03-28 08:00:00'),
(NEWID(), 'SAR', 'IDR', 4270,  '2025-03-28 08:00:00'),
(NEWID(), 'QAR', 'IDR', 4400,  '2025-03-28 08:00:00'),
(NEWID(), 'KWD', 'IDR', 52000, '2025-03-28 08:00:00'),
(NEWID(), 'BND', 'IDR', 12000, '2025-03-28 08:00:00');

PRINT '==========================================';
PRINT 'Database jastip_tracker siap digunakan!';
PRINT 'Akun login:';
PRINT '  Email: budi@gmail.com  | Password: password123';
PRINT '  Email: sari@gmail.com  | Password: password123';
PRINT '==========================================';
GO
