/**
 * Database functions using Vercel Postgres
 * Falls back to in-memory storage for local development
 */

import { sql } from "@vercel/postgres";
import {
  ProjectType,
  Surface,
  Scenario,
  Output,
  Material,
  Estimate,
  EstimateItem,
  EstimateItemMaterial,
  EstimateWithItems,
} from "./types";

const USE_POSTGRES =
  process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;

// In-memory storage for development
let inMemoryData: {
  projectTypes: ProjectType[];
  surfaces: Surface[];
  scenarios: Scenario[];
  outputs: Output[];
  materials: Material[];
  estimates: Estimate[];
  estimateItems: EstimateItem[];
  estimateItemMaterials: EstimateItemMaterial[];
} = {
  projectTypes: [],
  surfaces: [],
  scenarios: [],
  outputs: [],
  materials: [],
  estimates: [],
  estimateItems: [],
  estimateItemMaterials: [],
};

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Project Types
export async function getAllProjectTypes(): Promise<ProjectType[]> {
  if (USE_POSTGRES) {
    try {
      const { rows } = await sql.query(
        "SELECT * FROM project_types ORDER BY display_name"
      );
      return rows.map(rowToProjectType);
    } catch (error) {
      console.error("Error fetching project types:", error);
      throw error;
    }
  }
  return [...inMemoryData.projectTypes];
}

