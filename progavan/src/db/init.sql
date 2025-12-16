CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  eth_address VARCHAR(42) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lots (
  id SERIAL PRIMARY KEY,
  token_id INT,
  owner_eth_address VARCHAR(42),
  species TEXT,
  quantity INT,
  coordinates_or_area TEXT,
  vessel TEXT,
  state VARCHAR(50),
  approved BOOLEAN DEFAULT false,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lot_history (
  id SERIAL PRIMARY KEY,
  lot_id INT REFERENCES lots(id) ON DELETE CASCADE,
  step VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  eth_address VARCHAR(42)
);
