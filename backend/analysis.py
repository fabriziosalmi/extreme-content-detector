"""
Enhanced analysis module for identifying indicators of fascist rhetoric in text.
Includes multiple analysis methods and configurable thresholds.
"""
import json
import re
import os
import datetime
from typing import Dict, List, Optional, Any, Tuple, Set
import requests
from bs4 import BeautifulSoup
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
import hashlib
import urllib.parse  # For URL domain extraction

# Download necessary NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

# Create logs directory if it doesn't exist
os.makedirs('logs', exist_ok=True)

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
            "most_indicative_urls": []  # URLs with highest indicator counts
        }
        self._load_stats()
        
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
    
    def _update_stats(self, results: Dict[str, Any], input_type: str, url: Optional[str] = None):
        """
        Update statistics about analyses.
        
        Args:
            results: The analysis results
            input_type: "text" or "url"
            url: Optional URL if input_type is "url"
        """
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
                        results_by_id[category_id] = indicator
        
        # Convert the dictionary back to a list
        enhanced_results = list(results_by_id.values())
        
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
        
        # Default settings if none provided
        if settings is None:
            settings = {
                "methods": {
                    "keywordMatching": True,
                    "contextAnalysis": False,
                    "frequencyAnalysis": False,
                    "proximityAnalysis": False,
                    "patternMatching": False
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
            return {
                "total_indicators_found": 0,
                "results": [],
                "analysis_methods": used_methods
            }
        
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
        
        return {
            "total_indicators_found": len(results),
            "results": results,
            "analysis_methods": used_methods
        }
    
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
        
        if url:
            scraped_text = self.fetch_text_from_url(url)
            if not scraped_text:
                return {"error": f"Failed to scrape content from URL: {url}", "results": []}
            text = scraped_text
        
        results = self.analyze_text(text, settings)
        
        # Log the analysis
        input_type = "url" if url else "text"
        self._log_analysis(text, results, settings, input_type)
        
        # Update stats
        self._update_stats(results, input_type)
        
        return results