export interface ProjectType {
  id: string;
  name: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Surface {
  id: string;
  projectTypeId: string;
  name: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Scenario {
  id: string;
  surfaceId: string;
  name: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Output {
  id: string;
  scenarioId: string;
  outputValue: number;
  outputUnit: 'units' | 'sq_ft' | 'linear_ft';
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: string;
  name: string;
  displayName: string;
  unit: string;
  costPerUnit: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Estimate {
  id: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EstimateItem {
  id: string;
  estimateId: string;
  projectTypeId: string;
  surfaceId: string;
  scenarioId: string;
  outputId: string | null;
  size: number;
  outputValue: number | null;
  outputUnit: string | null;
  costCode: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined data
  projectType?: ProjectType;
  surface?: Surface;
  scenario?: Scenario;
  output?: Output;
  materials?: EstimateItemMaterial[];
}

export interface EstimateItemMaterial {
  id: string;
  estimateItemId: string;
  materialId: string;
  quantity: number;
  createdAt: string;
  // Joined data
  material?: Material;
}

export interface EstimateWithItems extends Estimate {
  items: EstimateItem[];
}

