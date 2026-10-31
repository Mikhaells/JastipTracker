-- ============================================
-- Migrasi: harga satuan = modal, margin ditambahkan di atasnya
--
-- Sebelumnya:
--   totalIDR = unitPriceIDR * quantity          (belum termasuk margin)
--
-- Sekarang:
--   totalIDR = unitPriceIDR * quantity + margin (modal + margin)
--
-- Jalankan sekali pada database yang sudah berisi data lama.
-- Aman dijalankan berulang: hanya baris yang totalIDR-nya masih sama
-- dengan harga modal x quantity (dan margin-nya tidak nol) yang diupdate.
-- ============================================

BEGIN;

UPDATE "OrderItem"
SET "totalIDR" = "unitPriceIDR" * "quantity" + "margin"
WHERE "margin" <> 0
  AND ABS("totalIDR" - "unitPriceIDR" * "quantity") < 0.01;

COMMIT;