export async function createProjectType(
  data: Omit<ProjectType, "id" | "createdAt" | "updatedAt">
): Promise<ProjectType> {
  const now = new Date().toISOString();
  const projectType: ProjectType = {
    id: generateId(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  if (USE_POSTGRES) {
    try {
      await sql.query(
        "INSERT INTO project_types (id, name, display_name, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)",
        [
          projectType.id,
          projectType.name,
          projectType.displayName,
          projectType.createdAt,
          projectType.updatedAt,
        ]
      );
    } catch (error) {
      console.error("Error creating project type:", error);
      throw error;
    }
  } else {
    inMemoryData.projectTypes.push(projectType);
  }

  return projectType;
}

export async function deleteProjectType(id: string): Promise<boolean> {
  if (USE_POSTGRES) {
    try {
      const { rowCount } = await sql.query(
        "DELETE FROM project_types WHERE id = $1",
        [id]
      );
      return (rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting project type:", error);
      throw error;
    }
  }
  const index = inMemoryData.projectTypes.findIndex((pt) => pt.id === id);
  if (index === -1) return false;
  inMemoryData.projectTypes.splice(index, 1);
  return true;
}

// Surfaces
export async function getSurfacesByProjectType(
  projectTypeId: string
): Promise<Surface[]> {
  if (USE_POSTGRES) {
    try {
      const { rows } = await sql.query(
        "SELECT * FROM surfaces WHERE project_type_id = $1 ORDER BY display_name",
        [projectTypeId]
      );
      return rows.map(rowToSurface);
    } catch (error) {
      console.error("Error fetching surfaces:", error);
      throw error;
    }
  }
  return inMemoryData.surfaces.filter((s) => s.projectTypeId === projectTypeId);
}

export async function createSurface(
  data: Omit<Surface, "id" | "createdAt" | "updatedAt">
): Promise<Surface> {
  const now = new Date().toISOString();
  const surface: Surface = {
    id: generateId(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  if (USE_POSTGRES) {
    try {
      await sql.query(
        "INSERT INTO surfaces (id, project_type_id, name, display_name, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          surface.id,
          surface.projectTypeId,
          surface.name,
          surface.displayName,
          surface.createdAt,
          surface.updatedAt,
        ]
      );
    } catch (error) {
      console.error("Error creating surface:", error);
      throw error;
    }
  } else {
    inMemoryData.surfaces.push(surface);
  }

  return surface;
}

export async function deleteSurface(id: string): Promise<boolean> {
  if (USE_POSTGRES) {
    try {
      const { rowCount } = await sql.query(
        "DELETE FROM surfaces WHERE id = $1",
        [id]
      );
      return (rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting surface:", error);
      throw error;
    }
  }
  const index = inMemoryData.surfaces.findIndex((s) => s.id === id);
  if (index === -1) return false;
  inMemoryData.surfaces.splice(index, 1);
  return true;
}

// Scenarios
export async function getScenariosBySurface(
  surfaceId: string
): Promise<Scenario[]> {
  if (USE_POSTGRES) {
    try {
      const { rows } = await sql.query(
        "SELECT * FROM scenarios WHERE surface_id = $1 ORDER BY display_name",
        [surfaceId]
      );
      return rows.map(rowToScenario);
    } catch (error) {
      console.error("Error fetching scenarios:", error);
      throw error;
    }
  }
  return inMemoryData.scenarios.filter((s) => s.surfaceId === surfaceId);
}

export async function createScenario(
  data: Omit<Scenario, "id" | "createdAt" | "updatedAt">
): Promise<Scenario> {
  const now = new Date().toISOString();
  const scenario: Scenario = {
    id: generateId(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  if (USE_POSTGRES) {
    try {
      await sql.query(
        "INSERT INTO scenarios (id, surface_id, name, display_name, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          scenario.id,
          scenario.surfaceId,
          scenario.name,
          scenario.displayName,
          scenario.createdAt,
          scenario.updatedAt,
        ]
      );
    } catch (error) {
      console.error("Error creating scenario:", error);
      throw error;
    }
  } else {
    inMemoryData.scenarios.push(scenario);
  }

  return scenario;
}

export async function deleteScenario(id: string): Promise<boolean> {
  if (USE_POSTGRES) {
    try {
      const { rowCount } = await sql.query(
        "DELETE FROM scenarios WHERE id = $1",
        [id]
      );
      return (rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting scenario:", error);
      throw error;
    }
  }
  const index = inMemoryData.scenarios.findIndex((s) => s.id === id);
  if (index === -1) return false;
  inMemoryData.scenarios.splice(index, 1);
  return true;
}

// Outputs
export async function getOutputByScenario(
  scenarioId: string
): Promise<Output | null> {
  if (USE_POSTGRES) {
    try {
      const { rows } = await sql.query(
        "SELECT * FROM outputs WHERE scenario_id = $1",
        [scenarioId]
      );
      return rows.length > 0 ? rowToOutput(rows[0]) : null;
    } catch (error) {
      console.error("Error fetching output:", error);
      throw error;
    }
  }
  return inMemoryData.outputs.find((o) => o.scenarioId === scenarioId) || null;
}

export async function createOrUpdateOutput(
  data: Omit<Output, "id" | "createdAt" | "updatedAt">
): Promise<Output> {
  const now = new Date().toISOString();

  if (USE_POSTGRES) {
    try {
      // Try to update first
      const { rows } = await sql.query(
        "UPDATE outputs SET output_value = $1, output_unit = $2, updated_at = $3 WHERE scenario_id = $4 RETURNING *",
        [data.outputValue, data.outputUnit, now, data.scenarioId]
      );

      if (rows.length > 0) {
        return rowToOutput(rows[0]);
      }

      // Insert if doesn't exist
      const output: Output = {
        id: generateId(),
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      await sql.query(
        "INSERT INTO outputs (id, scenario_id, output_value, output_unit, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          output.id,
          output.scenarioId,
          output.outputValue,
          output.outputUnit,
          output.createdAt,
          output.updatedAt,
        ]
      );

      return output;
    } catch (error) {
      console.error("Error creating/updating output:", error);
      throw error;
    }
  }

  const existing = inMemoryData.outputs.find(
    (o) => o.scenarioId === data.scenarioId
  );
  if (existing) {
    existing.outputValue = data.outputValue;
    existing.outputUnit = data.outputUnit;
    existing.updatedAt = now;
    return existing;
  }

  const output: Output = {
    id: generateId(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  inMemoryData.outputs.push(output);
  return output;
}

export async function deleteOutput(id: string): Promise<boolean> {
  if (USE_POSTGRES) {
    try {
      const { rowCount } = await sql.query(
        "DELETE FROM outputs WHERE id = $1",
        [id]
      );
      return (rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting output:", error);
      throw error;
    }
  }
  const index = inMemoryData.outputs.findIndex((o) => o.id === id);
  if (index === -1) return false;
  inMemoryData.outputs.splice(index, 1);
  return true;
}

// Materials
export async function getAllMaterials(): Promise<Material[]> {
  if (USE_POSTGRES) {
    try {
      const { rows } = await sql.query(
        "SELECT * FROM materials ORDER BY display_name"
      );
      return rows.map(rowToMaterial);
    } catch (error) {
      console.error("Error fetching materials:", error);
      throw error;
    }
  }
  return [...inMemoryData.materials];
}

export async function createMaterial(
  data: Omit<Material, "id" | "createdAt" | "updatedAt">
): Promise<Material> {
  const now = new Date().toISOString();
  const material: Material = {
    id: generateId(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  if (USE_POSTGRES) {
    try {
      await sql.query(
        "INSERT INTO materials (id, name, display_name, unit, cost_per_unit, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
          material.id,
          material.name,
          material.displayName,
          material.unit,
          material.costPerUnit,
          material.createdAt,
          material.updatedAt,
        ]
      );
    } catch (error) {
      console.error("Error creating material:", error);
      throw error;
    }
  } else {
    inMemoryData.materials.push(material);
  }

  return material;
}

export async function deleteMaterial(id: string): Promise<boolean> {
  if (USE_POSTGRES) {
    try {
      const { rowCount } = await sql.query(
        "DELETE FROM materials WHERE id = $1",
        [id]
      );
      return (rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error deleting material:", error);
      throw error;
    }
  }
  const index = inMemoryData.materials.findIndex((m) => m.id === id);
  if (index === -1) return false;
  inMemoryData.materials.splice(index, 1);
  return true;
}

// Estimates
export async function getAllEstimates(): Promise<Estimate[]> {
  if (USE_POSTGRES) {
    try {
      const { rows } = await sql.query(
        "SELECT * FROM estimates ORDER BY created_at DESC"
      );
      return rows.map(rowToEstimate);
    } catch (error) {
      console.error("Error fetching estimates:", error);
      throw error;
    }
  }
  return [...inMemoryData.estimates];
}

export async function getEstimateById(
  id: string
): Promise<EstimateWithItems | null> {
  if (USE_POSTGRES) {
    try {
      const { rows: estimateRows } = await sql.query(
        "SELECT * FROM estimates WHERE id = $1",
        [id]
      );
      if (estimateRows.length === 0) return null;

      const estimate = rowToEstimate(estimateRows[0]);

      const { rows: itemRows } = await sql.query(
        `SELECT ei.*, 
          pt.name as pt_name, pt.display_name as pt_display_name,
          s.name as s_name, s.display_name as s_display_name,
          sc.name as sc_name, sc.display_name as sc_display_name,
          o.output_value, o.output_unit
        FROM estimate_items ei
        LEFT JOIN project_types pt ON ei.project_type_id = pt.id
        LEFT JOIN surfaces s ON ei.surface_id = s.id
        LEFT JOIN scenarios sc ON ei.scenario_id = sc.id
        LEFT JOIN outputs o ON ei.output_id = o.id
        WHERE ei.estimate_id = $1
        ORDER BY ei.created_at`,
        [id]
      );

      const items = itemRows.map((row) => ({
        ...rowToEstimateItem(row),
        projectType: {
          id: row.project_type_id,
          name: row.pt_name,
          displayName: row.pt_display_name,
        } as ProjectType,
        surface: {
          id: row.surface_id,
          name: row.s_name,
          displayName: row.s_display_name,
        } as Surface,
        scenario: {
          id: row.scenario_id,
          name: row.sc_name,
          displayName: row.sc_display_name,
        } as Scenario,
        output: row.output_value
          ? ({
              id: row.output_id,
              scenarioId: row.scenario_id,
              outputValue: parseFloat(row.output_value),
              outputUnit: row.output_unit,
            } as Output)
          : undefined,
      }));

      // Get materials for each item
      for (const item of items) {
        const { rows: materialRows } = await sql.query(
          `SELECT eim.*, m.name, m.display_name, m.unit, m.cost_per_unit
          FROM estimate_item_materials eim
          JOIN materials m ON eim.material_id = m.id
          WHERE eim.estimate_item_id = $1`,
          [item.id]
        );
        item.materials = materialRows.map((row) => ({
          id: row.id,
          estimateItemId: row.estimate_item_id,
          materialId: row.material_id,
          quantity: parseFloat(row.quantity),
          createdAt: row.created_at,
          material: {
            id: row.material_id,
            name: row.name,
            displayName: row.display_name,
            unit: row.unit,
            costPerUnit: row.cost_per_unit
              ? parseFloat(row.cost_per_unit)
              : null,
          } as Material,
        }));
      }

      return { ...estimate, items };
    } catch (error) {
      console.error("Error fetching estimate:", error);
      throw error;
    }
  }

  const estimate = inMemoryData.estimates.find((e) => e.id === id);
  if (!estimate) return null;

  const items = inMemoryData.estimateItems
    .filter((item) => item.estimateId === id)
    .map((item) => ({
      ...item,
      materials: inMemoryData.estimateItemMaterials
        .filter((m) => m.estimateItemId === item.id)
        .map((m) => ({
          ...m,
          material: inMemoryData.materials.find(
            (mat) => mat.id === m.materialId
          ),
        })),
    }));

  return { ...estimate, items };
}

export async function createEstimate(
  data: Omit<Estimate, "id" | "createdAt" | "updatedAt">
): Promise<Estimate> {
  const now = new Date().toISOString();
  const estimate: Estimate = {
    id: generateId(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  if (USE_POSTGRES) {
    try {
      await sql.query(
        "INSERT INTO estimates (id, name, created_at, updated_at) VALUES ($1, $2, $3, $4)",
        [estimate.id, estimate.name, estimate.createdAt, estimate.updatedAt]
      );
    } catch (error) {
      console.error("Error creating estimate:", error);
      throw error;
    }
  } else {
    inMemoryData.estimates.push(estimate);
  }

  return estimate;
}

// Estimate Items
export async function createEstimateItem(
  data: Omit<EstimateItem, "id" | "createdAt" | "updatedAt">
): Promise<EstimateItem> {
  const now = new Date().toISOString();
  const item: EstimateItem = {
    id: generateId(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  if (USE_POSTGRES) {
    try {
      await sql.query(
        `INSERT INTO estimate_items (
          id, estimate_id, project_type_id, surface_id, scenario_id, output_id,
          size, output_value, output_unit, cost_code, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          item.id,
          item.estimateId,
          item.projectTypeId,
          item.surfaceId,
          item.scenarioId,
          item.outputId,
          item.size,
          item.outputValue,
          item.outputUnit,
          item.costCode,
          item.createdAt,
          item.updatedAt,
        ]
      );
    } catch (error) {
      console.error("Error creating estimate item:", error);
      throw error;
    }
  } else {
    inMemoryData.estimateItems.push(item);
  }

  return item;
}

export async function addMaterialToEstimateItem(
  estimateItemId: string,
  materialId: string,
  quantity: number
): Promise<EstimateItemMaterial> {
  const now = new Date().toISOString();
  const eim: EstimateItemMaterial = {
    id: generateId(),
    estimateItemId,
    materialId,
    quantity,
    createdAt: now,
  };

  if (USE_POSTGRES) {
    try {
      await sql.query(
        "INSERT INTO estimate_item_materials (id, estimate_item_id, material_id, quantity, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (estimate_item_id, material_id) DO UPDATE SET quantity = $4",
        [
          eim.id,
          eim.estimateItemId,
          eim.materialId,
          eim.quantity,
          eim.createdAt,
        ]
      );
    } catch (error) {
      console.error("Error adding material to estimate item:", error);
      throw error;
    }
  } else {
    const existing = inMemoryData.estimateItemMaterials.find(
      (m) => m.estimateItemId === estimateItemId && m.materialId === materialId
    );
    if (existing) {
      existing.quantity = quantity;
      return existing;
    }
    inMemoryData.estimateItemMaterials.push(eim);
  }

  return eim;
}

// Row mappers
function rowToProjectType(row: any): ProjectType {
  return {
    id: row.id,
    name: row.name,
    displayName: row.display_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToSurface(row: any): Surface {
  return {
    id: row.id,
    projectTypeId: row.project_type_id,
    name: row.name,
    displayName: row.display_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToScenario(row: any): Scenario {
  return {
    id: row.id,
    surfaceId: row.surface_id,
    name: row.name,
    displayName: row.display_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToOutput(row: any): Output {
  return {
    id: row.id,
    scenarioId: row.scenario_id,
    outputValue: parseFloat(row.output_value),
    outputUnit: row.output_unit,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToMaterial(row: any): Material {
  return {
    id: row.id,
    name: row.name,
    displayName: row.display_name,
    unit: row.unit,
    costPerUnit: row.cost_per_unit ? parseFloat(row.cost_per_unit) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToEstimate(row: any): Estimate {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToEstimateItem(row: any): EstimateItem {
  return {
    id: row.id,
    estimateId: row.estimate_id,
    projectTypeId: row.project_type_id,
    surfaceId: row.surface_id,
    scenarioId: row.scenario_id,
    outputId: row.output_id,
    size: parseFloat(row.size),
    outputValue: row.output_value ? parseFloat(row.output_value) : null,
    outputUnit: row.output_unit,
    costCode: row.cost_code,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
