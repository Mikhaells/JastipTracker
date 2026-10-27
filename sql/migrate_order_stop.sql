-- ============================================
-- Jastip Tracker - Migration: Order.stopId
-- Menghubungkan order dengan tempat (TripStop)
-- yang sudah disimpan pada rute trip.
-- Dapat dijalankan berulang kali (idempotent).
-- ============================================

USE jastip_tracker;
GO

-- Pastikan tabel TripStop tersedia
IF OBJECT_ID('TripStop', 'U') IS NULL
BEGIN
    CREATE TABLE TripStop (
        id          NVARCHAR(36) PRIMARY KEY DEFAULT (NEWID()),
        tripId      NVARCHAR(36) NOT NULL,
        name        NVARCHAR(255) NOT NULL,
        latitude    FLOAT NOT NULL,
        longitude   FLOAT NOT NULL,
        orderIndex  INT NOT NULL DEFAULT 0,
        createdAt   DATETIME2 NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT FK_TripStop_Trip FOREIGN KEY (tripId) REFERENCES Trip(id) ON DELETE CASCADE
    );

    CREATE INDEX IX_TripStop_tripId ON TripStop(tripId);

    PRINT 'Tabel TripStop berhasil dibuat';
END
GO

-- Tambahkan kolom stopId pada [Order]
IF COL_LENGTH('[Order]', 'stopId') IS NULL
BEGIN
    ALTER TABLE [Order] ADD stopId NVARCHAR(36) NULL;
    PRINT 'Kolom Order.stopId berhasil ditambahkan';
END
ELSE
BEGIN
    PRINT 'Kolom Order.stopId sudah ada, tidak ada perubahan';
END
GO

-- Tambahkan foreign key ke TripStop
IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Order_TripStop'
)
BEGIN
    ALTER TABLE [Order]
        ADD CONSTRAINT FK_Order_TripStop
        FOREIGN KEY (stopId) REFERENCES TripStop(id);

    PRINT 'Foreign key FK_Order_TripStop berhasil dibuat';
END
ELSE
BEGIN
    PRINT 'Foreign key FK_Order_TripStop sudah ada, tidak ada perubahan';
END
GO

-- Tambahkan index untuk pencarian berdasarkan stop
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_Order_stopId'
      AND object_id = OBJECT_ID('[Order]')
)
BEGIN
    CREATE INDEX IX_Order_stopId ON [Order](stopId);
    PRINT 'Index IX_Order_stopId berhasil dibuat';
END
ELSE
BEGIN
    PRINT 'Index IX_Order_stopId sudah ada, tidak ada perubahan';
END
GO

PRINT 'Migration Order.stopId selesai';
GO
