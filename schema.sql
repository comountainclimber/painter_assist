-- Painter Assist Database Schema for Vercel Postgres
-- Run this in your Vercel Postgres database

-- Project Types (e.g., InteriorRepaint, NewConstruction, ExteriorRepaint)
CREATE TABLE IF NOT EXISTS project_types (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Surfaces (e.g., CeilingsRepaint, NewWalls, VerticalSidingRefinish)
CREATE TABLE IF NOT EXISTS surfaces (
  id VARCHAR(255) PRIMARY KEY,
  project_type_id VARCHAR(255) NOT NULL REFERENCES project_types(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(project_type_id, name)
);

-- Scenarios/Conditions
CREATE TABLE IF NOT EXISTS scenarios (
  id VARCHAR(255) PRIMARY KEY,
  surface_id VARCHAR(255) NOT NULL REFERENCES surfaces(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(surface_id, name)
);

-- Output Master Sheet - defines outputs for each scenario
CREATE TABLE IF NOT EXISTS outputs (
  id VARCHAR(255) PRIMARY KEY,
  scenario_id VARCHAR(255) NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  output_value DECIMAL(10, 2) NOT NULL,
  output_unit VARCHAR(50) NOT NULL, -- 'units', 'sq_ft', 'linear_ft'
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(scenario_id)
);

-- Materials
CREATE TABLE IF NOT EXISTS materials (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  unit VARCHAR(50) NOT NULL, -- 'sq_ft', 'linear_ft', 'units', 'gallon', etc.
  cost_per_unit DECIMAL(10, 2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Estimates
CREATE TABLE IF NOT EXISTS estimates (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Estimate Items
CREATE TABLE IF NOT EXISTS estimate_items (
  id VARCHAR(255) PRIMARY KEY,
  estimate_id VARCHAR(255) NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  project_type_id VARCHAR(255) NOT NULL REFERENCES project_types(id),
  surface_id VARCHAR(255) NOT NULL REFERENCES surfaces(id),
  scenario_id VARCHAR(255) NOT NULL REFERENCES scenarios(id),
  output_id VARCHAR(255) REFERENCES outputs(id),
  size DECIMAL(10, 2) NOT NULL,
  output_value DECIMAL(10, 2),
  output_unit VARCHAR(50),
  cost_code VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Estimate Item Materials (many-to-many relationship)
CREATE TABLE IF NOT EXISTS estimate_item_materials (
  id VARCHAR(255) PRIMARY KEY,
  estimate_item_id VARCHAR(255) NOT NULL REFERENCES estimate_items(id) ON DELETE CASCADE,
  material_id VARCHAR(255) NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(estimate_item_id, material_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_surfaces_project_type_id ON surfaces(project_type_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_surface_id ON scenarios(surface_id);
CREATE INDEX IF NOT EXISTS idx_outputs_scenario_id ON outputs(scenario_id);
CREATE INDEX IF NOT EXISTS idx_estimate_items_estimate_id ON estimate_items(estimate_id);
CREATE INDEX IF NOT EXISTS idx_estimate_items_project_type_id ON estimate_items(project_type_id);
CREATE INDEX IF NOT EXISTS idx_estimate_items_surface_id ON estimate_items(surface_id);
CREATE INDEX IF NOT EXISTS idx_estimate_items_scenario_id ON estimate_items(scenario_id);
CREATE INDEX IF NOT EXISTS idx_estimate_item_materials_estimate_item_id ON estimate_item_materials(estimate_item_id);
CREATE INDEX IF NOT EXISTS idx_estimate_item_materials_material_id ON estimate_item_materials(material_id);

