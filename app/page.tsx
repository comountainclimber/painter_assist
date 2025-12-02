"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ProjectType,
  Surface,
  Scenario,
  Output,
  Material,
  EstimateItem,
} from "@/lib/types";

export default function HomePage() {
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [surfaces, setSurfaces] = useState<Surface[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [estimateId, setEstimateId] = useState<string | null>(null);
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMaterials, setShowMaterials] = useState(false);

  // Form state for new item
  const [selectedProjectType, setSelectedProjectType] = useState<string>("");
  const [selectedSurface, setSelectedSurface] = useState<string>("");
  const [selectedScenario, setSelectedScenario] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [costCode, setCostCode] = useState<string>("");
  const [selectedMaterials, setSelectedMaterials] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    loadData();
    createNewEstimate();
  }, []);

  const loadData = async () => {
    try {
      const [ptRes, matRes] = await Promise.all([
        fetch("/api/project-types"),
        fetch("/api/materials"),
      ]);
      const [ptData, matData] = await Promise.all([
        ptRes.json(),
        matRes.json(),
      ]);
      setProjectTypes(ptData.projectTypes || []);
      setMaterials(matData.materials || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewEstimate = async () => {
    try {
      const res = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: null }),
      });
      const data = await res.json();
      setEstimateId(data.estimate.id);
      // Load items for this estimate
      if (data.estimate.id) {
        loadEstimateItems(data.estimate.id);
      }
    } catch (error) {
      console.error("Error creating estimate:", error);
    }
  };

  const loadEstimateItems = async (id: string) => {
    try {
      const res = await fetch(`/api/estimates/${id}`);
      const data = await res.json();
      setItems(data.estimate?.items || []);
    } catch (error) {
      console.error("Error loading estimate items:", error);
    }
  };

  const handleProjectTypeChange = async (projectTypeId: string) => {
    setSelectedProjectType(projectTypeId);
    setSelectedSurface("");
    setSelectedScenario("");
    setScenarios([]);

    if (!projectTypeId) {
      setSurfaces([]);
      return;
    }

    try {
      const res = await fetch(`/api/surfaces?projectTypeId=${projectTypeId}`);
      const data = await res.json();
      setSurfaces(data.surfaces || []);
    } catch (error) {
      console.error("Error loading surfaces:", error);
    }
  };

  const handleSurfaceChange = async (surfaceId: string) => {
    setSelectedSurface(surfaceId);
    setSelectedScenario("");

    if (!surfaceId) {
      setScenarios([]);
      return;
    }

    try {
      const res = await fetch(`/api/scenarios?surfaceId=${surfaceId}`);
      const data = await res.json();
      setScenarios(data.scenarios || []);
    } catch (error) {
      console.error("Error loading scenarios:", error);
    }
  };

  const handleScenarioChange = async (scenarioId: string) => {
    setSelectedScenario(scenarioId);
  };

  const handleAddItem = async () => {
    if (
      !estimateId ||
      !selectedProjectType ||
      !selectedSurface ||
      !selectedScenario ||
      !size
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      // Get output for the scenario
      const outputRes = await fetch(
        `/api/outputs?scenarioId=${selectedScenario}`
      );
      const outputData = await outputRes.json();
      const output = outputData.output;

      if (!output) {
        alert(
          "No output found for this scenario. Please configure it in admin."
        );
        return;
      }

      // Calculate output value based on size
      const sizeNum = parseFloat(size);
      const days = sizeNum / output.outputValue;

      // Create estimate item
      const itemRes = await fetch("/api/estimate-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estimateId,
          projectTypeId: selectedProjectType,
          surfaceId: selectedSurface,
          scenarioId: selectedScenario,
          outputId: output.id,
          size: sizeNum,
          outputValue: days,
          outputUnit: output.outputUnit,
          costCode: costCode || null,
        }),
      });

      const itemData = await itemRes.json();
      const newItem = itemData.item;

      // Add materials
      for (const [materialId, quantity] of Object.entries(selectedMaterials)) {
        if (quantity > 0) {
          await fetch("/api/estimate-item-materials", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              estimateItemId: newItem.id,
              materialId,
              quantity: quantity as number,
            }),
          });
        }
      }

      // Reload items
      if (estimateId) {
        loadEstimateItems(estimateId);
      }

      // Reset form
      setSelectedProjectType("");
      setSelectedSurface("");
      setSelectedScenario("");
      setSize("");
      setCostCode("");
      setSelectedMaterials({});
      setSurfaces([]);
      setScenarios([]);
      setShowMaterials(false);
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Error adding item");
    }
  };

  const handleExportToBuilderTrend = async () => {
    if (!estimateId) return;

    try {
      const res = await fetch(`/api/estimates/${estimateId}/export`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `builder-trend-upload-${estimateId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting:", error);
      alert("Error exporting to Builder Trend format");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-gray-900">Painter Assist</h1>
              {/* Beautiful Rainbow Gradient */}
              <div className="w-full mt-1 h-3 rounded-full overflow-hidden shadow-lg">
                <div
                  className="w-full h-full animate-pulse"
                  style={{
                    background:
                      "linear-gradient(90deg, #ff0000 0%, #ff7f00 14.28%, #ffff00 28.56%, #00ff00 42.84%, #0000ff 57.12%, #4b0082 71.4%, #9400d3 85.68%, #ff0000 100%)",
                    backgroundSize: "200% 100%",
                    animation: "rainbow-slide 3s linear infinite",
                  }}
                />
              </div>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium active:bg-gray-700 touch-manipulation"
            >
              Admin
            </Link>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleExportToBuilderTrend}
              className="w-full mt-2 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium active:bg-primary-700 touch-manipulation"
            >
              Export to Builder Trend ({items.length} items)
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Add Item Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
          <h2 className="text-xl font-semibold mb-5 text-gray-900">Add Item</h2>

          <div className="space-y-5">
            {/* Project Type */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2.5">
                Project Type *
              </label>
              <select
                value={selectedProjectType}
                onChange={(e) => handleProjectTypeChange(e.target.value)}
                className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white touch-manipulation"
                style={{ fontSize: "16px" }} // Prevents zoom on iOS
              >
                <option value="">Select Project Type</option>
                {projectTypes.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.displayName}
                  </option>
                ))}
              </select>
            </div>

            {/* Surface */}
            {selectedProjectType && (
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2.5">
                  Surface *
                </label>
                <select
                  value={selectedSurface}
                  onChange={(e) => handleSurfaceChange(e.target.value)}
                  className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white touch-manipulation"
                  style={{ fontSize: "16px" }}
                >
                  <option value="">Select Surface</option>
                  {surfaces.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.displayName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Scenario */}
            {selectedSurface && (
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2.5">
                  Scenario/Condition *
                </label>
                <select
                  value={selectedScenario}
                  onChange={(e) => handleScenarioChange(e.target.value)}
                  className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white touch-manipulation"
                  style={{ fontSize: "16px" }}
                >
                  <option value="">Select Scenario</option>
                  {scenarios.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.displayName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Size */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2.5">
                Size *
              </label>
              <input
                type="number"
                step="0.01"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none touch-manipulation"
                placeholder="Enter size"
                style={{ fontSize: "16px" }}
              />
            </div>

            {/* Cost Code */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2.5">
                Cost Code
              </label>
              <input
                type="text"
                value={costCode}
                onChange={(e) => setCostCode(e.target.value)}
                className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none touch-manipulation"
                placeholder="Optional cost code"
                style={{ fontSize: "16px" }}
              />
            </div>

            {/* Materials Toggle */}
            {materials.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowMaterials(!showMaterials)}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium active:bg-gray-200 touch-manipulation flex items-center justify-between"
                >
                  <span>Materials {showMaterials ? "▼" : "▶"}</span>
                  <span className="text-sm text-gray-500">
                    {
                      Object.values(selectedMaterials).filter((v) => v > 0)
                        .length
                    }{" "}
                    selected
                  </span>
                </button>

                {showMaterials && (
                  <div className="mt-3 space-y-3 max-h-64 overflow-y-auto border-2 border-gray-200 rounded-lg p-4">
                    {materials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center gap-3"
                      >
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={selectedMaterials[material.id] || ""}
                          onChange={(e) =>
                            setSelectedMaterials({
                              ...selectedMaterials,
                              [material.id]: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-28 px-3 py-2.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none touch-manipulation"
                          placeholder="0"
                          style={{ fontSize: "16px" }}
                        />
                        <span className="text-base text-gray-700 flex-1">
                          {material.displayName}{" "}
                          <span className="text-gray-500">
                            ({material.unit})
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleAddItem}
              className="w-full px-4 py-4 bg-primary-600 text-white rounded-lg font-semibold text-lg active:bg-primary-700 touch-manipulation shadow-md"
            >
              Add Item
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-xl font-semibold mb-5 text-gray-900">
            Estimate Items {items.length > 0 && `(${items.length})`}
          </h2>

          {items.length === 0 ? (
            <div className="text-gray-500 text-center py-12 text-base">
              No items yet. Add items using the form above.
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-primary-600 mb-1">
                      Item #{index + 1}
                    </div>
                    <div className="font-semibold text-base text-gray-900 mb-1">
                      {item.projectType?.displayName}
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      {item.surface?.displayName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.scenario?.displayName}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 pt-3 border-t border-gray-300">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Size</div>
                      <div className="font-semibold text-base">{item.size}</div>
                    </div>
                    {item.outputValue && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Days</div>
                        <div className="font-semibold text-base text-primary-600">
                          {item.outputValue.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>

                  {item.costCode && (
                    <div className="mb-2 text-sm">
                      <span className="text-gray-500">Cost Code: </span>
                      <span className="font-medium text-gray-900">
                        {item.costCode}
                      </span>
                    </div>
                  )}

                  {item.materials && item.materials.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <div className="text-xs font-semibold text-gray-700 mb-2">
                        Materials:
                      </div>
                      <div className="space-y-1.5">
                        {item.materials.map((m) => (
                          <div
                            key={m.id}
                            className="text-sm text-gray-700 flex justify-between"
                          >
                            <span>{m.material?.displayName}</span>
                            <span className="font-medium">
                              {m.quantity} {m.material?.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
