"""
Enhanced analysis module for identifying indicators of fascist rhetoric in text.
Includes multiple analysis methods and configurable thresholds.
"""
import json
import re
from typing import Dict, List, Optional, Any, Tuple, Set
import requests
from bs4 import BeautifulSoup
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize

# Download necessary NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

class TextAnalyzer:
    """Enhanced class responsible for analyzing text for indicators of fascist rhetoric."""
    
    def __init__(self, indicators_file: str = "indicators.json"):
        """
        Initialize the TextAnalyzer with indicators from a JSON file.
        
        Args:
            indicators_file: Path to the JSON file containing indicators.
        """
        self.indicators = self._load_indicators(indicators_file)
        
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
            all_keywords = [kw["text"].split() for kw in indicator["found_keywords"]]
            # Flatten multi-word keywords and keep only the first word for simplicity
            all_keywords = [words[0] for words in all_keywords if words]
            
            proximity_matches = []
            
            # Check all pairs of keywords
            for i, kw1 in enumerate(all_keywords):
                if kw1 not in word_positions:
                    continue
                    
                for j, kw2 in enumerate(all_keywords[i+1:], i+1):
                    if kw2 not in word_positions:
                        continue
                    
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
        
        return self.analyze_text(text, settings)