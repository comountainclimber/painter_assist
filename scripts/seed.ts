/**
 * Seed script to populate the database with initial data from the Excel template
 * Run with: pnpm seed
 * 
 * Make sure you have POSTGRES_URL set in your .env.local file
 * You can pull env vars from Vercel with: pnpm vercel:env:pull
 */

import { sql } from "@vercel/postgres";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

// Check for POSTGRES_URL, POSTGRES_URL_NON_POOLING, or DATABASE_URL
const USE_POSTGRES =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL;

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Seed data based on the Excel template
const seedData = {
  projectTypes: [
    { name: "InteriorRepaint", displayName: "Interior Repaint" },
    { name: "NewConstruction", displayName: "New Construction" },
    { name: "ExteriorRepaint", displayName: "Exterior Repaint" },
  ],
  surfaces: [
    // Interior Repaint
    {
      projectType: "InteriorRepaint",
      name: "CeilingsRepaint",
      displayName: "Ceilings Repaint",
    },
    // New Construction
    {
      projectType: "NewConstruction",
      name: "NewWalls",
      displayName: "New Walls",
    },
    // Exterior Repaint
    {
      projectType: "ExteriorRepaint",
      name: "VerticalSidingRefinish",
      displayName: "Vertical Siding Refinish",
    },
  ],
  scenarios: [
    // Interior Repaint - Ceilings
    {
      surface: "CeilingsRepaint",
      name: "LowVolumeNineOrTenFoot",
      displayName: "Low Volume Nine or Ten Foot Ceiling Repaint",
    },
    // New Construction - New Walls
    {
      surface: "NewWalls",
      name: "TapeCaulkTwoCoatDetailedTrim",
      displayName: "Tape, Caulk, and Two Coat 8-10ft Walls with Detailed Trim",
    },
    {
      surface: "NewWalls",
      name: "TapeCaulkTwoCoatSimpleTrim",
      displayName: "Tape, Caulk, and Two Coat 8-10ft Walls with Simple Trim",
    },
    {
      surface: "NewWalls",
      name: "StainAndClearSingleLightWindows",
      displayName: "Stain and Clear New Single Light Windows",
    },
    // Exterior Repaint - Vertical Siding
    {
      surface: "VerticalSidingRefinish",
      name: "PrimeAndPaintVerticalLapSiding",
      displayName: "Prime and Paint Vertical Lap Siding",
    },
  ],
  outputs: [
    // Note: These are example values - you'll need to update with actual output values from your template
    {
      scenario: "LowVolumeNineOrTenFoot",
      outputValue: 100,
      outputUnit: "sq_ft",
    },
    {
      scenario: "TapeCaulkTwoCoatDetailedTrim",
      outputValue: 80,
      outputUnit: "sq_ft",
    },
    {
      scenario: "TapeCaulkTwoCoatSimpleTrim",
      outputValue: 100,
      outputUnit: "sq_ft",
    },
    {
      scenario: "StainAndClearSingleLightWindows",
      outputValue: 10,
      outputUnit: "units",
    },
    {
      scenario: "PrimeAndPaintVerticalLapSiding",
      outputValue: 150,
      outputUnit: "sq_ft",
    },
  ],
  materials: [
    {
      name: "PaintGallon",
      displayName: "Paint (Gallon)",
      unit: "gallon",
      costPerUnit: 50.0,
    },
    {
      name: "PrimerGallon",
      displayName: "Primer (Gallon)",
      unit: "gallon",
      costPerUnit: 35.0,
    },
    {
      name: "CaulkTube",
      displayName: "Caulk (Tube)",
      unit: "tube",
      costPerUnit: 8.0,
    },
    {
      name: "TapeRoll",
      displayName: "Tape (Roll)",
      unit: "roll",
      costPerUnit: 5.0,
    },
    {
      name: "StainQuart",
      displayName: "Stain (Quart)",
      unit: "quart",
      costPerUnit: 25.0,
    },
    {
      name: "ClearCoatQuart",
      displayName: "Clear Coat (Quart)",
      unit: "quart",
      costPerUnit: 30.0,
    },
  ],
};

