import { NextResponse } from "next/server";
import { getAllMaterials, createMaterial, deleteMaterial } from "@/lib/db";

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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    const deleted = await deleteMaterial(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
