-- Safe column rename with existence checks
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Product' AND column_name = 'images'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'Product' AND column_name = 'image'
        ) THEN
            ALTER TABLE "Product" RENAME COLUMN "images" TO "image";
            RAISE NOTICE '✅ Column renamed from images to image';
        ELSE
            RAISE NOTICE '⚠️ Both columns exist, manual resolution needed';
        END IF;
    ELSE
        RAISE NOTICE 'ℹ️ Column images does not exist, no action needed';
    END IF;
END $$;
