-- migrate:up
ALTER TABLE meals ADD COLUMN date DATE;

UPDATE meals SET date = (created_at AT TIME ZONE 'America/Sao_Paulo')::date;

ALTER TABLE meals ALTER COLUMN date SET NOT NULL;

CREATE INDEX idx_meals_date ON meals(date);

-- migrate:down
DROP INDEX idx_meals_date;
ALTER TABLE meals DROP COLUMN date;
