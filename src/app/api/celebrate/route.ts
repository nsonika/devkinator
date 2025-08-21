import { NextResponse } from "next/server";
import { generateCelebrationPrompt } from "../../../utils/llm";

/**
 * API route to generate a celebratory animation using CogVideoX-3
 */
export async function POST(req: Request) {
  try {
    const { guess } = await req.json();
    
    if (!guess) {
      return NextResponse.json({ error: "Missing guess parameter" }, { status: 400 });
    }
    
    if (!process.env.ZAI_API_KEY) {
      return NextResponse.json({ 
        error: "ZAI_API_KEY not configured",
        fallbackUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDFtNXJnOWRxZWZxcmFwcXRwcWVtZDRxZXZnMmRmZXFmMWQ5ZXlxdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Rsp9jLIy0VZOKlZnd8/giphy.gif"
      }, { status: 400 });
    }
    
    // Generate a creative prompt for the video
    const theme = await generateCelebrationPrompt(guess);
    
    // Call the CogVideoX-3 API
    const response = await fetch("https://api.z.ai/api/paas/v4/videos/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ZAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        model: "cogvideox-3", 
        prompt: theme,
        num_steps: 30,
        width: 512,
        height: 512
      }),
    });
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: "Video generation failed",
        fallbackUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDFtNXJnOWRxZWZxcmFwcXRwcWVtZDRxZXZnMmRmZXFmMWQ5ZXlxdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Rsp9jLIy0VZOKlZnd8/giphy.gif"
      }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ 
      error: "Video generation failed",
      fallbackUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDFtNXJnOWRxZWZxcmFwcXRwcWVtZDRxZXZnMmRmZXFmMWQ5ZXlxdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Rsp9jLIy0VZOKlZnd8/giphy.gif"
    }, { status: 500 });
  }
}
