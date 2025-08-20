import openai
import json
import os
from typing import Dict, List, Any
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TextAnalyzer:
    def __init__(self):
        # Load environment variables from env.local file
        self._load_env_vars()
        
        # Initialize OpenAI client
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            logger.error("OPENAI_API_KEY not found in environment variables")
            raise ValueError("OPENAI_API_KEY is required")
        
        logger.info("Initializing OpenAI client with API key")
        # Use hardcoded API key for testing
        self.client = openai.OpenAI(api_key="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")
        
    def _load_env_vars(self):
        """Load environment variables from env.local file"""
        env_file = Path(__file__).parent / 'env.local'
        if env_file.exists():
            logger.info(f"Loading environment variables from {env_file}")
            with open(env_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        os.environ[key] = value
                        logger.info(f"Loaded environment variable: {key}")
        else:
            logger.warning(f"env.local file not found at {env_file}")
        
    def analyze_text(self, text_content: str) -> Dict[str, Any]:
        """
        Analyze text content using ChatGPT and return structured feedback
        """
        try:
            # Clean and normalize the text content to handle UTF-8 encoding issues
            text_content = self._clean_text_content(text_content)
            logger.info(f"Starting text analysis for content: {text_content[:50]}...")
            
            # Create a comprehensive prompt for detailed analysis
            prompt = f"""
            As an expert English communication analyst, provide a COMPREHENSIVE analysis of this text with detailed feedback:
            
            Text: "{text_content}"
            
            IMPORTANT: Provide AT LEAST 3 specific strengths, 3 specific improvements, and 3 actionable suggestions. Even if the text is excellent, identify areas for enhancement.
            
            Return JSON format:
            {{
                "overallScore": [RATING_0_TO_1],
                "strengths": [
                    "Specific strength 1 with explanation",
                    "Specific strength 2 with explanation", 
                    "Specific strength 3 with explanation"
                ],
                "improvements": [
                    "Specific area for improvement 1 with details",
                    "Specific area for improvement 2 with details",
                    "Specific area for improvement 3 with details"
                ],
                "suggestions": [
                    "Specific actionable suggestion 1 with implementation",
                    "Specific actionable suggestion 2 with implementation",
                    "Specific actionable suggestion 3 with implementation"
                ],
                "categories": {{
                    "clarity": [RATING_0_TO_1],
                    "engagement": [RATING_0_TO_1],
                    "structure": [RATING_0_TO_1],
                    "impact": [RATING_0_TO_1]
                }},
                "detailedAnalysis": {{
                    "tone": "Detailed assessment of tone and style",
                    "readability": "Detailed assessment of readability and complexity",
                    "structure": "Detailed assessment of organization and flow",
                    "engagement": "Detailed assessment of audience engagement",
                    "actionability": "Detailed assessment of call-to-action and next steps"
                }}
            }}
            
            RATING CRITERIA:
            - Clarity (0-1): How clear and understandable is the message? Consider sentence structure, word choice, and logical flow.
            - Engagement (0-1): How engaging and interesting is the content? Consider hooks, storytelling, and audience connection.
            - Structure (0-1): How well-organized is the text? Consider logical flow, transitions, and overall coherence.
            - Impact (0-1): How effective is the text in achieving its purpose? Consider call-to-action, memorability, and persuasive power.
            
            Provide HONEST, DETAILED feedback. Even excellent texts can be improved. Always provide specific, actionable insights.
            """
            
            logger.info("Calling ChatGPT API...")
            # Call ChatGPT API with optimized settings
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert English communication analyst with years of experience. Your role is to provide COMPREHENSIVE, DETAILED feedback with specific insights. Always provide at least 3 strengths, 3 improvements, and 3 suggestions, even for excellent texts. Focus on actionable, specific feedback that helps writers improve their communication skills."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,  # Balanced temperature for detailed responses
                max_tokens=2000,  # Increased tokens for comprehensive feedback
                timeout=45  # Increased timeout for detailed analysis
            )
            
            logger.info("Received response from ChatGPT API")
            # Extract and parse the response
            analysis_text = response.choices[0].message.content.strip()
            logger.info(f"ChatGPT response: {analysis_text[:200]}...")
            
            # Try to extract JSON from the response
            try:
                # Look for JSON in the response
                start_idx = analysis_text.find('{')
                end_idx = analysis_text.rfind('}') + 1
                
                if start_idx != -1 and end_idx != 0:
                    json_str = analysis_text[start_idx:end_idx]
                    analysis_result = json.loads(json_str)
                    logger.info("Successfully parsed JSON response from ChatGPT")
                    
                    # Check if this is real GPT data with detailed content
                    has_detailed_content = (
                        analysis_result.get("strengths") and 
                        len(analysis_result.get("strengths", [])) >= 3 and
                        analysis_result.get("improvements") and 
                        len(analysis_result.get("improvements", [])) >= 3 and
                        analysis_result.get("suggestions") and 
                        len(analysis_result.get("suggestions", [])) >= 3
                    )
                    
                    if has_detailed_content:
                        logger.info("GPT provided comprehensive analysis with detailed feedback")
                        # Only validate score ranges, don't override real data
                        if "overallScore" in analysis_result:
                            analysis_result["overallScore"] = max(0.0, min(1.0, float(analysis_result["overallScore"])))
                        
                        if "categories" in analysis_result:
                            for category, score in analysis_result["categories"].items():
                                analysis_result["categories"][category] = max(0.0, min(1.0, float(score)))
                    else:
                        logger.warning("GPT response lacks detailed content, using fallback")
                        analysis_result = self._create_fallback_analysis(text_content)
                else:
                    logger.warning("No JSON found in ChatGPT response, using fallback")
                    analysis_result = self._create_fallback_analysis(text_content)
                    
            except json.JSONDecodeError as e:
                logger.warning(f"Failed to parse JSON response: {e}")
                logger.warning(f"Raw response: {analysis_text}")
                analysis_result = self._create_fallback_analysis(text_content)
            
            # Add source indicator
            analysis_result["_source"] = "gpt" if has_detailed_content else "fallback"
            
            return {
                "success": True,
                "data": analysis_result
            }
            
        except Exception as e:
            logger.error(f"Error in text analysis: {e}")
            return {
                "success": False,
                "error": str(e),
                "data": self._create_fallback_analysis(text_content)
            }
    
    def _create_fallback_analysis(self, text_content: str) -> Dict[str, Any]:
        """
        Create a fallback analysis when ChatGPT is not available
        """
        # Clean the text content first
        text_content = self._clean_text_content(text_content)
        
        # Basic text analysis
        word_count = len(text_content.split())
        char_count = len(text_content)
        sentence_count = text_content.count('.') + text_content.count('!') + text_content.count('?')
        
        # Calculate basic metrics for more realistic ratings
        avg_sentence_length = word_count / max(sentence_count, 1)
        
        # Calculate readability score based on sentence complexity
        if avg_sentence_length <= 10:
            readability_score = 0.9  # Very clear
        elif avg_sentence_length <= 15:
            readability_score = 0.8  # Clear
        elif avg_sentence_length <= 20:
            readability_score = 0.7  # Moderate
        elif avg_sentence_length <= 25:
            readability_score = 0.6  # Somewhat complex
        else:
            readability_score = 0.5  # Complex
        
        # Calculate structure score based on paragraph breaks and transitions
        paragraphs = text_content.split('\n\n')
        if len(paragraphs) > 1:
            structure_score = min(0.9, 0.6 + (len(paragraphs) * 0.1))
        else:
            structure_score = 0.6
        
        # Calculate engagement score based on question marks, exclamation points, and varied sentence types
        engagement_indicators = text_content.count('?') + text_content.count('!') + text_content.count('"')
        engagement_score = min(0.9, 0.5 + (engagement_indicators * 0.1))
        
        # Calculate impact score based on word count and content density
        if word_count >= 50:
            impact_score = min(0.9, 0.6 + (word_count / 100))
        else:
            impact_score = 0.5
        
        # Calculate overall score as average of all categories
        overall_score = (readability_score + structure_score + engagement_score + impact_score) / 4
        
        result = {
            "overallScore": round(overall_score, 2),
            "strengths": [
                f"Text contains {word_count} words with substantial content for analysis",
                "Content demonstrates thoughtful consideration of the topic",
                "Basic organizational structure is present and functional"
            ],
            "improvements": [
                "Consider adding specific examples or case studies to support your points",
                "Include more engaging opening statements to capture reader attention immediately",
                "Add clear call-to-action elements to guide readers on next steps"
            ],
            "suggestions": [
                "Break down complex sentences into shorter, more digestible segments for improved clarity",
                "Add transition words and phrases to create smoother flow between ideas",
                "Include relevant statistics, data, or expert quotes to strengthen your arguments"
            ],
            "categories": {
                "clarity": round(readability_score, 2),
                "engagement": round(engagement_score, 2),
                "structure": round(structure_score, 2),
                "impact": round(impact_score, 2)
            },
            "detailedAnalysis": {
                "tone": "Professional",
                "readability": f"Based on sentence complexity ({readability_score:.2f})",
                "structure": f"Based on paragraph organization ({structure_score:.2f})",
                "engagement": f"Based on interactive elements ({engagement_score:.2f})",
                "actionability": f"Based on content length and density ({impact_score:.2f})"
            },
            "textStats": {
                "wordCount": word_count,
                "charCount": char_count,
                "sentenceCount": sentence_count,
                "avgSentenceLength": round(avg_sentence_length, 1)
            },
            "_source": "fallback"
        }
        
        return result
    
    def _validate_analysis_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate and ensure all required fields are present in the analysis result
        ONLY if GPT failed to provide them - don't override real GPT data
        """
        # Check if this looks like real GPT data (has detailed content)
        has_real_gpt_data = (
            result.get("strengths") and 
            len(result.get("strengths", [])) >= 3 and
            any(len(strength) > 20 for strength in result.get("strengths", [])) and
            result.get("improvements") and 
            len(result.get("improvements", [])) >= 3 and
            result.get("suggestions") and 
            len(result.get("suggestions", [])) >= 3
        )
        
        if has_real_gpt_data:
            # This is real GPT data, just validate scores are in range
            if "overallScore" in result:
                result["overallScore"] = max(0.0, min(1.0, float(result["overallScore"])))
            
            if "categories" in result:
                for category, score in result["categories"].items():
                    result["categories"][category] = max(0.0, min(1.0, float(score)))
            
            logger.info("Using real GPT analysis data")
            return result
        
        # Only use fallback if GPT data is clearly incomplete
        logger.warning("GPT data appears incomplete, using fallback analysis")
        return self._create_fallback_analysis("")  # Will be overridden with actual text

    def _clean_text_content(self, text_content: str) -> str:
        """
        Clean and normalize text content to handle UTF-8 encoding issues
        """
        try:
            # Remove or replace problematic Unicode characters
            import unicodedata
            
            # Normalize Unicode characters
            text_content = unicodedata.normalize('NFKC', text_content)
            
            # Remove surrogate pairs and other problematic characters
            cleaned_text = ''
            for char in text_content:
                try:
                    # Try to encode and decode the character to check if it's valid
                    char.encode('utf-8').decode('utf-8')
                    cleaned_text += char
                except (UnicodeEncodeError, UnicodeDecodeError):
                    # Replace problematic characters with a space or similar character
                    if unicodedata.category(char).startswith('C'):  # Control characters
                        cleaned_text += ' '
                    else:
                        cleaned_text += char
            
            # Remove extra whitespace
            cleaned_text = ' '.join(cleaned_text.split())
            
            logger.info(f"Text cleaned: {len(text_content)} -> {len(cleaned_text)} characters")
            return cleaned_text
            
        except Exception as e:
            logger.warning(f"Error cleaning text content: {e}")
            # Fallback: try to encode/decode with error handling
            try:
                return text_content.encode('utf-8', errors='ignore').decode('utf-8')
            except:
                # Last resort: remove all non-ASCII characters
                return ''.join(char for char in text_content if ord(char) < 128)

# Example usage
if __name__ == "__main__":
    import sys
    import json
    
    try:
        # Read input from stdin with proper UTF-8 handling
        input_data = sys.stdin.buffer.read().decode('utf-8', errors='ignore')
        request = json.loads(input_data)
        
        text_content = request.get('text_content', '')
        analysis_type = request.get('analysis_type', 'text')
        
        if not text_content:
            print(json.dumps({
                "success": False,
                "error": "No text content provided"
            }))
            sys.exit(1)
        
        analyzer = TextAnalyzer()
        result = analyzer.analyze_text(text_content)
        # Ensure proper UTF-8 encoding for output
        print(json.dumps(result, ensure_ascii=False))
        
    except json.JSONDecodeError:
        print(json.dumps({
            "success": False,
            "error": "Invalid JSON input"
        }, ensure_ascii=False))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }, ensure_ascii=False))
        sys.exit(1) 