def normalize_score(score: float, min_val: float = -5.0, max_val: float = 5.0) -> float:
    """
    Normalizes a weighted emotional score to [-1, 1].
    """
    # Clip first
    score = max(min_val, min(max_val, score))
    
    # Min-Max normalization to [-1, 1]
    # Formula: 2 * ((x - min) / (max - min)) - 1
    
    normalized = 2 * ((score - min_val) / (max_val - min_val)) - 1
    return float(f"{normalized:.2f}")
