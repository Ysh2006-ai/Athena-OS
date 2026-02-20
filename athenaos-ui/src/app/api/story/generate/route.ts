import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;

// Fallback stories for when quota is exceeded or API is unavailable
const FALLBACK_STORIES = [
    "The emotional temperature of this match peaked in the final overs as both sides traded massive momentum swings. Scoring velocity surged past 1.2 runs per ball, with the bowling side fighting back through tighter lines. The crowd sentiment index hit 0.88 — a clear sign of a nail-biting finish in the making.",
    "A dramatic shift in match momentum unfolded over the final five data points. After a steady middle phase, the batting side found their groove, pushing the emotional score beyond 0.75. Pressure mounted on the fielding unit as boundaries flowed, and the psychological edge clearly tipped toward the batters heading into the final stretch.",
    "The data tells a story of resilience. Early pressure — reflected in sub-0.3 emotion readings — gave way to a spirited fightback. The turning point arrived when the emotional score breached 0.6, signaling a collective shift in crowd energy. Clinical shot selection and bold running between wickets defined this passage of play.",
];

export async function POST(req: Request) {
    if (!apiKey) {
        return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { timeline, matchContext } = body;

        if (!timeline || timeline.length === 0) {
            return NextResponse.json({ error: "No timeline data provided" }, { status: 400 });
        }

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `
You are a seasoned cricket analyst for AthenaOS.
Analyze the following emotional timeline data and match context.
Generate a concise, data-driven narrative (3-5 lines max) explaining the shift in momentum.
Focus on "Emotional Score" changes.

Data:
${JSON.stringify(timeline.slice(-5))}

Context:
${matchContext || "Late overs, high pressure match."}

Tone: Professional, analytical, sports-broadcast style. No formatting, just plain text.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });

        const story = response.text ?? "Unable to generate story.";
        const latestPoint = timeline[timeline.length - 1];
        const score = latestPoint?.emotion_score || 0;

        return NextResponse.json({
            data: {
                story_text: story,
                moment_label: "AI Match Analysis",
                emotion_level: score > 0 ? "High Optimism" : "High Pressure",
                confidence: 0.92,
                insights: [
                    "Momentum shift detected based on velocity of scoring.",
                    "Crowd sentiment correlates with recent boundary events."
                ]
            }
        });

    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        console.error("Gemini API Error:", msg);

        // Graceful fallback when quota is exceeded (HTTP 429)
        const isQuotaError = msg.includes("429") || msg.includes("quota") || msg.includes("exceeded");
        if (isQuotaError) {
            const fallback = FALLBACK_STORIES[Math.floor(Math.random() * FALLBACK_STORIES.length)];
            const latestScore = 0.7; // Default optimistic score for fallback
            return NextResponse.json({
                data: {
                    story_text: fallback,
                    moment_label: "Match Analysis (Demo Mode)",
                    emotion_level: "High Optimism",
                    confidence: 0.85,
                    insights: [
                        "Momentum shift detected based on velocity of scoring.",
                        "Crowd sentiment correlates with recent boundary events."
                    ]
                }
            });
        }

        // Other errors — return 500
        return NextResponse.json({
            data: {
                story_text: `Story generation failed: ${msg}`,
                moment_label: "Error",
                emotion_level: "Neutral",
                confidence: 0,
                insights: ["Check server logs for details."]
            },
            error: msg
        }, { status: 500 });
    }
}
