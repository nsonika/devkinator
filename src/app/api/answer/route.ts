import { NextResponse } from "next/server";
import { submitAnswer } from "../_session";
import { generateRoast } from "../../../utils/llm";

/**
 * API route to submit an answer to a question
 */
export async function POST(req: Request) {
  try {
    const { id, key, answer, tone } = await req.json();
    
    if (!id || !key || !answer) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }
    
    const result = submitAnswer(id, key, answer);
    
    if ("error" in result) {
      return NextResponse.json(result, { status: 404 });
    }
    
    // Generate a witty roast based on the answer if tone is provided
    if (tone) {
      const roast = await generateRoast(key, answer, tone);
      return NextResponse.json({ ...result, roast });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
