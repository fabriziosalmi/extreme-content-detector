"""
Enhanced analysis module for identifying indicators of fascist rhetoric in text.
Includes multiple analysis methods, caching, and configurable thresholds.
"""
import json
import re
import os
import datetime
import hashlib
import urllib.parse
import time
from typing import Dict, List, Optional, Any, Tuple, Set
import requests
from bs4 import BeautifulSoup
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from collections import defaultdict
import pickle

# Download necessary NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

# Create necessary directories
os.makedirs('logs', exist_ok=True)
os.makedirs('cache', exist_ok=True)

class ContentCache:
    """Cache for storing analyzed content to avoid reprocessing."""
    
    def __init__(self, cache_dir: str = "cache", max_age_days: int = 7):
        """
        Initialize the cache.
        
        Args:
            cache_dir: Directory to store cache files
            max_age_days: Maximum age of cache entries in days
        """
        self.cache_dir = cache_dir
        self.max_age_seconds = max_age_days * 24 * 60 * 60
        self.url_cache = {}
        self.text_cache = {}
        self._load_cache()
        
    def _load_cache(self):
        """Load existing cache from disk."""
        try:
            cache_file = os.path.join(self.cache_dir, "url_cache.pkl")
            if os.path.exists(cache_file):
                with open(cache_file, 'rb') as f:
                    self.url_cache = pickle.load(f)
                    
            cache_file = os.path.join(self.cache_dir, "text_cache.pkl")
            if os.path.exists(cache_file):
                with open(cache_file, 'rb') as f:
                    self.text_cache = pickle.load(f)
                    
            # Clean old cache entries
            self._clean_cache()
        except Exception as e:
            print(f"Error loading cache: {e}")
            self.url_cache = {}
            self.text_cache = {}
    
    def _save_cache(self):
        """Save cache to disk."""
        try:
            cache_file = os.path.join(self.cache_dir, "url_cache.pkl")
            with open(cache_file, 'wb') as f:
                pickle.dump(self.url_cache, f)
                
            cache_file = os.path.join(self.cache_dir, "text_cache.pkl")
            with open(cache_file, 'wb') as f:
                pickle.dump(self.text_cache, f)
        except Exception as e:
            print(f"Error saving cache: {e}")
    
    def _clean_cache(self):
        """Remove old cache entries."""
        now = time.time()
        
        # Clean URL cache
        to_remove = []
        for url, entry in self.url_cache.items():
            if now - entry["timestamp"] > self.max_age_seconds:
                to_remove.append(url)
        
        for url in to_remove:
            del self.url_cache[url]
            
        # Clean text cache
        to_remove = []
        for text_hash, entry in self.text_cache.items():
            if now - entry["timestamp"] > self.max_age_seconds:
                to_remove.append(text_hash)
                
        for text_hash in to_remove:
            del self.text_cache[text_hash]
    
    def get_url_content(self, url: str) -> Optional[Dict]:
        """
        Get cached content for a URL.
        
        Args:
            url: The URL to retrieve from cache
            
        Returns:
            Cached content or None if not found/expired
        """
        if url in self.url_cache:
            entry = self.url_cache[url]
            now = time.time()
            
            # Check if entry is still valid
            if now - entry["timestamp"] <= self.max_age_seconds:
                print(f"Cache hit for URL: {url}")
                return entry["content"]
                
        return None
    
    def set_url_content(self, url: str, content: str, results: Dict[str, Any] = None):
        """
        Cache content for a URL.
        
        Args:
            url: The URL to cache
            content: The scraped text content
            results: Optional analysis results
        """
        self.url_cache[url] = {
            "timestamp": time.time(),
            "content": {
                "text": content,
                "results": results
            }
        }
        self._save_cache()
    
    def get_text_analysis(self, text: str) -> Optional[Dict]:
        """
        Get cached analysis for text.
        
        Args:
            text: The text to retrieve analysis for
            
        Returns:
            Cached analysis or None if not found/expired
        """
        text_hash = hashlib.md5(text.encode()).hexdigest()
        
        if text_hash in self.text_cache:
            entry = self.text_cache[text_hash]
            now = time.time()
            
            # Check if entry is still valid
            if now - entry["timestamp"] <= self.max_age_seconds:
                print(f"Cache hit for text hash: {text_hash}")
                return entry["results"]
                
        return None
    
    def set_text_analysis(self, text: str, results: Dict[str, Any]):
        """
        Cache analysis results for text.
        
        Args:
            text: The analyzed text
            results: The analysis results
        """
        text_hash = hashlib.md5(text.encode()).hexdigest()
        
        self.text_cache[text_hash] = {
            "timestamp": time.time(),
            "results": results
        }
        self._save_cache()

