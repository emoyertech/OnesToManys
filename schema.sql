PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS cars;
DROP TABLE IF EXISTS dealerships;

CREATE TABLE dealerships (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT,
    state TEXT
);

CREATE TABLE cars (
    id INTEGER PRIMARY KEY,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER,
    price REAL,
    vin TEXT UNIQUE,
    dealership_id INTEGER NOT NULL,
    FOREIGN KEY (dealership_id) REFERENCES dealerships(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_cars_dealership_id ON cars(dealership_id);
CREATE INDEX idx_cars_year ON cars(year);
