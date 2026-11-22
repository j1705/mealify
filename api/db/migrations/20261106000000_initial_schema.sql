-- migrate:up
CREATE TYPE unit AS ENUM ('g', 'ml', 'unit');

CREATE TABLE items (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(50) NOT NULL,
    unit          unit NOT NULL,
    calories      NUMERIC NOT NULL,
    protein       NUMERIC NOT NULL,
    carbohydrate  NUMERIC NOT NULL,
    fat           NUMERIC NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE meals (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(50) NOT NULL,
    description   VARCHAR(500),
    calories      NUMERIC NOT NULL,
    protein       NUMERIC NOT NULL,
    carbohydrate  NUMERIC NOT NULL,
    fat           NUMERIC NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE meal_items (
    id            SERIAL PRIMARY KEY,
    meal_id       INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    item_id       INTEGER NOT NULL REFERENCES items(id),
    quantity      NUMERIC NOT NULL
);

CREATE INDEX idx_meal_items_meal_id ON meal_items(meal_id);
CREATE INDEX idx_meal_items_item_id ON meal_items(item_id);

-- migrate:down
DROP TABLE meal_items;
DROP TABLE meals;
DROP TABLE items;
DROP TYPE unit;
