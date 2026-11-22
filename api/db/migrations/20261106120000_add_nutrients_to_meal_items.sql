-- migrate:up
ALTER TABLE meal_items
    ADD COLUMN calories     NUMERIC,
    ADD COLUMN protein      NUMERIC,
    ADD COLUMN carbohydrate NUMERIC,
    ADD COLUMN fat          NUMERIC;

UPDATE meal_items mi
SET calories     = i.calories     * mi.quantity / b.base,
    protein      = i.protein      * mi.quantity / b.base,
    carbohydrate = i.carbohydrate * mi.quantity / b.base,
    fat          = i.fat          * mi.quantity / b.base
FROM items i
CROSS JOIN LATERAL (SELECT CASE WHEN i.unit = 'unit' THEN 1 ELSE 100 END AS base) b
WHERE i.id = mi.item_id;

ALTER TABLE meal_items
    ALTER COLUMN calories     SET NOT NULL,
    ALTER COLUMN protein      SET NOT NULL,
    ALTER COLUMN carbohydrate SET NOT NULL,
    ALTER COLUMN fat          SET NOT NULL;

-- migrate:down
ALTER TABLE meal_items
    DROP COLUMN calories,
    DROP COLUMN protein,
    DROP COLUMN carbohydrate,
    DROP COLUMN fat;
