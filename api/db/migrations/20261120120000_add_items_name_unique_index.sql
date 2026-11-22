-- migrate:up
CREATE UNIQUE INDEX items_name_lower_key ON items (lower(name));

-- migrate:down
DROP INDEX items_name_lower_key;
