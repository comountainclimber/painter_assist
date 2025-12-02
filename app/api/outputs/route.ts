import { NextResponse } from "next/server";
import {
  getOutputByScenario,
  createOrUpdateOutput,
  deleteOutput,
} from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scenarioId = searchParams.get("scenarioId");

    if (!scenarioId) {
      return NextResponse.json(
        { error: "scenarioId is required" },
        { status: 400 }
      );
    }

    const output = await getOutputByScenario(scenarioId);
    return NextResponse.json({ output });
  } catch (error) {
    console.error("Error fetching output:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scenarioId, outputValue, outputUnit } = body;

    if (!scenarioId || outputValue === undefined || !outputUnit) {
      return NextResponse.json(
        { error: "scenarioId, outputValue, and outputUnit are required" },
        { status: 400 }
      );
    }

    const output = await createOrUpdateOutput({
      scenarioId,
      outputValue: parseFloat(outputValue),
      outputUnit,
    });
    return NextResponse.json({ output });
  } catch (error) {
    console.error("Error creating/updating output:", error);
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
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deleted = await deleteOutput(id);
    if (!deleted) {
      return NextResponse.json({ error: "Output not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting output:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
