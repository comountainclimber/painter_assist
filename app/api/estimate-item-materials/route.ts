import { NextResponse } from "next/server";
import { addMaterialToEstimateItem } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { estimateItemId, materialId, quantity } = body;

    if (!estimateItemId || !materialId || quantity === undefined) {
      return NextResponse.json(
        { error: "estimateItemId, materialId, and quantity are required" },
        { status: 400 }
      );
    }

    const eim = await addMaterialToEstimateItem(
      estimateItemId,
      materialId,
      parseFloat(quantity)
    );

    return NextResponse.json({ estimateItemMaterial: eim });
  } catch (error) {
    console.error("Error adding material to estimate item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

