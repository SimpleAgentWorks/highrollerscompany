-- Migration: Auto Detailing Tables
-- Run in Supabase SQL Editor

-- ── Detailing Slots (admin-managed available date/time slots) ─────────────────
CREATE TABLE IF NOT EXISTS detailing_slots (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_date       DATE        NOT NULL,
  time_slot       TEXT        NOT NULL CHECK (time_slot IN ('morning', 'afternoon')),
  max_vehicles    INTEGER     NOT NULL DEFAULT 4,
  booked_vehicles INTEGER     NOT NULL DEFAULT 0,
  location_label  TEXT        NOT NULL DEFAULT 'Customer Site',
  is_available    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS detailing_slots_date ON detailing_slots (slot_date);

-- ── Detailing Bookings ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS detailing_bookings (
  id                      UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id                 UUID        REFERENCES detailing_slots(id),
  customer_name            TEXT        NOT NULL,
  customer_phone          TEXT        NOT NULL,
  customer_email          TEXT,
  address                 TEXT,
  city                    TEXT,
  state                   TEXT,
  zip                     TEXT,
  vehicles                JSONB       NOT NULL,  -- [{type, package, wax}]
  electrical_option       TEXT        NOT NULL DEFAULT 'customer', -- 'customer' | 'hr_brings'
  water_option            TEXT        NOT NULL DEFAULT 'customer',  -- 'customer' | 'hr_brings'
  total_price             INTEGER     NOT NULL,  -- in cents
  status                  TEXT        NOT NULL DEFAULT 'pending',
  google_calendar_event_id TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS detailing_bookings_slot ON detailing_bookings (slot_id);
CREATE INDEX IF NOT EXISTS detailing_bookings_status ON detailing_bookings (status);

-- ── Auto-update booked_vehicles on detailing_slots ────────────────────────────
CREATE OR REPLACE FUNCTION update_booked_vehicles()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE detailing_slots
    SET booked_vehicles = booked_vehicles + (SELECT SUM(jsonb_array_length(vehicles)) FROM detailing_bookings WHERE id = NEW.id)
    WHERE id = NEW.slot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS detailing_booking_vehicles ON detailing_bookings;
CREATE TRIGGER detailing_booking_vehicles
  AFTER INSERT ON detailing_bookings
  FOR EACH ROW EXECUTE FUNCTION update_booked_vehicles();