class TextAnalyzer:
    """Enhanced class responsible for analyzing text for indicators of fascist rhetoric."""
    
    def __init__(self, indicators_file: str = "indicators.json"):
        """
        Initialize the TextAnalyzer with indicators from a JSON file.
        
        Args:
            indicators_file: Path to the JSON file containing indicators.
        """
        self.indicators = self._load_indicators(indicators_file)
        self.analysis_stats = {
            "total_analyses": 0,
            "indicators_found": {},
            "top_keywords": {},
            "analysis_methods_used": {},
            "source_types": {"text": 0, "url": 0},
            "analyzed_domains": {},  # Track domains that have been analyzed
            "analysis_by_date": {},  # Track analyses by date
            "recent_urls": [],       # Store recent analyzed URLs
            "most_indicative_urls": [],  # URLs with highest indicator counts
            "cache_stats": {"hits": 0, "misses": 0}  # Track cache performance
        }
        self._load_stats()
        self.cache = ContentCache()
        
    def _load_indicators(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Load indicators from a JSON file.
        
        Args:
            file_path: Path to the JSON file.
            
        Returns:
            List of indicator dictionaries.
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('indicators', [])
        except Exception as e:
            print(f"Error loading indicators file: {e}")
            return []
    
    def _load_stats(self):
        """Load the existing stats from file if it exists."""
        try:
            if os.path.exists('logs/analysis_stats.json'):
                with open('logs/analysis_stats.json', 'r', encoding='utf-8') as f:
                    self.analysis_stats = json.load(f)
        except Exception as e:
            print(f"Error loading stats file: {e}")
            # Use the default initialized stats
    
    def _extract_domain(self, url: str) -> str:
        """Extract domain name from URL."""
        try:
            parsed_url = urllib.parse.urlparse(url)
            domain = parsed_url.netloc
            # Remove www. prefix if present
            if domain.startswith('www.'):
                domain = domain[4:]
            return domain
        except Exception:
            return "unknown_domain"
    
    def _update_stats(self, results: Dict[str, Any], input_type: str, url: Optional[str] = None, cache_hit: bool = False):
        """
        Update statistics about analyses.
        
        Args:
            results: The analysis results
            input_type: "text" or "url"
            url: Optional URL if input_type is "url"
            cache_hit: Whether the result came from cache
        """
        # Ensure cache_stats exists in the dictionary
        if "cache_stats" not in self.analysis_stats:
            self.analysis_stats["cache_stats"] = {"hits": 0, "misses": 0}
        
        # Update cache stats
        if cache_hit:
            self.analysis_stats["cache_stats"]["hits"] += 1
        else:
            self.analysis_stats["cache_stats"]["misses"] += 1
            
        # Update total analyses count
        self.analysis_stats["total_analyses"] += 1
        
        # Get current date for date-based stats
        today = datetime.datetime.now().strftime("%Y-%m-%d")
        if today not in self.analysis_stats["analysis_by_date"]:
            self.analysis_stats["analysis_by_date"][today] = {
                "count": 0,
                "indicators_found": 0,
                "by_source": {"text": 0, "url": 0}
            }
        
        # Update today's stats
        self.analysis_stats["analysis_by_date"][today]["count"] += 1
        self.analysis_stats["analysis_by_date"][today]["indicators_found"] += results["total_indicators_found"]
        self.analysis_stats["analysis_by_date"][today]["by_source"][input_type] += 1
        
        # Update source type count
        self.analysis_stats["source_types"][input_type] += 1
        
        # Update domain stats if URL was provided
        if url:
            domain = self._extract_domain(url)
            if domain not in self.analysis_stats["analyzed_domains"]:
                self.analysis_stats["analyzed_domains"][domain] = {
                    "count": 0,
                    "total_indicators": 0,
                    "last_analyzed": today
                }
            
            # Update domain stats
            self.analysis_stats["analyzed_domains"][domain]["count"] += 1
            self.analysis_stats["analyzed_domains"][domain]["total_indicators"] += results["total_indicators_found"]
            self.analysis_stats["analyzed_domains"][domain]["last_analyzed"] = today
            
            # Add to recent URLs (keeping only the last 50)
            recent_url_entry = {
                "url": url,
                "domain": domain,
                "date": today,
                "indicators_count": results["total_indicators_found"]
            }
            
            # Add to recent URLs list, maintaining max length of 50
            self.analysis_stats["recent_urls"] = [recent_url_entry] + self.analysis_stats["recent_urls"]
            if len(self.analysis_stats["recent_urls"]) > 50:
                self.analysis_stats["recent_urls"] = self.analysis_stats["recent_urls"][:50]
            
            # Update most indicative URLs if this URL has significant indicators
            if results["total_indicators_found"] > 0:
                # Add to most indicative URLs
                indicative_url_entry = {
                    "url": url,
                    "domain": domain,
                    "date": today,
                    "indicators_count": results["total_indicators_found"],
                    "indicators": [ind["indicator_id"] for ind in results.get("results", [])]
                }
                
                # Insert into most_indicative_urls, keeping it sorted by indicator count
                self.analysis_stats["most_indicative_urls"].append(indicative_url_entry)
                self.analysis_stats["most_indicative_urls"].sort(
                    key=lambda x: x["indicators_count"], 
                    reverse=True
                )
                
                # Keep only top 50
                self.analysis_stats["most_indicative_urls"] = self.analysis_stats["most_indicative_urls"][:50]
        
        # Update methods used
        if "analysis_methods" in results:
            for method, used in results["analysis_methods"].items():
                if used:
                    self.analysis_stats["analysis_methods_used"][method] = self.analysis_stats["analysis_methods_used"].get(method, 0) + 1
        
        # Update indicators found stats
        for indicator in results.get("results", []):
            indicator_id = indicator["indicator_id"]
            self.analysis_stats["indicators_found"][indicator_id] = self.analysis_stats["indicators_found"].get(indicator_id, 0) + 1
            
            # Update top keywords
            for keyword in indicator.get("found_keywords", []):
                keyword_text = keyword["text"]
                strength = keyword["strength"]
                if keyword_text not in self.analysis_stats["top_keywords"]:
                    self.analysis_stats["top_keywords"][keyword_text] = {
                        "count": 0,
                        "strength": strength,
                        "indicator_id": indicator_id
                    }
                self.analysis_stats["top_keywords"][keyword_text]["count"] += 1
        
        # Save updated stats
        self._save_stats()
    
    def _save_stats(self):
        """Save the current stats to a JSON file."""
        try:
            with open('logs/analysis_stats.json', 'w', encoding='utf-8') as f:
                json.dump(self.analysis_stats, f, indent=2)
        except Exception as e:
            print(f"Error saving stats file: {e}")
    
    def _log_analysis(self, text: str, results: Dict[str, Any], settings: Dict[str, Any], input_type: str, url: Optional[str] = None):
        """
        Log analysis results to a JSON file.
        
        Args:
            text: The analyzed text
            results: The analysis results
            settings: The settings used for the analysis
            input_type: "text" or "url"
            url: Optional URL if input_type is "url"
        """
        # Create a hash of the text to use as a unique identifier
        text_hash = hashlib.md5(text.encode()).hexdigest()
        
        # Create the log entry
        log_entry = {
            "id": text_hash,
            "timestamp": datetime.datetime.now().isoformat(),
            "input_type": input_type,
            "text_length": len(text),
            "settings": settings,
            "results": results,
            "text_excerpt": text[:300] + "..." if len(text) > 300 else text  # Store a preview of the text
        }
        
        # Add URL information if applicable
        if url:
            domain = self._extract_domain(url)
            log_entry["url"] = url
            log_entry["domain"] = domain
        
        # Save the log entry to a JSON file
        try:
            log_filename = f"logs/analysis_{text_hash}.json"
            with open(log_filename, 'w', encoding='utf-8') as f:
                json.dump(log_entry, f, indent=2)
        except Exception as e:
            print(f"Error logging analysis: {e}")
    
    def fetch_text_from_url(self, url: str) -> Optional[str]:
        """
        Fetch and extract main text content from a URL.
        
        Args:
            url: The URL to scrape.
            
        Returns:
            Extracted text or None if failed.
        """
        # Check cache first
        cached_content = self.cache.get_url_content(url)
        if cached_content:
            return cached_content["text"]
            
        # If not in cache, fetch from web
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script_or_style in soup(['script', 'style', 'header', 'footer', 'nav']):
                script_or_style.decompose()
            
            # Get the main content (prioritizing main, article tags)
            main_content = soup.find('main') or soup.find('article') or soup.find('div', class_=re.compile(r'content|article|post|body'))
            
            if main_content:
                text = main_content.get_text(separator=' ', strip=True)
            else:
                # Fallback to body if no main content container identified
                text = soup.body.get_text(separator=' ', strip=True)
            
            # Clean up text (remove multiple spaces, newlines)
            text = re.sub(r'\s+', ' ', text).strip()
            
            # Cache the result
            self.cache.set_url_content(url, text)
            
            return text
        except Exception as e:
            print(f"Error scraping URL {url}: {e}")
            return None
    
    def preprocess_text(self, text: str) -> Tuple[str, List[str], List[str]]:
        """
        Preprocess the text for analysis.
        
        Args:
            text: Input text.
            
        Returns:
            Tuple containing:
            - Preprocessed text
            - List of sentences
            - List of words
        """
        # Convert to lowercase for case-insensitive matching
        text_lower = text.lower()
        
        # Remove excessive whitespace
        text_lower = re.sub(r'\s+', ' ', text_lower).strip()
        
        # Tokenize into sentences and words
        sentences = sent_tokenize(text_lower)
        words = word_tokenize(text_lower)
        
        return text_lower, sentences, words
    
    def _keyword_matching(self, 
                         text: str, 
                         sentences: List[str], 
                         words: List[str], 
                         indicators: List[Dict[str, Any]], 
                         min_strength: str = 'low') -> List[Dict[str, Any]]:
        """
        Basic keyword matching analysis.
        
        Args:
            text: Preprocessed text
            sentences: List of sentences
            words: List of words
            indicators: List of indicator dictionaries
            min_strength: Minimum strength level to consider
            
        Returns:
            List of indicator results
        """
        results = []
        
        strength_levels = {"low": 1, "medium": 2, "high": 3}
        min_strength_value = strength_levels.get(min_strength, 1)
        
        for indicator in indicators:
            indicator_id = indicator['id']
            indicator_name = indicator['name']
            indicator_description = indicator['description']
            keywords = indicator['keywords']
            
            found_keywords = []
            found_context = []
            highest_strength = None
            
            for keyword_info in keywords:
                keyword = keyword_info['text'].lower()
                strength = keyword_info['strength']
                
                # Skip keywords with strength below threshold
                if strength_levels.get(strength, 0) < min_strength_value:
                    continue
                
                # Check if the keyword exists in the text
                if keyword in text:
                    found_keywords.append({
                        "text": keyword,
                        "strength": strength
                    })
                    
                    # Update highest strength
                    if not highest_strength or strength_levels.get(strength, 0) > strength_levels.get(highest_strength, 0):
                        highest_strength = strength
                    
                    # Find the context where the keyword appears
                    for sentence in sentences:
                        if keyword in sentence:
                            # Add highlighted context
                            highlighted = sentence.replace(keyword, f"**{keyword}**")
                            if highlighted not in found_context:
                                found_context.append(highlighted)
            
            if found_keywords:
                results.append({
                    "indicator_id": indicator_id,
                    "indicator_name": indicator_name,
                    "indicator_description": indicator_description,
                    "found_keywords": found_keywords,
                    "overall_strength": highest_strength or "low",
                    "context": found_context[:5]  # Limit to 5 context examples
                })
        
        return results
    
    def _frequency_analysis(self, 
                           text: str, 
                           words: List[str], 
                           indicator_results: List[Dict[str, Any]], 
                           min_occurrences: int = 1) -> List[Dict[str, Any]]:
        """
        Analyze frequency of keyword occurrences.
        
        Args:
            text: Preprocessed text
            words: List of words from text
            indicator_results: Initial results from keyword matching
            min_occurrences: Minimum occurrences required to include in results
            
        Returns:
            Enhanced indicator results with frequency data
        """
        total_words = len(words)
        if total_words == 0:
            return indicator_results
        
        enhanced_results = []
        
        for indicator in indicator_results:
            all_keywords = [kw["text"] for kw in indicator["found_keywords"]]
            all_occurrences = []
            
            # Count occurrences of each keyword
            keyword_counts = {}
            for keyword in all_keywords:
                # Count using regex with word boundaries to avoid partial matches
                pattern = r'\b' + re.escape(keyword) + r'\b'
                matches = re.findall(pattern, text)
                count = len(matches)
                if count >= min_occurrences:
                    keyword_counts[keyword] = count
                    all_occurrences.extend(matches)
            
            # Skip if no keywords meet the minimum occurrence threshold
            if not keyword_counts:
                continue
            
            # Calculate total occurrences and density
            total_occurrences = sum(keyword_counts.values())
            density = (total_occurrences / total_words) * 100
            
            # Add frequency data to the indicator
            indicator_with_freq = indicator.copy()
            indicator_with_freq["frequency_data"] = {
                "keyword_counts": keyword_counts,
                "total_occurrences": total_occurrences,
                "density": density
            }
            
            # Adjust overall strength based on frequency
            if density > 2.0:  # More than 2% of words are indicators
                if indicator_with_freq["overall_strength"] != "high":
                    indicator_with_freq["overall_strength"] = "high"
            elif density > 1.0:  # More than 1% of words are indicators
                if indicator_with_freq["overall_strength"] == "low":
                    indicator_with_freq["overall_strength"] = "medium"
            
            enhanced_results.append(indicator_with_freq)
        
        return enhanced_results if enhanced_results else indicator_results
    
    def _proximity_analysis(self, 
                           text: str, 
                           words: List[str], 
                           indicator_results: List[Dict[str, Any]], 
                           max_distance: int = 20) -> List[Dict[str, Any]]:
        """
        Analyze proximity between indicator keywords.
        
        Args:
            text: Preprocessed text
            words: List of words from text
            indicator_results: Initial results from keyword matching
            max_distance: Maximum word distance to consider keywords related
            
        Returns:
            Enhanced indicator results with proximity data
        """
        if not words or not indicator_results:
            return indicator_results
        
        # Create a mapping of words to their positions
        word_positions = {}
        for i, word in enumerate(words):
            if word not in word_positions:
                word_positions[word] = []
            word_positions[word].append(i)
        
        enhanced_results = []
        
        for indicator in indicator_results:
            # Extract all found keywords
            found_keywords = indicator.get("found_keywords", [])
            if not found_keywords:
                enhanced_results.append(indicator)
                continue
                
            # For better representation in proximity results, extract representative words
            # from multi-word keywords that can be found in the text
            keyword_representatives = []
            for kw_info in found_keywords:
                kw_text = kw_info["text"]
                kw_words = kw_text.split()
                
                # For multi-word keywords, find the most distinctive word
                if len(kw_words) > 1:
                    # Try to find the least common word that's in our word_positions
                    distinctive_words = [w for w in kw_words if w in word_positions]
                    if distinctive_words:
                        # Sort by frequency (use the least common word)
                        sorted_words = sorted(distinctive_words, 
                                             key=lambda w: len(word_positions.get(w, [])))
                        keyword_representatives.append(sorted_words[0])
                    else:
                        # Fallback to first word if none found
                        first_word = kw_words[0]
                        if first_word in word_positions:
                            keyword_representatives.append(first_word)
                else:
                    # Single word keyword
                    if kw_words[0] in word_positions:
                        keyword_representatives.append(kw_words[0])
            
            proximity_matches = []
            
            # Check all pairs of keywords
            for i, kw1 in enumerate(keyword_representatives):
                for j, kw2 in enumerate(keyword_representatives[i+1:], i+1):
                    # Check all positions of kw1
                    for pos1 in word_positions[kw1]:
                        # Check all positions of kw2
                        for pos2 in word_positions[kw2]:
                            distance = abs(pos1 - pos2)
                            if distance <= max_distance and distance > 0:
                                # Found a proximity match
                                proximity_matches.append({
                                    "keyword1": kw1,
                                    "keyword2": kw2,
                                    "distance": distance
                                })
                                break  # Only record the closest match for this position
            
            # Add proximity data to the indicator if found
            if proximity_matches:
                indicator_with_prox = indicator.copy()
                indicator_with_prox["proximity_matches"] = proximity_matches[:5]  # Limit to 5 examples
                
                # Adjust overall strength if there are close proximity matches
                close_matches = sum(1 for match in proximity_matches if match["distance"] < 10)
                if close_matches >= 3:
                    if indicator_with_prox["overall_strength"] != "high":
                        indicator_with_prox["overall_strength"] = "high"
                elif close_matches >= 1:
                    if indicator_with_prox["overall_strength"] == "low":
                        indicator_with_prox["overall_strength"] = "medium"
                
                enhanced_results.append(indicator_with_prox)
            else:
                enhanced_results.append(indicator)
        
        return enhanced_results
    
    def _context_analysis(self, 
                         sentences: List[str], 
                         indicator_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Analyze the context around found keywords for stronger pattern detection.
        
        Args:
            sentences: List of sentences
            indicator_results: Initial results from keyword matching
            
        Returns:
            Enhanced indicator results with context analysis
        """
        if not sentences or not indicator_results:
            return indicator_results
        
        # Define contextual amplifiers that increase the significance of a keyword
        amplifiers = [
            "molto", "estremamente", "assolutamente", "completamente", "totalmente",
            "certamente", "sicuramente", "definitivamente", "chiaramente", "senza dubbio",
            "sempre", "mai", "tutti", "nessuno", "ogni", "ciascuno", "qualsiasi",
            "necessario", "essenziale", "fondamentale", "cruciale", "vitale",
            "deve", "dovrebbe", "bisogna", "necessita", "richiede"
        ]
        
        enhanced_results = []
        
        for indicator in indicator_results:
            found_context = indicator.get("context", [])
            found_amplifiers = []
            
            # Check each context for amplifiers
            for context in found_context:
                for amplifier in amplifiers:
                    if f" {amplifier} " in f" {context} ":
                        found_amplifiers.append(amplifier)
            
            # Add context analysis to the indicator
            indicator_with_context = indicator.copy()
            if found_amplifiers:
                indicator_with_context["contextual_amplifiers"] = list(set(found_amplifiers))
                
                # Adjust overall strength based on amplifiers
                if len(found_amplifiers) >= 3:
                    if indicator_with_context["overall_strength"] != "high":
                        indicator_with_context["overall_strength"] = "high"
                elif len(found_amplifiers) >= 1:
                    if indicator_with_context["overall_strength"] == "low":
                        indicator_with_context["overall_strength"] = "medium"
            
            enhanced_results.append(indicator_with_context)
        
        return enhanced_results
    
    def _pattern_matching(self, 
                         text: str, 
                         sentences: List[str], 
                         indicator_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Apply regex pattern matching for complex indicator patterns.
        
        Args:
            text: Preprocessed text
            sentences: List of sentences
            indicator_results: Initial results from keyword matching
            
        Returns:
            Enhanced indicator results with pattern matches
        """
        # Define regex patterns for each indicator category
        patterns = {
            "extreme_nationalism": [
                r'\b(nostr[ao]|italian[ao]|patri[ao])(?:\s+\w+){0,5}\s+(superior[ei]|miglior[ei]|grand[ei]|glori[ae])\b',
                r'\b(difendere|proteggere|salvare)(?:\s+\w+){0,3}\s+(italia|nazione|patria)\b'
            ],
            "revisionism": [
                r'\b(storia|verità)(?:\s+\w+){0,5}\s+(nascost[ao]|segret[ao]|manipolat[ao]|falsat[ao])\b',
                r'\b(non\s+è\s+vero|falso|bugia|menzogna)(?:\s+\w+){0,10}\s+(accadut[ao]|successo|Holocaust?o|genocidio)\b'
            ],
            "hate_speech": [
                r'\b(immigrat[io]|stranier[io]|migranti)(?:\s+\w+){0,5}\s+(invasion[ei]|pericol[io]|minacci[ae]|criminali)\b',
                r'\b(difendere|proteggere|salvare)(?:\s+\w+){0,3}\s+(razza|etnia|popolo|identità)\b'
            ],
            "specific_symbolism": [
                r'\b(duce|fascismo|ventennio)(?:\s+\w+){0,5}\s+(grand[ei]|glori[ae]|ritorner[àae])\b'
            ],
            "anti_democracy": [
                r'\b(democrazia|parlamento|repubblica)(?:\s+\w+){0,5}\s+(fall[iu]t[ao]|debole|corrott[ao]|inefficiente)\b',
                r'\b(serve|necessario|occorre)(?:\s+\w+){0,5}\s+(uomo\s+forte|leader\s+forte|mano\s+ferma)\b'
            ],
            "victimhood": [
                r'\b(italian[io]|nostr[ao]\s+popolo)(?:\s+\w+){0,5}\s+(vittim[ae]|perseguitat[io]|discriminat[io])\b',
                r'\b(ci|noi|italian[io])(?:\s+\w+){0,3}\s+(vogliono|cercano\s+di)(?:\s+\w+){0,3}\s+(sostituire|eliminare|cancellare)\b'
            ],
            "traditionalism": [
                r'\b(famiglia|valori|tradizion[ei])(?:\s+\w+){0,5}\s+(natural[ei]|distrutt[io]|attaccat[io]|minacciat[io])\b',
                r'\b(teoria|ideologia|propaganda)(?:\s+\w+){0,3}\s+gender\b'
            ],
            "militarism": [
                r'\b(lotta|battaglia|guerra|combattimento)(?:\s+\w+){0,5}\s+(necessari[ao]|inevitabile|occorre)\b',
                r'\b(violenza|forza)(?:\s+\w+){0,5}\s+(unica\s+soluzione|necessaria|richiesta)\b'
            ],
            "conspiracy_theories": [
                r'\b(poteri\s+forti|elite|lobby|globalisti)(?:\s+\w+){0,10}\s+(controllano|manipolano|dominano)\b',
                r'\b(piano|complotto|cospirazione)(?:\s+\w+){0,5}\s+(mondiale|globale|internazionale)\b'
            ],
            "enemy_otherization": [
                r'\b(nemici|traditori|collaborazionisti)(?:\s+\w+){0,5}\s+(intern[io]|della\s+patria|della\s+nazione)\b',
                r'\b(loro|questi)(?:\s+\w+){0,3}\s+(vogliono|cercano\s+di)(?:\s+\w+){0,3}\s+(distruggere|indebolire|sovvertire)\b'
            ]
        }
        
        enhanced_results = []
        
        # Group existing results by indicator_id for easy access
        results_by_id = {r["indicator_id"]: r for r in indicator_results}
        
        # Process each indicator category
        for category_id, regex_patterns in patterns.items():
            pattern_matches = []
            
            # Apply each regex pattern to the text
            for pattern in regex_patterns:
                matches = re.finditer(pattern, text)
                for match in matches:
                    matching_text = match.group(0)
                    pattern_matches.append(matching_text)
            
            if pattern_matches:
                # If we already have this indicator in results, enhance it
                if category_id in results_by_id:
                    indicator = results_by_id[category_id].copy()
                    
                    # Add pattern matches
                    indicator["pattern_matches"] = pattern_matches[:5]  # Limit to 5 examples
                    
                    # Increase strength due to pattern match
                    strength_levels = {"low": 1, "medium": 2, "high": 3}
                    current_strength = strength_levels.get(indicator["overall_strength"], 1)
                    if current_strength < 3:  # Not already high
                        indicator["overall_strength"] = "high" if current_strength == 2 else "medium"
                    
                    # Replace the existing indicator in our enhanced results
                    results_by_id[category_id] = indicator
                else:
                    # Find the indicator definition from our loaded indicators
                    indicator_def = None
                    for ind in self.indicators:
                        if ind["id"] == category_id:
                            indicator_def = ind
                            break
                    
                    if indicator_def:
                        # Create a new indicator result
                        indicator = {
                            "indicator_id": category_id,
                            "indicator_name": indicator_def["name"],
                            "indicator_description": indicator_def["description"],
                            "found_keywords": [],  # No specific keywords, just pattern matches
                            "pattern_matches": pattern_matches[:5],  # Add pattern matches
                            "overall_strength": "medium"  # Default to medium strength for pattern matches
                        }
                        
                        # Add to our results
                        results_by_id[category_id] = indicator
        
        # Convert the dictionary back to a list
        enhanced_results = list(results_by_id.values())
        
        return enhanced_results
    
    def _sentiment_analysis(self, 
                           text: str, 
                           sentences: List[str], 
                           indicator_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Basic sentiment analysis to detect emotional tone.
        
        Args:
            text: The preprocessed text
            sentences: List of sentences
            indicator_results: Initial results from keyword matching
            
        Returns:
            Enhanced indicator results with sentiment data
        """
        # Simple approach using polarity lexicons
        positive_words = {
            "buono", "grande", "migliore", "positivo", "ottimo", "eccellente", "giusto", 
            "perfetto", "bene", "forte", "vero", "superiore", "glorioso", "felice", "meraviglioso"
        }
        
        negative_words = {
            "cattivo", "terribile", "peggiore", "negativo", "pessimo", "orribile", "sbagliato", 
            "difettoso", "male", "debole", "falso", "inferiore", "triste", "tragico", "pericoloso"
        }
        
        threat_words = {
            "minaccia", "pericolo", "rischio", "attacco", "difesa", "protezione", "invasione", 
            "nemico", "traditore", "combattere", "guerra", "battaglia", "lotta", "crisi", "emergenza"
        }
        
        # Calculate sentiment scores
        words_lower = [w.lower() for w in text.split()]
        
        positive_score = sum(1 for w in words_lower if w in positive_words)
        negative_score = sum(1 for w in words_lower if w in negative_words)
        threat_score = sum(1 for w in words_lower if w in threat_words)
        
        # Calculate total sentiment
        total_sentiment = positive_score - negative_score
        normalized_sentiment = total_sentiment / len(words_lower) if words_lower else 0
        
        # Enhance existing results with sentiment data
        enhanced_results = []
        
        for indicator in indicator_results:
            indicator_with_sentiment = indicator.copy()
            
            # Add sentiment data
            indicator_with_sentiment["sentiment_data"] = {
                "positive_score": positive_score,
                "negative_score": negative_score,
                "threat_score": threat_score,
                "total_sentiment": total_sentiment,
                "normalized_sentiment": normalized_sentiment
            }
            
            # Adjust overall strength based on threat score
            if threat_score > 5 and threat_score / len(words_lower) > 0.02:  # More than 2% threat words
                if indicator_with_sentiment["overall_strength"] != "high":
                    indicator_with_sentiment["overall_strength"] = "high"
            
            enhanced_results.append(indicator_with_sentiment)
        
        return enhanced_results
    
    def _noun_phrase_analysis(self, 
                             text: str, 
                             sentences: List[str], 
                             indicator_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Simple noun phrase analysis to detect ideological patterns.
        
        Args:
            text: The preprocessed text
            sentences: List of sentences
            indicator_results: Initial results from keyword matching
            
        Returns:
            Enhanced indicator results with noun phrase patterns
        """
        # Defining ideological patterns (common noun phrases)
        nationalist_phrases = [
            r'(nostr[oa] (popolo|nazione|patria|paese|terra|cultura|tradizione|identità))',
            r'(grand[ei] (italia|nazione|patria|paese|popolo))',
            r'(vera (italia|nazione|patria|identità))',
            r'(difesa (nazionale|della patria|dell\'italia|dei confini))',
            r'(italia agli italiani)',
            r'(italiani (prima|veri))'
        ]
        
        anti_democratic_phrases = [
            r'((falsa|finta) democrazia)', 
            r'(governo (forte|autoritario|deciso))',
            r'(mano (dura|ferma|forte))',
            r'(leadership (forte|decisa))',
            r'(parlamento (corrotto|inutile|inefficace))',
            r'(classe politica (corrotta|venduta|traditrice))'
        ]
        
        enemy_phrases = [
            r'((loro|questi) vogliono (distruggere|eliminare|cancellare))',
            r'(nemici (interni|esterni|dell\'italia|della patria|del popolo))',
            r'(traditori (della patria|dell\'italia|del popolo))',
            r'(poteri (forti|occulti|globali))',
            r'(complotto (internazionale|mondiale|globale))',
            r'(piano (di sostituzione|per (distruggere|eliminare)))'
        ]
        
        # Find matches in the text
        nationalist_matches = []
        for pattern in nationalist_phrases:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                nationalist_matches.append(match.group(0))
        
        anti_democratic_matches = []
        for pattern in anti_democratic_phrases:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                anti_democratic_matches.append(match.group(0))
        
        enemy_matches = []
        for pattern in enemy_phrases:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                enemy_matches.append(match.group(0))
        
        # Group all matches
        all_phrase_matches = {
            "nationalist_phrases": nationalist_matches,
            "anti_democratic_phrases": anti_democratic_matches,
            "enemy_phrases": enemy_matches
        }
        
        # Enhance existing results
        enhanced_results = []
        
        for indicator in indicator_results:
            indicator_with_phrases = indicator.copy()
            
            # Add phrase matches data
            indicator_with_phrases["noun_phrase_matches"] = {
                k: v[:3] for k, v in all_phrase_matches.items() if v  # Limit to 3 examples per category
            }
            
            # Adjust overall strength based on phrase matches
            total_phrases = sum(len(v) for v in all_phrase_matches.values())
            if total_phrases >= 5:
                if indicator_with_phrases["overall_strength"] != "high":
                    indicator_with_phrases["overall_strength"] = "high"
            elif total_phrases >= 2:
                if indicator_with_phrases["overall_strength"] == "low":
                    indicator_with_phrases["overall_strength"] = "medium"
            
            enhanced_results.append(indicator_with_phrases)
        
        return enhanced_results
    
    def _propaganda_technique_analysis(self, 
                                      text: str, 
                                      sentences: List[str], 
                                      indicator_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Analyze for common propaganda techniques.
        
        Args:
            text: The preprocessed text
            sentences: List of sentences
            indicator_results: Initial results from keyword matching
            
        Returns:
            Enhanced indicator results with propaganda technique detection
        """
        # Define propaganda techniques patterns
        techniques = {
            "bandwagon": [
                r'tutt[ie] (sanno|pensano|credono|sono d\'accordo)',
                r'(la maggioranza|la gente|gli italiani) (vuole|pensa|crede|sa)',
                r'(è ormai|è diventato) (evidente|chiaro|ovvio) (a tutti|per tutti)'
            ],
            "black_and_white": [
                r'(o con noi o contro di noi)',
                r'(amico o nemico)',
                r'(patriot[ai] o traditor[ei])',
                r'(o si è|o sei) (italian[oi]|patriot[ai]) o',
                r'non ci sono vie di mezzo',
                r'(senza|non esistono) mezze misure'
            ],
            "appeal_to_fear": [
                r'(se non|se continuiamo) (agiamo|facciamo|interveniamo) (sarà|potrebbe essere|diventerà) (troppo tardi|la fine)',
                r'(rischiamo|siamo a rischio di) (estinzione|sostituzione|distruzione|fine)',
                r'(la nostra (civiltà|cultura|nazione|società)) (è in pericolo|rischia di scomparire)',
                r'(stanno cercando di|vogliono|il loro piano è) (distrugg|elimin|cancell)are'
            ],
            "glittering_generalities": [
                r'(vero|autentico|puro) (italiano|patriota|cittadino)',
                r'(valori|principi|tradizioni) (veri|autentici|puri)',
                r'(vera|autentica|pura) (libertà|giustizia|democrazia)',
                r'(onore|gloria|dignità|orgoglio) (nazionale|patrio|italiano)'
            ],
            "name_calling": [
                r'(traditor[ei]|vendut[oi]|corrot[oi]|nemici|buonist[ai])',
                r'(radical chic|zeccch[ei]|comunist[ai]|fascist[ai]|nazis[ai]|teppist[ai])',
                r'(sciacall[ai]|opportunist[ai]|profitator[ai]|parassit[ai])',
                r'(invasor[ei]|illegali|clandestini|criminali)'
            ]
        }
        
        # Find matches for each technique
        technique_matches = {}
        for technique, patterns in techniques.items():
            matches = []
            for pattern in patterns:
                for match in re.finditer(pattern, text, re.IGNORECASE):
                    matches.append(match.group(0))
            if matches:
                technique_matches[technique] = matches
        
        # Calculate propaganda score
        total_techniques = len(technique_matches)
        total_instances = sum(len(matches) for matches in technique_matches.values())
        
        # Enhance existing results
        enhanced_results = []
        
        for indicator in indicator_results:
            indicator_with_propaganda = indicator.copy()
            
            # Add propaganda data
            indicator_with_propaganda["propaganda_techniques"] = {
                technique: matches[:3] for technique, matches in technique_matches.items()  # Limit to 3 examples per technique
            }
            
            indicator_with_propaganda["propaganda_score"] = {
                "total_techniques": total_techniques,
                "total_instances": total_instances
            }
            
            # Adjust overall strength based on propaganda score
            if total_techniques >= 3 or total_instances >= 5:
                if indicator_with_propaganda["overall_strength"] != "high":
                    indicator_with_propaganda["overall_strength"] = "high"
            elif total_techniques >= 2 or total_instances >= 3:
                if indicator_with_propaganda["overall_strength"] == "low":
                    indicator_with_propaganda["overall_strength"] = "medium"
            
            enhanced_results.append(indicator_with_propaganda)
        
        return enhanced_results
    
    def analyze_text(self, text: str, settings: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyze text for indicators of fascist rhetoric using methods specified in settings.
        
        Args:
            text: Text to analyze.
            settings: Dictionary containing analysis settings.
            
        Returns:
            Dictionary containing analysis results.
        """
        if not text:
            return {"error": "Empty text provided", "results": []}
        
        # Check cache first for this exact text
        cached_results = self.cache.get_text_analysis(text)
        if cached_results:
            return cached_results
        
        # Default settings if none provided
        if settings is None:
            settings = {
                "methods": {
                    "keywordMatching": True,
                    "contextAnalysis": False,
                    "frequencyAnalysis": False,
                    "proximityAnalysis": False,
                    "patternMatching": False,
                    "sentimentAnalysis": False,
                    "nounPhraseAnalysis": False,
                    "propagandaTechniqueAnalysis": False
                },
                "thresholds": {
                    "minKeywordStrength": "low",
                    "minOccurrences": 1,
                    "proximityDistance": 20
                },
                "categories": []  # All categories if empty
            }
        
        # Extract settings
        methods = settings.get("methods", {})
        thresholds = settings.get("thresholds", {})
        category_ids = settings.get("categories", [])
        
        # Preprocess text
        preprocessed_text, sentences, words = self.preprocess_text(text)
        
        # Filter indicators by category if specified
        filtered_indicators = self.indicators
        if category_ids:
            filtered_indicators = [ind for ind in self.indicators if ind["id"] in category_ids]
        
        results = []
        
        # Track which analysis methods were used
        used_methods = {}
        
        # Apply selected analysis methods in sequence
        
        # 1. Basic keyword matching (always required as it's the foundation)
        used_methods["keywordMatching"] = True
        min_strength = thresholds.get("minKeywordStrength", "low")
        results = self._keyword_matching(preprocessed_text, sentences, words, filtered_indicators, min_strength)
        
        # If no results from keyword matching and no pattern matching, return early
        if not results and not methods.get("patternMatching", False):
            analysis_results = {
                "total_indicators_found": 0,
                "results": [],
                "analysis_methods": used_methods
            }
            # Cache the results
            self.cache.set_text_analysis(text, analysis_results)
            return analysis_results
        
        # 2. Frequency analysis
        if methods.get("frequencyAnalysis", False):
            used_methods["frequencyAnalysis"] = True
            min_occurrences = thresholds.get("minOccurrences", 1)
            results = self._frequency_analysis(preprocessed_text, words, results, min_occurrences)
        
        # 3. Proximity analysis
        if methods.get("proximityAnalysis", False):
            used_methods["proximityAnalysis"] = True
            proximity_distance = thresholds.get("proximityDistance", 20)
            results = self._proximity_analysis(preprocessed_text, words, results, proximity_distance)
        
        # 4. Context analysis
        if methods.get("contextAnalysis", False):
            used_methods["contextAnalysis"] = True
            results = self._context_analysis(sentences, results)
        
        # 5. Pattern matching
        if methods.get("patternMatching", False):
            used_methods["patternMatching"] = True
            results = self._pattern_matching(preprocessed_text, sentences, results)
        
        # 6. Sentiment analysis (new)
        if methods.get("sentimentAnalysis", False):
            used_methods["sentimentAnalysis"] = True
            results = self._sentiment_analysis(preprocessed_text, sentences, results)
        
        # 7. Noun phrase analysis (new)
        if methods.get("nounPhraseAnalysis", False):
            used_methods["nounPhraseAnalysis"] = True
            results = self._noun_phrase_analysis(preprocessed_text, sentences, results)
        
        # 8. Propaganda technique analysis (new)
        if methods.get("propagandaTechniqueAnalysis", False):
            used_methods["propagandaTechniqueAnalysis"] = True
            results = self._propaganda_technique_analysis(preprocessed_text, sentences, results)
        
        analysis_results = {
            "total_indicators_found": len(results),
            "results": results,
            "analysis_methods": used_methods
        }
        
        # Cache the results
        self.cache.set_text_analysis(text, analysis_results)
        
        return analysis_results
    
    def analyze_input(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze input data which can be either text or URL, with optional settings.
        
        Args:
            input_data: Dictionary containing "text" or "url", and optional "settings".
            
        Returns:
            Dictionary containing analysis results.
        """
        text = input_data.get("text", "")
        url = input_data.get("url", "")
        settings = input_data.get("settings", None)
        
        if not text and not url:
            return {"error": "No text or URL provided", "results": []}
        
        # Flag to track if result was from cache
        cache_hit = False
        
        if url:
            # Check URL cache first
            cached_url_data = self.cache.get_url_content(url)
            
            if cached_url_data and cached_url_data.get("results") and settings is None:
                # If we have cached results and no custom settings, use cached results
                cache_hit = True
                results = cached_url_data["results"]
            else:
                # Either no cached results or custom settings
                scraped_text = self.fetch_text_from_url(url)
                if not scraped_text:
                    return {"error": f"Failed to scrape content from URL: {url}", "results": []}
                text = scraped_text
                results = self.analyze_text(text, settings)
                
                # Cache the results along with content
                self.cache.set_url_content(url, text, results)
        else:
            # Check text cache
            cached_results = self.cache.get_text_analysis(text)
            
            if cached_results and settings is None:
                # If we have cached results and no custom settings, use cached results
                cache_hit = True
                results = cached_results
            else:
                # Either no cached results or custom settings
                results = self.analyze_text(text, settings)
        
        # Log the analysis
        input_type = "url" if url else "text"
        self._log_analysis(text, results, settings, input_type, url if url else None)
        
        # Update stats
        self._update_stats(results, input_type, url if url else None, cache_hit)
        
        return results