-- Radar Passagens — Schema

CREATE TABLE IF NOT EXISTS flight_searches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin        CHAR(3)     NOT NULL,
  destination   CHAR(3)     NOT NULL,
  departure     DATE        NOT NULL,
  return_date   DATE,
  adults        SMALLINT    NOT NULL DEFAULT 1,
  cabin_class   VARCHAR(20) NOT NULL DEFAULT 'economy',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flights (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id           UUID REFERENCES flight_searches(id) ON DELETE CASCADE,
  provider            VARCHAR(50)  NOT NULL,
  origin              CHAR(3)      NOT NULL,
  destination         CHAR(3)      NOT NULL,
  departure_date      DATE         NOT NULL,
  return_date         DATE,
  airline_iata        CHAR(2)      NOT NULL,
  airline_name        VARCHAR(100) NOT NULL,
  flight_number       VARCHAR(10),
  outbound_departure  TIMESTAMPTZ  NOT NULL,
  outbound_arrival    TIMESTAMPTZ  NOT NULL,
  outbound_duration   INTEGER      NOT NULL,  -- minutes
  outbound_stops      SMALLINT     NOT NULL DEFAULT 0,
  inbound_departure   TIMESTAMPTZ,
  inbound_arrival     TIMESTAMPTZ,
  inbound_duration    INTEGER,
  inbound_stops       SMALLINT,
  price               NUMERIC(10,2) NOT NULL,
  currency            CHAR(3)       NOT NULL DEFAULT 'BRL',
  link                TEXT          NOT NULL,
  opportunity         VARCHAR(20)   NOT NULL,
  opportunity_score   SMALLINT      NOT NULL,
  pct_vs_average      SMALLINT,
  average_price       NUMERIC(10,2),
  scraped_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Price history for scoring intelligence
CREATE TABLE IF NOT EXISTS price_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin        CHAR(3)       NOT NULL,
  destination   CHAR(3)       NOT NULL,
  travel_month  CHAR(7)       NOT NULL,  -- YYYY-MM
  avg_price     NUMERIC(10,2) NOT NULL,
  min_price     NUMERIC(10,2) NOT NULL,
  max_price     NUMERIC(10,2) NOT NULL,
  sample_count  INTEGER       NOT NULL DEFAULT 1,
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (origin, destination, travel_month)
);

CREATE INDEX IF NOT EXISTS idx_flights_search_id    ON flights (search_id);
CREATE INDEX IF NOT EXISTS idx_flights_origin_dest  ON flights (origin, destination);
CREATE INDEX IF NOT EXISTS idx_flights_scraped_at   ON flights (scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_route  ON price_history (origin, destination, travel_month);
CREATE INDEX IF NOT EXISTS idx_searches_created     ON flight_searches (created_at DESC);

-- Price alerts
CREATE TABLE IF NOT EXISTS price_alerts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT NOT NULL,
  origin           CHAR(3) NOT NULL,
  destination      CHAR(3) NOT NULL,
  target_price     INTEGER NOT NULL,
  is_round_trip    BOOLEAN NOT NULL DEFAULT FALSE,
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  token            UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_notified_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alerts_active ON price_alerts (active, origin, destination);
CREATE INDEX IF NOT EXISTS idx_alerts_email  ON price_alerts (email);
