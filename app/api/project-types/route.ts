import { NextResponse } from "next/server";
import {
  getAllProjectTypes,
  createProjectType,
  deleteProjectType,
} from "@/lib/db";

export async function GET() {
  try {
    const projectTypes = await getAllProjectTypes();
    return NextResponse.json({ projectTypes });
  } catch (error) {
    console.error("Error fetching project types:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, displayName } = body;

    if (!name || !displayName) {
      return NextResponse.json(
        { error: "Name and displayName are required" },
        { status: 400 }
      );
    }

    const projectType = await createProjectType({ name, displayName });
    return NextResponse.json({ projectType });
  } catch (error) {
    console.error("Error creating project type:", error);
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

    const deleted = await deleteProjectType(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Project type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project type:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
