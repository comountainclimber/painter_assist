import { NextResponse } from "next/server";
import { getEstimateById } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const estimate = await getEstimateById(params.id);
    
    if (!estimate) {
      return NextResponse.json(
        { error: "Estimate not found" },
        { status: 404 }
      );
    }

    // Build CSV for Builder Trend upload
    // Format based on typical Builder Trend CSV requirements
    const csvRows: string[] = [];
    
    // Header row
    csvRows.push("Item,Project Type,Surface,Scenario,Size,Output Value,Output Unit,Cost Code,Materials");
    
    // Data rows
    for (const item of estimate.items) {
      const materials = item.materials
        ?.map((m) => `${m.material?.displayName} (${m.quantity} ${m.material?.unit})`)
        .join("; ") || "";
      
      csvRows.push(
        [
          item.id,
          item.projectType?.displayName || "",
          item.surface?.displayName || "",
          item.scenario?.displayName || "",
          item.size,
          item.outputValue || "",
          item.outputUnit || "",
          item.costCode || "",
          materials,
        ]
          .map((field) => `"${String(field).replace(/"/g, '""')}"`)
          .join(",")
      );
    }

    const csv = csvRows.join("\n");
    
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="builder-trend-${estimate.id}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting estimate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

