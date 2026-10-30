-- ============================================
-- Migrasi: samakan nama kolom dengan yang dipakai aplikasi (camelCase)
--
-- Database hasil migrasi awal memakai identifier huruf kecil
-- (userid, tripid, totalidr, ...). Aplikasi mengirim/menerima camelCase
-- ("userId", "tripId", "totalIDR", ...), jadi kolom perlu di-rename.
--
-- Aman dijalankan berulang: setiap rename hanya dilakukan jika kolom
-- versi huruf kecil masih ada.
-- ============================================

BEGIN;

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT * FROM (VALUES
            ('User',         'createdat',        'createdAt'),
            ('Customer',     'userid',           'userId'),
            ('Customer',     'createdat',        'createdAt'),
            ('Trip',         'userid',           'userId'),
            ('Trip',         'startdate',        'startDate'),
            ('Trip',         'enddate',          'endDate'),
            ('Trip',         'createdat',        'createdAt'),
            ('TripStop',     'tripid',           'tripId'),
            ('TripStop',     'orderindex',       'orderIndex'),
            ('TripStop',     'createdat',        'createdAt'),
            ('Order',        'tripid',           'tripId'),
            ('Order',        'customerid',       'customerId'),
            ('Order',        'stopid',           'stopId'),
            ('Order',        'receipturl',       'receiptUrl'),
            ('Order',        'createdat',        'createdAt'),
            ('OrderItem',    'orderid',          'orderId'),
            ('OrderItem',    'itemname',         'itemName'),
            ('OrderItem',    'unitpriceforeign', 'unitPriceForeign'),
            ('OrderItem',    'unitpriceidr',     'unitPriceIDR'),
            ('OrderItem',    'totalidr',         'totalIDR'),
            ('CurrencyRate', 'basecurrency',     'baseCurrency'),
            ('CurrencyRate', 'targetcurrency',   'targetCurrency'),
            ('CurrencyRate', 'fetchedat',        'fetchedAt')
        ) AS t(tbl, old_col, new_col)
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = r.tbl AND column_name = r.old_col
        ) THEN
            EXECUTE format('ALTER TABLE %I RENAME COLUMN %I TO %I', r.tbl, r.old_col, r.new_col);
        END IF;
    END LOOP;
END $$;

-- Index untuk kolom foreign key (mempercepat query list/detail).
CREATE INDEX IF NOT EXISTS "IX_Customer_userId" ON "Customer"("userId");
CREATE INDEX IF NOT EXISTS "IX_Trip_userId" ON "Trip"("userId");
CREATE INDEX IF NOT EXISTS "IX_TripStop_tripId" ON "TripStop"("tripId");
CREATE INDEX IF NOT EXISTS "IX_Order_tripId" ON "Order"("tripId");
CREATE INDEX IF NOT EXISTS "IX_Order_customerId" ON "Order"("customerId");
CREATE INDEX IF NOT EXISTS "IX_Order_stopId" ON "Order"("stopId");
CREATE INDEX IF NOT EXISTS "IX_OrderItem_orderId" ON "OrderItem"("orderId");

COMMIT;
