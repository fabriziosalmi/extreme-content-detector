"""
Text analysis module for the antifa-scraper project.
This module analyzes content using NLP techniques to identify and rank extremist content.
"""

import logging
import re
import numpy as np
from collections import Counter
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import spacy
from transformers import pipeline
from sqlalchemy.sql import func
import requests
from bs4 import BeautifulSoup

from src.db.models import get_session, Content

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Download necessary NLTK resources
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

class ExtremismAnalyzer:
    """Analyzer for extremist content detection and ranking."""
    
    def __init__(self, session=None):
        """Initialize the analyzer with a database session."""
        self.session = session or get_session()
        self.stop_words = set(stopwords.words('english'))
        
        logger.info("Loading spaCy model...")
        self.nlp = spacy.load("en_core_web_sm")
        
        logger.info("Loading transformer model for sentiment analysis...")
        self.sentiment_analyzer = pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english"
        )
        
        logger.info("Loading hate speech detection model...")
        self.hate_speech_classifier = pipeline(
            "text-classification",
            model="Hate-speech-CNERG/dehatebert-mono-english"
        )
        
        # Keywords for different extremist ideologies
        # Note: These are simplified examples and should be expanded for a real system
        self.keyword_lists = {
            'racist': [
                'white power', 'racial purity', 'racial hierarchy', 'white genocide', 
                'race war', 'racial holy war', 'inferior race', 'subhuman'
            ],
            'fascist': [
                'strong leader', 'national rebirth', 'degenerate', 'traditional values', 
                'cultural marxism', 'deep state', 'new world order', 'globalist agenda'
            ],
            'nazi': [
                'third reich', 'final solution', 'aryan', 'zionist occupation', 
                'jewish conspiracy', 'holocaust denial', 'blood and soil'
            ],
            'far_right': [
                'alt-right', 'great replacement', 'invasion', 'white identity', 
                'western civilization', 'anti-immigration', 'anti-feminist', 'patriot'
            ]
        }
        
        # Compile regex patterns for keywords
        self.keyword_patterns = {}
        for category, keywords in self.keyword_lists.items():
            self.keyword_patterns[category] = [
                re.compile(r'\b' + re.escape(kw.lower()) + r'\b') 
                for kw in keywords
            ]
    
    def get_unanalyzed_content(self, limit=100):
        """Get content that hasn't been analyzed yet."""
        return self.session.query(Content).filter(
            Content.overall_extremism_score.is_(None)
        ).limit(limit).all()
    
    def analyze_text(self, text):
        """Analyze text directly and return scores without storing in database."""
        logger.info("Analyzing text content on-the-fly")
        
        try:
            # Skip if no text
            if not text or len(text) < 50:
                logger.warning("Insufficient text for analysis.")
                return {
                    'racist_score': 0,
                    'fascist_score': 0,
                    'nazi_score': 0,
                    'far_right_score': 0,
                    'overall_extremism_score': 0
                }
            
            # Perform keyword analysis
            keyword_scores = self._analyze_keywords(text)
            
            # Perform semantic analysis using transformer models
            sentiment_score = self._analyze_sentiment(text)
            hate_speech_score = self._classify_hate_speech(text)
            
            # Calculate overall extremism score
            # Weighted combination of individual scores
            overall_score = (
                0.3 * keyword_scores['racist'] +
                0.2 * keyword_scores['fascist'] +
                0.2 * keyword_scores['nazi'] +
                0.2 * keyword_scores['far_right'] +
                0.1 * hate_speech_score
            )
            
            # Normalize to 0-1 range
            overall_score = min(max(overall_score, 0), 1)
            
            scores = {
                'racist_score': keyword_scores['racist'],
                'fascist_score': keyword_scores['fascist'],
                'nazi_score': keyword_scores['nazi'],
                'far_right_score': keyword_scores['far_right'],
                'overall_extremism_score': overall_score
            }
            
            logger.info(f"Successfully analyzed text with overall score {overall_score:.2f}")
            return scores
            
        except Exception as e:
            logger.error(f"Error analyzing text: {str(e)}")
            return {
                'racist_score': 0,
                'fascist_score': 0,
                'nazi_score': 0,
                'far_right_score': 0,
                'overall_extremism_score': 0
            }
    
    def analyze_content(self, content):
        """Analyze a single content item for extremist indicators."""
        logger.info(f"Analyzing content: {content.id} - {content.title}")
        
        # Since our database model has changed, we need to handle both old and new formats
        # In the new format, we should be using the content_excerpt field
        try:
            # Get the text content - use content_excerpt if available
            if hasattr(content, 'content_excerpt') and content.content_excerpt:
                # If we only have an excerpt, we need to re-fetch the full content
                response = requests.get(content.url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    # Use the same extraction method as in the scraper
                    for script in soup(["script", "style", "nav", "footer", "header"]):
                        script.extract()
                    paragraphs = soup.find_all('p')
                    text = '\n\n'.join([p.get_text().strip() for p in paragraphs if p.get_text().strip()])
                    if not text:
                        text = soup.get_text().strip()
                else:
                    # If we can't re-fetch, use what we have
                    text = content.content_excerpt
            else:
                # Backward compatibility - use content_text if available
                text = getattr(content, 'content_text', '')
            
            # Skip if no text
            if not text or len(text) < 50:
                logger.warning(f"Content {content.id} has insufficient text for analysis.")
                return False
            
            # Use the analyze_text method to get scores
            scores = self.analyze_text(text)
            
            # Update the content record with scores
            for key, value in scores.items():
                setattr(content, key, value)
            
            self.session.commit()
            logger.info(f"Successfully analyzed content {content.id} with score {scores['overall_extremism_score']:.2f}")
            return True
            
        except Exception as e:
            logger.error(f"Error analyzing content {content.id}: {str(e)}")
            self.session.rollback()
            return False
    
    def _analyze_keywords(self, text):
        """Analyze text for extremist keywords."""
        text_lower = text.lower()
        scores = {}
        
        for category, patterns in self.keyword_patterns.items():
            matches = []
            for pattern in patterns:
                matches.extend(pattern.findall(text_lower))
            
            # Calculate score based on keyword density and diversity
            word_count = len(word_tokenize(text))
            if word_count > 0:
                keyword_density = len(matches) / word_count
                keyword_diversity = len(set(matches)) / len(self.keyword_lists[category]) if matches else 0
                
                # Combine density and diversity for final score
                # Scale to 0-1 range
                scores[category] = min(keyword_density * 100 + keyword_diversity, 1)
            else:
                scores[category] = 0
        
        return scores
    
    def _analyze_sentiment(self, text):
        """Analyze sentiment of text using transformer model."""
        # Break text into chunks if too long
        max_length = 512
        chunks = [text[i:i+max_length] for i in range(0, len(text), max_length)]
        
        if not chunks:
            return 0.5  # Neutral sentiment
        
        # Get sentiment scores for each chunk
        results = []
        for chunk in chunks[:5]:  # Limit to first 5 chunks to avoid long processing
            if chunk.strip():
                result = self.sentiment_analyzer(chunk)[0]
                if result['label'] == 'NEGATIVE':
                    results.append(result['score'])
                else:
                    results.append(1 - result['score'])
        
        # Average the scores
        return np.mean(results) if results else 0.5
    
    def _classify_hate_speech(self, text):
        """Classify if text contains hate speech."""
        # Break text into chunks if too long
        max_length = 512
        chunks = [text[i:i+max_length] for i in range(0, len(text), max_length)]
        
        if not chunks:
            return 0.0
        
        # Get hate speech scores for each chunk
        scores = []
        for chunk in chunks[:5]:  # Limit to first 5 chunks
            if chunk.strip():
                result = self.hate_speech_classifier(chunk)[0]
                if result['label'] == 'HATE':
                    scores.append(result['score'])
                else:
                    scores.append(0.0)
        
        # Use max score as the final score
        return max(scores) if scores else 0.0

def analyze_all_content(limit=100):
    """Analyze all unanalyzed content in the database."""
    analyzer = ExtremismAnalyzer()
    contents = analyzer.get_unanalyzed_content(limit=limit)
    
    success_count = 0
    for content in contents:
        if analyzer.analyze_content(content):
            success_count += 1
    
    logger.info(f"Analysis complete. Successfully analyzed {success_count} of {len(contents)} content items.")
    return success_count

if __name__ == "__main__":
    analyze_all_content()