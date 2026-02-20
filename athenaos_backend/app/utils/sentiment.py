from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

def analyze_sentiment(text: str) -> float:
    """
    Analyzes sentiment of commentary text.
    Returns composite score between -1.0 (Negative) and +1.0 (Positive).
    """
    if not text:
        return 0.0
        
    # VADER is better for social media/short text
    vs = analyzer.polarity_scores(text)
    vader_score = vs['compound']
    
    # TextBlob as fallback/secondary
    blob_score = TextBlob(text).sentiment.polarity
    
    # Weighted average (VADER favored for sports commentary which is dynamic)
    final_score = (vader_score * 0.7) + (blob_score * 0.3)
    
    return max(-1.0, min(1.0, final_score))
