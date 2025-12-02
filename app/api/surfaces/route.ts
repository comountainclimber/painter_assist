import { NextResponse } from "next/server";
import { getSurfacesByProjectType, createSurface } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectTypeId = searchParams.get("projectTypeId");

    if (!projectTypeId) {
      return NextResponse.json(
        { error: "projectTypeId is required" },
        { status: 400 }
      );
    }

    const surfaces = await getSurfacesByProjectType(projectTypeId);
    return NextResponse.json({ surfaces });
  } catch (error) {
    console.error("Error fetching surfaces:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectTypeId, name, displayName } = body;

    if (!projectTypeId || !name || !displayName) {
      return NextResponse.json(
        { error: "projectTypeId, name, and displayName are required" },
        { status: 400 }
      );
    }

    const surface = await createSurface({ projectTypeId, name, displayName });
    return NextResponse.json({ surface });
  } catch (error) {
    console.error("Error creating surface:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

