-- ============================================
-- Jastip Tracker - Migration: Tabel TripStop
-- Tambahkan rute tempat (stop) pada trip.
-- Dapat dijalankan berulang kali (idempotent).
-- ============================================

USE jastip_tracker;
GO

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
ELSE
BEGIN
    PRINT 'Tabel TripStop sudah ada, tidak ada perubahan';
END
GO