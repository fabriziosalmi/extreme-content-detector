"""
FastAPI backend for the AntiFa Model application.
Handles text analysis and URL scraping.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any, Union
from analysis import TextAnalyzer

app = FastAPI(title="AntiFa Model API")

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the analyzer
analyzer = TextAnalyzer()

class AnalysisInput(BaseModel):
    """Model for the analysis input data."""
    text: Optional[str] = None
    url: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None

@app.get("/")
async def root():
    """Root endpoint, returns basic API info."""
    return {"message": "AntiFa Model API is running"}

@app.post("/analyze")
async def analyze_text(input_data: AnalysisInput):
    """
    Analyze text or URL content for indicators of fascist rhetoric.
    
    Args:
        input_data: Contains text or URL to analyze and optional settings.
        
    Returns:
        Analysis results.
    """
    if not input_data.text and not input_data.url:
        raise HTTPException(status_code=400, detail="Either text or URL must be provided")
    
    # Convert Pydantic model to dict for the analyzer
    input_dict = input_data.dict()
    
    # Perform analysis with settings
    results = analyzer.analyze_input(input_dict)
    
    if "error" in results:
        raise HTTPException(status_code=400, detail=results["error"])
    
    return results

@app.get("/indicators")
async def get_indicators():
    """
    Get all available indicators for reference.
    
    Returns:
        List of all indicators.
    """
    return {"indicators": analyzer.indicators}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)