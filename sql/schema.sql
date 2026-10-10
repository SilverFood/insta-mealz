-- InstaMealz order schema (Turso / SQLite)
-- Apply: turso db shell <db-name> < sql/schema.sql

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  currency TEXT NOT NULL DEFAULT 'INR',
  subtotal_paise INTEGER NOT NULL,
  discount_code TEXT,
  discount_paise INTEGER NOT NULL DEFAULT 0,
  shipping_paise INTEGER NOT NULL DEFAULT 0,
  total_paise INTEGER NOT NULL,
  item_count INTEGER NOT NULL,
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT,
  customer_note TEXT,
  marketing_opt_in INTEGER NOT NULL DEFAULT 0 CHECK (marketing_opt_in IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_delivery_addresses (
  order_id TEXT PRIMARY KEY NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY NOT NULL,
  order_id TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  variant TEXT NOT NULL,
  image_url TEXT,
  unit_price_paise INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total_paise INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_inventory (
  slug TEXT PRIMARY KEY NOT NULL,
  in_stock INTEGER NOT NULL CHECK (in_stock IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS store_settings (
  id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
  accepting_orders INTEGER NOT NULL DEFAULT 1 CHECK (accepting_orders IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders (razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_product_inventory_updated_at ON product_inventory (updated_at);
