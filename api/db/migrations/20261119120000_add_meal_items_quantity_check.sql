-- migrate:up
ALTER TABLE meal_items
    ADD CONSTRAINT meal_items_quantity_positive CHECK (quantity > 0);

-- migrate:down
ALTER TABLE meal_items
    DROP CONSTRAINT meal_items_quantity_positive;
