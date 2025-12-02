import { NextResponse } from "next/server";
import { getAllMaterials, createMaterial } from "@/lib/db";

export async function GET() {
  try {
    const materials = await getAllMaterials();
    return NextResponse.json({ materials });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, displayName, unit, costPerUnit } = body;

    if (!name || !displayName || !unit) {
      return NextResponse.json(
        { error: "name, displayName, and unit are required" },
        { status: 400 }
      );
    }

    const material = await createMaterial({
      name,
      displayName,
      unit,
      costPerUnit: costPerUnit ? parseFloat(costPerUnit) : null,
    });
    return NextResponse.json({ material });
  } catch (error) {
    console.error("Error creating material:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

