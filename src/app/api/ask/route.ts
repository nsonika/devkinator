import { NextResponse } from "next/server";
import { nextQuestion } from "../_session";

/**
 * API route to get the next question for a game session
 */
export async function POST(req: Request) {
  try {
    const { id, tone } = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
    }
    
    const result = await nextQuestion(id, tone);
    
    if ("error" in result) {
      return NextResponse.json(result, { status: 404 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
