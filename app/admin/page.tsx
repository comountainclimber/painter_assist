"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProjectType, Surface, Scenario, Output, Material } from "@/lib/types";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(
    process.env.NODE_ENV === "development"
  );
  const [activeTab, setActiveTab] = useState<
    "project-types" | "surfaces" | "scenarios" | "outputs" | "materials"
  >("project-types");

  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [surfaces, setSurfaces] = useState<Surface[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [selectedProjectType, setSelectedProjectType] = useState<string>("");
  const [selectedSurface, setSelectedSurface] = useState<string>("");

  // Form states
  const [newProjectType, setNewProjectType] = useState({
    name: "",
    displayName: "",
  });
  const [newSurface, setNewSurface] = useState({
    name: "",
    displayName: "",
    projectTypeId: "",
  });
  const [newScenario, setNewScenario] = useState({
    name: "",
    displayName: "",
    surfaceId: "",
  });
  const [newOutput, setNewOutput] = useState({
    scenarioId: "",
    outputValue: "",
    outputUnit: "sq_ft",
  });
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    displayName: "",
    unit: "",
    costPerUnit: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, activeTab, selectedProjectType, selectedSurface]);

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

      if (selectedProjectType) {
        const sRes = await fetch(
          `/api/surfaces?projectTypeId=${selectedProjectType}`
        );
        const sData = await sRes.json();
        setSurfaces(sData.surfaces || []);
      }

      if (selectedSurface) {
        const scRes = await fetch(
          `/api/scenarios?surfaceId=${selectedSurface}`
        );
        const scData = await scRes.json();
        setScenarios(scData.scenarios || []);

        // Load outputs for scenarios
        const outputPromises = scData.scenarios.map((sc: Scenario) =>
          fetch(`/api/outputs?scenarioId=${sc.id}`).then((r) => r.json())
        );
        const outputData = await Promise.all(outputPromises);
        setOutputs(
          outputData
            .map((d) => d.output)
            .filter((o: Output | null) => o !== null)
        );
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would check against ADMIN_PASSWORD
    if (password || process.env.NODE_ENV === "development") {
      setIsAuthenticated(true);
    }
  };

  const handleCreateProjectType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/project-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProjectType),
      });
      if (res.ok) {
        setNewProjectType({ name: "", displayName: "" });
        loadData();
      }
    } catch (error) {
      console.error("Error creating project type:", error);
    }
  };

  const handleCreateSurface = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/surfaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSurface),
      });
      if (res.ok) {
        setNewSurface({ name: "", displayName: "", projectTypeId: "" });
        loadData();
      }
    } catch (error) {
      console.error("Error creating surface:", error);
    }
  };

  const handleCreateScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newScenario),
      });
      if (res.ok) {
        setNewScenario({ name: "", displayName: "", surfaceId: "" });
        loadData();
      }
    } catch (error) {
      console.error("Error creating scenario:", error);
    }
  };

  const handleCreateOutput = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/outputs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOutput),
      });
      if (res.ok) {
        setNewOutput({ scenarioId: "", outputValue: "", outputUnit: "sq_ft" });
        loadData();
      }
    } catch (error) {
      console.error("Error creating output:", error);
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newMaterial,
          costPerUnit: newMaterial.costPerUnit
            ? parseFloat(newMaterial.costPerUnit)
            : null,
        }),
      });
      if (res.ok) {
        setNewMaterial({
          name: "",
          displayName: "",
          unit: "",
          costPerUnit: "",
        });
        loadData();
      }
    } catch (error) {
      console.error("Error creating material:", error);
    }
  };

  const handleDeleteProjectType = async (id: string, displayName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${displayName}"? This will also delete all associated surfaces, scenarios, and outputs.`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/project-types?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadData();
      } else {
        alert("Error deleting project type");
      }
    } catch (error) {
      console.error("Error deleting project type:", error);
      alert("Error deleting project type");
    }
  };

  const handleDeleteSurface = async (id: string, displayName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${displayName}"? This will also delete all associated scenarios and outputs.`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/surfaces?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadData();
      } else {
        alert("Error deleting surface");
      }
    } catch (error) {
      console.error("Error deleting surface:", error);
      alert("Error deleting surface");
    }
  };

  const handleDeleteScenario = async (id: string, displayName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${displayName}"? This will also delete the associated output.`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/scenarios?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadData();
      } else {
        alert("Error deleting scenario");
      }
    } catch (error) {
      console.error("Error deleting scenario:", error);
      alert("Error deleting scenario");
    }
  };

  const handleDeleteOutput = async (id: string, scenarioName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the output for "${scenarioName}"?`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/outputs?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadData();
      } else {
        alert("Error deleting output");
      }
    } catch (error) {
      console.error("Error deleting output:", error);
      alert("Error deleting output");
    }
  };

  const handleDeleteMaterial = async (id: string, displayName: string) => {
    if (!confirm(`Are you sure you want to delete "${displayName}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/materials?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadData();
      } else {
        alert("Error deleting material");
      }
    } catch (error) {
      console.error("Error deleting material:", error);
      alert("Error deleting material");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 shadow-lg rounded-xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Admin Login
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none touch-manipulation"
                placeholder="Enter admin password"
                required
                style={{ fontSize: "16px" }}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-3.5 px-4 rounded-lg font-semibold text-base active:bg-primary-700 touch-manipulation"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "project-types", label: "Project Types" },
    { id: "surfaces", label: "Surfaces" },
    { id: "scenarios", label: "Scenarios" },
    { id: "outputs", label: "Outputs" },
    { id: "materials", label: "Materials" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2 gap-3">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            {/* Beautiful Rainbow Gradient */}
            <div className="w-24 mx-2 h-3 rounded-full overflow-hidden shadow-lg">
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
            <Link
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium active:bg-gray-700 touch-manipulation"
            >
              Back
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 max-w-2xl mx-auto">
        {/* Mobile-friendly Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-x-auto">
          <div className="flex border-b border-gray-200 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap touch-manipulation ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 active:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Project Types Tab */}
        {activeTab === "project-types" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-semibold mb-4">Project Types</h2>
            <form onSubmit={handleCreateProjectType} className="mb-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Name (no spaces)
                  </label>
                  <input
                    type="text"
                    value={newProjectType.name}
                    onChange={(e) =>
                      setNewProjectType({
                        ...newProjectType,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none touch-manipulation"
                    placeholder="InteriorRepaint"
                    required
                    style={{ fontSize: "16px" }}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={newProjectType.displayName}
                    onChange={(e) =>
                      setNewProjectType({
                        ...newProjectType,
                        displayName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none touch-manipulation"
                    placeholder="Interior Repaint"
                    required
                    style={{ fontSize: "16px" }}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3.5 bg-primary-600 text-white rounded-lg font-semibold active:bg-primary-700 touch-manipulation"
              >
                Add Project Type
              </button>
            </form>
            <div className="space-y-2">
              {projectTypes.map((pt) => (
                <div
                  key={pt.id}
                  className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-base">
                      {pt.displayName}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{pt.name}</div>
                  </div>
                  <button
                    onClick={() =>
                      handleDeleteProjectType(pt.id, pt.displayName)
                    }
                    className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium active:bg-red-700 touch-manipulation ml-4"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Surfaces Tab */}
        {activeTab === "surfaces" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-semibold mb-4">Surfaces</h2>
            <div className="mb-4">
              <label className="block text-base font-medium text-gray-700 mb-2">
                Filter by Project Type
              </label>
              <select
                value={selectedProjectType}
                onChange={(e) => {
                  setSelectedProjectType(e.target.value);
                  setSelectedSurface("");
                }}
                className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white touch-manipulation"
                style={{ fontSize: "16px" }}
              >
                <option value="">All Project Types</option>
                {projectTypes.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.displayName}
                  </option>
                ))}
              </select>
            </div>
            <form onSubmit={handleCreateSurface} className="mb-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Project Type
                  </label>
                  <select
                    value={newSurface.projectTypeId}
                    onChange={(e) =>
                      setNewSurface({
                        ...newSurface,
                        projectTypeId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white touch-manipulation"
                    required
                    style={{ fontSize: "16px" }}
                  >
                    <option value="">Select...</option>
                    {projectTypes.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.displayName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Name (no spaces)
                  </label>
                  <input
                    type="text"
                    value={newSurface.name}
                    onChange={(e) =>
                      setNewSurface({ ...newSurface, name: e.target.value })
                    }
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none touch-manipulation"
                    placeholder="CeilingsRepaint"
                    required
                    style={{ fontSize: "16px" }}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={newSurface.displayName}
                    onChange={(e) =>
                      setNewSurface({
                        ...newSurface,
                        displayName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none touch-manipulation"
                    placeholder="Ceilings Repaint"
                    required
                    style={{ fontSize: "16px" }}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3.5 bg-primary-600 text-white rounded-lg font-semibold active:bg-primary-700 touch-manipulation"
              >
                Add Surface
              </button>
            </form>
            <div className="space-y-2">
              {surfaces.map((s) => (
                <div
                  key={s.id}
                  className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-base">{s.displayName}</div>
                    <div className="text-sm text-gray-500 mt-1">{s.name}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteSurface(s.id, s.displayName)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium active:bg-red-700 touch-manipulation ml-4"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scenarios Tab */}
        {activeTab === "scenarios" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-semibold mb-4">Scenarios</h2>
            <div className="mb-4 space-y-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Filter by Project Type
                </label>
                <select
                  value={selectedProjectType}
                  onChange={(e) => {
                    setSelectedProjectType(e.target.value);
                    setSelectedSurface("");
                  }}
                  className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white touch-manipulation"
                  style={{ fontSize: "16px" }}
                >
                  <option value="">All Project Types</option>
                  {projectTypes.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.displayName}
                    </option>
                  ))}
                </select>
              </div>
              {selectedProjectType && (
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Filter by Surface
                  </label>
                  <select
                    value={selectedSurface}
                    onChange={(e) => setSelectedSurface(e.target.value)}
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white touch-manipulation"
                    style={{ fontSize: "16px" }}
                  >
                    <option value="">All Surfaces</option>
                    {surfaces.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <form onSubmit={handleCreateScenario} className="mb-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Surface
                  </label>
                  <select
                    value={newScenario.surfaceId}
                    onChange={(e) =>
                      setNewScenario({
                        ...newScenario,
                        surfaceId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white touch-manipulation"
                    required
                    style={{ fontSize: "16px" }}
                  >
                    <option value="">Select...</option>
                    {surfaces.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.displayName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Name (no spaces)
                  </label>
                  <input
                    type="text"
                    value={newScenario.name}
                    onChange={(e) =>
                      setNewScenario({ ...newScenario, name: e.target.value })
                    }
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none touch-manipulation"
                    placeholder="LowVolumeNineOrTenFoot"
                    required
                    style={{ fontSize: "16px" }}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={newScenario.displayName}
                    onChange={(e) =>
                      setNewScenario({
                        ...newScenario,
                        displayName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none touch-manipulation"
                    placeholder="Low Volume Nine or Ten Foot Ceiling Repaint"
                    required
                    style={{ fontSize: "16px" }}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3.5 bg-primary-600 text-white rounded-lg font-semibold active:bg-primary-700 touch-manipulation"
              >
                Add Scenario
              </button>
            </form>
            <div className="space-y-2">
              {scenarios.map((sc) => (
                <div
                  key={sc.id}
                  className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-base">
                      {sc.displayName}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{sc.name}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteScenario(sc.id, sc.displayName)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium active:bg-red-700 touch-manipulation ml-4"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outputs Tab */}
        {activeTab === "outputs" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-semibold mb-4">Outputs</h2>
            <div className="mb-4 space-y-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Filter by Project Type
                </label>
                <select
                  value={selectedProjectType}
                  onChange={(e) => {
                    setSelectedProjectType(e.target.value);
                    setSelectedSurface("");
                  }}
                  className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white touch-manipulation"
                  style={{ fontSize: "16px" }}
                >
                  <option value="">All Project Types</option>
                  {projectTypes.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.displayName}
                    </option>
                  ))}
                </select>
              </div>
              {selectedProjectType && (
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Filter by Surface
                  </label>
                  <select
                    value={selectedSurface}
                    onChange={(e) => setSelectedSurface(e.target.value)}
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white touch-manipulation"
                    style={{ fontSize: "16px" }}
                  >
                    <option value="">All Surfaces</option>
                    {surfaces.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <form onSubmit={handleCreateOutput} className="mb-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Scenario
                  </label>
                  <select
                    value={newOutput.scenarioId}
                    onChange={(e) =>
                      setNewOutput({ ...newOutput, scenarioId: e.target.value })
                    }
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white touch-manipulation"
                    required
                    style={{ fontSize: "16px" }}
                  >
                    <option value="">Select...</option>
                    {scenarios.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.displayName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Output Value (per day)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newOutput.outputValue}
                    onChange={(e) =>
                      setNewOutput({
                        ...newOutput,
                        outputValue: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none touch-manipulation"
                    placeholder="100"
                    required
                    style={{ fontSize: "16px" }}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Output Unit
                  </label>
                  <select
                    value={newOutput.outputUnit}
                    onChange={(e) =>
                      setNewOutput({ ...newOutput, outputUnit: e.target.value })
                    }
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white touch-manipulation"
                    required
                    style={{ fontSize: "16px" }}
                  >
                    <option value="sq_ft">Square Feet</option>
                    <option value="linear_ft">Linear Feet</option>
                    <option value="units">Units</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3.5 bg-primary-600 text-white rounded-lg font-semibold active:bg-primary-700 touch-manipulation"
              >
                Add/Update Output
              </button>
            </form>
            <div className="space-y-2">
              {outputs.map((o) => {
                const scenario = scenarios.find((s) => s.id === o.scenarioId);
                return (
                  <div
                    key={o.id}
                    className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-base">
                        {scenario?.displayName || o.scenarioId}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {o.outputValue} {o.outputUnit} per day
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleDeleteOutput(
                          o.id,
                          scenario?.displayName || o.scenarioId
                        )
                      }
                      className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium active:bg-red-700 touch-manipulation ml-4"
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === "materials" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-semibold mb-4">Materials</h2>
            <form onSubmit={handleCreateMaterial} className="mb-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Name (no spaces)
                  </label>
                  <input
                    type="text"
                    value={newMaterial.name}
                    onChange={(e) =>
                      setNewMaterial({ ...newMaterial, name: e.target.value })
                    }
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none touch-manipulation"
                    placeholder="PaintGallon"
                    required
                    style={{ fontSize: "16px" }}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={newMaterial.displayName}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        displayName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none touch-manipulation"
                    placeholder="Paint (Gallon)"
                    required
                    style={{ fontSize: "16px" }}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={newMaterial.unit}
                    onChange={(e) =>
                      setNewMaterial({ ...newMaterial, unit: e.target.value })
                    }
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none touch-manipulation"
                    placeholder="gallon"
                    required
                    style={{ fontSize: "16px" }}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Cost per Unit
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMaterial.costPerUnit}
                    onChange={(e) =>
                      setNewMaterial({
                        ...newMaterial,
                        costPerUnit: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none touch-manipulation"
                    placeholder="50.00"
                    style={{ fontSize: "16px" }}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3.5 bg-primary-600 text-white rounded-lg font-semibold active:bg-primary-700 touch-manipulation"
              >
                Add Material
              </button>
            </form>
            <div className="space-y-2">
              {materials.map((m) => (
                <div
                  key={m.id}
                  className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-base">{m.displayName}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {m.name} • {m.unit}
                      {m.costPerUnit && ` • $${m.costPerUnit.toFixed(2)}`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMaterial(m.id, m.displayName)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium active:bg-red-700 touch-manipulation ml-4"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
