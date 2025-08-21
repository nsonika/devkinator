import { NextResponse } from "next/server";
import { startSession } from "../_session";

/**
 * API route to start a new game session
 */
export async function POST() {
  const result = startSession();
  return NextResponse.json(result);
}
