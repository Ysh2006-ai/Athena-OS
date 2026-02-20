/**
 * Deterministic Emotion Scoring Engine
 * 
 * Rules:
 * - SIX: +0.6
 * - FOUR: +0.4
 * - WICKET: -0.7
 * - DOT: -0.2 (under pressure)
 * - Default: 0
 * 
 * @param eventType - Type of match event (SIX, FOUR, WICKET, DOT)
 * @param isPressure - Whether the match is in a high-pressure state (mocked)
 * @returns number - Emotion score delta (-1.0 to 1.0)
 */

export function calculateEmotionScore(eventType: string, isPressure: boolean = false): number {
    switch (eventType.toUpperCase()) {
        case 'SIX':
            return 0.6;
        case 'FOUR':
            return 0.4;
        case 'WICKET':
            return -0.7;
        case 'DOT':
            // Dot balls only hurt momentum if under pressure
            return isPressure ? -0.2 : -0.05;
        case 'SINGLE':
        case '1':
            return 0.05; // Keeping specific rotation is mild positive
        case 'WIDE':
        case 'NOBALL':
            return -0.1; // Sloppy play
        default:
            return 0;
    }
}

/**
 * Calculates emotion score modulated by player psychology.
 * formula: BaseImpact * PressureMultiplier
 */
export function calculatePlayerEmotion(
    eventType: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    playerProfile: any,
    currentPressure: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM"
): number {
    const baseScore = calculateEmotionScore(eventType, currentPressure === "HIGH");

    // Get Multiplier based on pressure state
    // Map UPPERCASE pressure to lowercase key
    const pressureKey = currentPressure.toLowerCase() as "low" | "medium" | "high";
    const multiplier = playerProfile?.pressureProfile?.[pressureKey] || 1.0;

    // Apply multiplier (boosts highs, deepens lows)
    const finalScore = baseScore * multiplier;

    // Cap at +/- 1.0
    return Math.max(-1.0, Math.min(1.0, finalScore));
}

export function getEmotionLabel(score: number): string {
    if (score >= 0.8) return "Euphoria";
    if (score >= 0.5) return "Elation";
    if (score >= 0.2) return "Optimism";
    if (score >= -0.2) return "Neutral";
    if (score >= -0.5) return "Anxiety";
    if (score >= -0.8) return "Panic";
    return "Despair";
}