async function seed() {
  if (!USE_POSTGRES) {
    console.error("❌ Error: POSTGRES_URL or POSTGRES_URL_NON_POOLING not set.");
    console.error("\nTo fix this:");
    console.error("1. Make sure you've set up your Vercel Postgres database");
    console.error("2. Pull environment variables from Vercel:");
    console.error("   pnpm vercel:env:pull");
    console.error("3. Or manually add POSTGRES_URL to your .env.local file");
    console.error("\nYou can get the connection string from:");
    console.error("  Vercel Dashboard → Your Project → Storage → Your Database → Connection String");
    process.exit(1);
  }

  try {
    console.log("Starting database seed...");

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("Clearing existing data...");
    await sql.query("DELETE FROM estimate_item_materials");
    await sql.query("DELETE FROM estimate_items");
    await sql.query("DELETE FROM estimates");
    await sql.query("DELETE FROM outputs");
    await sql.query("DELETE FROM scenarios");
    await sql.query("DELETE FROM surfaces");
    await sql.query("DELETE FROM project_types");
    await sql.query("DELETE FROM materials");

    // Seed Project Types
    console.log("Seeding project types...");
    const projectTypeMap: Record<string, string> = {};
    for (const pt of seedData.projectTypes) {
      const id = generateId();
      projectTypeMap[pt.name] = id;
      await sql.query(
        `INSERT INTO project_types (id, name, display_name, created_at, updated_at) 
         VALUES ($1, $2, $3, NOW(), NOW())`,
        [id, pt.name, pt.displayName]
      );
      console.log(`  ✓ Created project type: ${pt.displayName}`);
    }

    // Seed Surfaces
    console.log("Seeding surfaces...");
    const surfaceMap: Record<string, string> = {};
    for (const surface of seedData.surfaces) {
      const id = generateId();
      surfaceMap[surface.name] = id;
      const projectTypeId = projectTypeMap[surface.projectType];
      await sql.query(
        `INSERT INTO surfaces (id, project_type_id, name, display_name, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [id, projectTypeId, surface.name, surface.displayName]
      );
      console.log(`  ✓ Created surface: ${surface.displayName}`);
    }

    // Seed Scenarios
    console.log("Seeding scenarios...");
    const scenarioMap: Record<string, string> = {};
    for (const scenario of seedData.scenarios) {
      const id = generateId();
      scenarioMap[scenario.name] = id;
      const surfaceId = surfaceMap[scenario.surface];
      await sql.query(
        `INSERT INTO scenarios (id, surface_id, name, display_name, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [id, surfaceId, scenario.name, scenario.displayName]
      );
      console.log(`  ✓ Created scenario: ${scenario.displayName}`);
    }

    // Seed Outputs
    console.log("Seeding outputs...");
    for (const output of seedData.outputs) {
      const scenarioId = scenarioMap[output.scenario];
      const id = generateId();
      await sql.query(
        `INSERT INTO outputs (id, scenario_id, output_value, output_unit, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [id, scenarioId, output.outputValue, output.outputUnit]
      );
      console.log(
        `  ✓ Created output: ${output.outputValue} ${output.outputUnit}/day for ${output.scenario}`
      );
    }

    // Seed Materials
    console.log("Seeding materials...");
    for (const material of seedData.materials) {
      const id = generateId();
      await sql.query(
        `INSERT INTO materials (id, name, display_name, unit, cost_per_unit, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [
          id,
          material.name,
          material.displayName,
          material.unit,
          material.costPerUnit,
        ]
      );
      console.log(`  ✓ Created material: ${material.displayName}`);
    }

    console.log("\n✅ Database seed completed successfully!");
    console.log("\nSummary:");
    console.log(`  - ${seedData.projectTypes.length} project types`);
    console.log(`  - ${seedData.surfaces.length} surfaces`);
    console.log(`  - ${seedData.scenarios.length} scenarios`);
    console.log(`  - ${seedData.outputs.length} outputs`);
    console.log(`  - ${seedData.materials.length} materials`);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();

