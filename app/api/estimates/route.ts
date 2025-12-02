import { NextResponse } from "next/server";
import { getAllEstimates, createEstimate } from "@/lib/db";

export async function GET() {
  try {
    const estimates = await getAllEstimates();
    return NextResponse.json({ estimates });
  } catch (error) {
    console.error("Error fetching estimates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    const estimate = await createEstimate({ name: name || null });
    return NextResponse.json({ estimate });
  } catch (error) {
    console.error("Error creating estimate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

