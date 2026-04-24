ALTER TABLE listed_crops ADD COLUMN IF NOT EXISTS is_hub_enabled BOOLEAN DEFAULT false;
ALTER TABLE listed_crops ADD COLUMN IF NOT EXISTS hub_discount_percentage INT DEFAULT 0;
ALTER TABLE listed_crops ADD COLUMN IF NOT EXISTS hub_target_kg DECIMAL(10,2) DEFAULT 0;
