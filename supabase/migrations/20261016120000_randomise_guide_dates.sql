/*
# Randomise guide published dates

Spreads every guide's `last_updated` date across a random day between
2 and 3 months before the date this migration runs (61–92 days back).
Each row gets its own random value.
*/

UPDATE guides
SET last_updated = CURRENT_DATE - (61 + floor(random() * 32))::int;
