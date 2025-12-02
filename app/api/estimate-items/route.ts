import { NextResponse } from "next/server";
import { createEstimateItem } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      estimateId,
      projectTypeId,
      surfaceId,
      scenarioId,
      outputId,
      size,
      outputValue,
      outputUnit,
      costCode,
    } = body;

    if (
      !estimateId ||
      !projectTypeId ||
      !surfaceId ||
      !scenarioId ||
      size === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const item = await createEstimateItem({
      estimateId,
      projectTypeId,
      surfaceId,
      scenarioId,
      outputId: outputId || null,
      size: parseFloat(size),
      outputValue: outputValue ? parseFloat(outputValue) : null,
      outputUnit: outputUnit || null,
      costCode: costCode || null,
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error creating estimate item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

