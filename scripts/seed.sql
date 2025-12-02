-- Seed script for Painter Assist database
-- Run this in your Vercel Postgres SQL editor after running schema.sql
-- Or use the TypeScript seed script: pnpm seed

-- Clear existing data (optional - comment out if you want to keep existing data)
DELETE FROM estimate_item_materials;
DELETE FROM estimate_items;
DELETE FROM estimates;
DELETE FROM outputs;
DELETE FROM scenarios;
DELETE FROM surfaces;
DELETE FROM project_types;
DELETE FROM materials;

-- Seed Project Types
INSERT INTO project_types (id, name, display_name, created_at, updated_at) VALUES
  ('pt_1', 'InteriorRepaint', 'Interior Repaint', NOW(), NOW()),
  ('pt_2', 'NewConstruction', 'New Construction', NOW(), NOW()),
  ('pt_3', 'ExteriorRepaint', 'Exterior Repaint', NOW(), NOW());

-- Seed Surfaces
INSERT INTO surfaces (id, project_type_id, name, display_name, created_at, updated_at) VALUES
  ('s_1', 'pt_1', 'CeilingsRepaint', 'Ceilings Repaint', NOW(), NOW()),
  ('s_2', 'pt_2', 'NewWalls', 'New Walls', NOW(), NOW()),
  ('s_3', 'pt_3', 'VerticalSidingRefinish', 'Vertical Siding Refinish', NOW(), NOW());

-- Seed Scenarios
INSERT INTO scenarios (id, surface_id, name, display_name, created_at, updated_at) VALUES
  ('sc_1', 's_1', 'LowVolumeNineOrTenFoot', 'Low Volume Nine or Ten Foot Ceiling Repaint', NOW(), NOW()),
  ('sc_2', 's_2', 'TapeCaulkTwoCoatDetailedTrim', 'Tape, Caulk, and Two Coat 8-10ft Walls with Detailed Trim', NOW(), NOW()),
  ('sc_3', 's_2', 'TapeCaulkTwoCoatSimpleTrim', 'Tape, Caulk, and Two Coat 8-10ft Walls with Simple Trim', NOW(), NOW()),
  ('sc_4', 's_2', 'StainAndClearSingleLightWindows', 'Stain and Clear New Single Light Windows', NOW(), NOW()),
  ('sc_5', 's_3', 'PrimeAndPaintVerticalLapSiding', 'Prime and Paint Vertical Lap Siding', NOW(), NOW());

-- Seed Outputs
-- NOTE: Update these output values with actual values from your template
INSERT INTO outputs (id, scenario_id, output_value, output_unit, created_at, updated_at) VALUES
  ('o_1', 'sc_1', 100.00, 'sq_ft', NOW(), NOW()),
  ('o_2', 'sc_2', 80.00, 'sq_ft', NOW(), NOW()),
  ('o_3', 'sc_3', 100.00, 'sq_ft', NOW(), NOW()),
  ('o_4', 'sc_4', 10.00, 'units', NOW(), NOW()),
  ('o_5', 'sc_5', 150.00, 'sq_ft', NOW(), NOW());

-- Seed Materials
INSERT INTO materials (id, name, display_name, unit, cost_per_unit, created_at, updated_at) VALUES
  ('m_1', 'PaintGallon', 'Paint (Gallon)', 'gallon', 50.00, NOW(), NOW()),
  ('m_2', 'PrimerGallon', 'Primer (Gallon)', 'gallon', 35.00, NOW(), NOW()),
  ('m_3', 'CaulkTube', 'Caulk (Tube)', 'tube', 8.00, NOW(), NOW()),
  ('m_4', 'TapeRoll', 'Tape (Roll)', 'roll', 5.00, NOW(), NOW()),
  ('m_5', 'StainQuart', 'Stain (Quart)', 'quart', 25.00, NOW(), NOW()),
  ('m_6', 'ClearCoatQuart', 'Clear Coat (Quart)', 'quart', 30.00, NOW(), NOW());

