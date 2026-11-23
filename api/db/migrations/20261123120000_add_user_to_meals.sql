-- migrate:up
DELETE FROM meals;

ALTER TABLE meals ADD COLUMN user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX idx_meals_user_id_date ON meals(user_id, date);

-- migrate:down
DROP INDEX idx_meals_user_id_date;

ALTER TABLE meals DROP COLUMN user_id;
