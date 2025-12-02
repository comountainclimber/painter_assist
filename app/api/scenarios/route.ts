import { NextResponse } from "next/server";
import { getScenariosBySurface, createScenario } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const surfaceId = searchParams.get("surfaceId");

    if (!surfaceId) {
      return NextResponse.json(
        { error: "surfaceId is required" },
        { status: 400 }
      );
    }

    const scenarios = await getScenariosBySurface(surfaceId);
    return NextResponse.json({ scenarios });
  } catch (error) {
    console.error("Error fetching scenarios:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { surfaceId, name, displayName } = body;

    if (!surfaceId || !name || !displayName) {
      return NextResponse.json(
        { error: "surfaceId, name, and displayName are required" },
        { status: 400 }
      );
    }

    const scenario = await createScenario({ surfaceId, name, displayName });
    return NextResponse.json({ scenario });
  } catch (error) {
    console.error("Error creating scenario:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

