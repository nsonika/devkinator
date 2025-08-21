import { NextResponse } from "next/server";
import { forceGuess } from "../_session";

/**
 * API route to force a guess even if confidence is low
 */
export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
    }
    
    const result = forceGuess(id);
    
    if ("error" in result) {
      return NextResponse.json(result, { status: 404 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
