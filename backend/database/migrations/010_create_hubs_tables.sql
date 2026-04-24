ALTER TABLE users ADD COLUMN IF NOT EXISTS karma_score INT DEFAULT 100;
ALTER TABLE users ADD COLUMN IF NOT EXISTS flake_count INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_from_hubs_until TIMESTAMP;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS hub_id INT;

CREATE TABLE IF NOT EXISTS hubs (
    id SERIAL PRIMARY KEY,
    crop_id INT REFERENCES listed_crops(id) ON DELETE CASCADE,
    host_id INT REFERENCES users(id) ON DELETE CASCADE,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    address TEXT,
    target_kg DECIMAL(10,2) NOT NULL,
    current_kg DECIMAL(10,2) DEFAULT 0,
    discount_percentage INT DEFAULT 0,
    deadline TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hub_members (
    id SERIAL PRIMARY KEY,
    hub_id INT REFERENCES hubs(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    pledge_kg DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PLEDGED',
    is_waitlist BOOLEAN DEFAULT false,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hub_id, user_id)
);
