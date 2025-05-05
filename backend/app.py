"""
FastAPI backend for the AntiFa Model application.
Handles text analysis and URL scraping with Swagger documentation.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union
from analysis import TextAnalyzer
import os
import json
import datetime
from websocket_server import initialize_websocket_routes, start_background_tasks, cleanup_background_tasks
import asyncio

# Initialize FastAPI with metadata for documentation
app = FastAPI(
    title="AntiFa Model API",
    description="API per l'analisi di testi e URL per identificare indicatori retorici.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    contact={
        "name": "AntiFa Model Team",
        "url": "https://github.com/fab/antifa-model"
    },
    license_info={
        "name": "MIT License",
    }
)

# Register startup and shutdown event handlers
@app.on_event("startup")
async def startup_event():
    """Initialize background tasks when the app starts"""
    print("Starting background tasks...")
    await start_background_tasks()

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up background tasks when the app shuts down"""
    print("Shutting down, cleaning up background tasks...")
    await cleanup_background_tasks()

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Only allow the frontend origin in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the analyzer
analyzer = TextAnalyzer()

# Enhanced models with documentation for Swagger
class AnalysisSettings(BaseModel):
    """Model for analysis settings"""
    methods: Dict[str, bool] = Field(
        default_factory=lambda: {
            "keywordMatching": True,
            "contextAnalysis": False,
            "frequencyAnalysis": False,
            "proximityAnalysis": False,
            "patternMatching": False
        },
        description="Metodi di analisi da utilizzare"
    )
    thresholds: Dict[str, Any] = Field(
        default_factory=lambda: {
            "minKeywordStrength": "low",
            "minOccurrences": 1,
            "proximityDistance": 20
        },
        description="Soglie per l'analisi"
    )
    categories: List[str] = Field(
        default_factory=list,
        description="ID delle categorie da analizzare (vuoto = tutte)"
    )

class AnalysisInput(BaseModel):
    """Model for the analysis input data."""
    text: Optional[str] = Field(None, description="Testo da analizzare")
    url: Optional[str] = Field(None, description="URL da cui estrarre e analizzare il testo")
    settings: Optional[AnalysisSettings] = Field(None, description="Impostazioni di analisi personalizzate")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "text": "L'Italia deve tornare alla sua antica grandezza con un uomo forte al comando.",
                "url": None,
                "settings": {
                    "methods": {
                        "keywordMatching": True,
                        "contextAnalysis": True,
                        "frequencyAnalysis": True,
                        "proximityAnalysis": False,
                        "patternMatching": True
                    },
                    "thresholds": {
                        "minKeywordStrength": "low",
                        "minOccurrences": 1,
                        "proximityDistance": 20
                    },
                    "categories": ["extreme_nationalism", "anti_democracy"]
                }
            }
        }
    }

class LogParameters(BaseModel):
    """Model for log query parameters"""
    limit: int = Field(10, description="Numero massimo di log da restituire")
    skip: int = Field(0, description="Numero di log da saltare (per la paginazione)")

class AnalysisRequest(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None
    settings: Optional[dict] = None

    model_config = {
        "json_schema_extra": { # Renamed from schema_extra
            "examples": [
                {
                    "text": "Questo è un testo di esempio contenente parole chiave come rivoluzione e resistenza.",
                    "settings": {"keywordMatching": True, "contextAnalysis": False}
                },
                {
                    "url": "http://example.com/article",
                    "settings": {"sentimentAnalysis": True}
                }
            ]
        }
    }

# API Routes
@app.get("/", 
    summary="Informazioni API",
    description="Restituisce informazioni di base sull'API",
    response_description="Messaggio di stato dell'API",
    tags=["Informazioni"])
async def root():
    """Root endpoint, returns basic API info."""
    return {
        "message": "AntiFa Model API is running",
        "version": "1.0.0",
        "documentation": "/docs",
        "endpoints": {
            "analyze": "POST /analyze - Analizza testo o URL",
            "indicators": "GET /indicators - Ottieni tutti gli indicatori disponibili",
            "stats": "GET /stats - Ottieni statistiche globali",
            "logs": "GET /logs - Ottieni log delle analisi passate",
            "trends": "GET /trends - Ottieni dati di tendenza per la visualizzazione"
        }
    }

@app.post("/analyze", 
    response_model_exclude_none=True,
    summary="Analizza testo o URL",
    description="Analizza un testo o il contenuto di un URL per identificare indicatori retorici specifici",
    response_description="Risultati dell'analisi con indicatori trovati",
    tags=["Analisi"])
async def analyze_text(input_data: AnalysisInput):
    """
    Analyze text or URL content for indicators of fascist rhetoric.
    
    Args:
        input_data: Contains text or URL to analyze and optional settings.
        
    Returns:
        Analysis results with indicators found.
    """
    print(f"Received analysis request: text length={len(input_data.text or '')} url={input_data.url or 'None'}")
    
    if not input_data.text and not input_data.url:
        raise HTTPException(status_code=400, detail="Either text or URL must be provided")
    
    # Convert Pydantic model to dict for the analyzer
    input_dict = input_data.model_dump(exclude_none=True)
    
    try:
        # Perform analysis with settings
        results = analyzer.analyze_input(input_dict)
        
        if "error" in results:
            print(f"Analysis error: {results['error']}")
            raise HTTPException(status_code=400, detail=results["error"])
        
        # Add status field for frontend to check
        results["status"] = "success"
        results["cached"] = False  # Add indication if result was from cache
        
        print(f"Analysis completed: found {results.get('total_indicators_found', 0)} indicators")
        return results
    except Exception as e:
        print(f"Unexpected error during analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

@app.post("/analyze-comparison", 
    summary="Analisi Comparativa",
    description="Confronta due testi o URL per evidenziare differenze negli indicatori retorici",
    response_description="Risultati dell'analisi comparativa",
    tags=["Analisi"])
async def analyze_comparison(
    text1: Optional[str] = None, 
    url1: Optional[str] = None,
    text2: Optional[str] = None, 
    url2: Optional[str] = None, 
    settings: Optional[AnalysisSettings] = None
):
    """
    Compare two texts or URLs for rhetorical indicators differences.
    
    Args:
        text1: First text to analyze
        url1: First URL to analyze
        text2: Second text to analyze
        url2: Second URL to analyze
        settings: Analysis settings
    
    Returns:
        Comparative analysis results
    """
    # Validate input
    if not ((text1 or url1) and (text2 or url2)):
        raise HTTPException(status_code=400, detail="Both sources must be provided (text or URL)")
    
    # Analyze first source
    input_data1 = {"text": text1, "url": url1, "settings": settings.model_dump() if settings else None}
    results1 = analyzer.analyze_input(input_data1)
    
    # Analyze second source
    input_data2 = {"text": text2, "url": url2, "settings": settings.model_dump() if settings else None}
    results2 = analyzer.analyze_input(input_data2)
    
    # Compare results
    comparison = {
        "source1": {
            "type": "url" if url1 else "text",
            "content": url1 if url1 else text1,
            "indicators_count": results1.get("total_indicators_found", 0),
            "results": results1.get("results", [])
        },
        "source2": {
            "type": "url" if url2 else "text",
            "content": url2 if url2 else text2,
            "indicators_count": results2.get("total_indicators_found", 0),
            "results": results2.get("results", [])
        },
        "common_indicators": [],
        "unique_indicators_source1": [],
        "unique_indicators_source2": [],
        "strength_comparison": {
            "source1": {"high": 0, "medium": 0, "low": 0},
            "source2": {"high": 0, "medium": 0, "low": 0}
        }
    }
    
    # Find common and unique indicators
    indicators1 = {r["indicator_id"]: r for r in results1.get("results", [])}
    indicators2 = {r["indicator_id"]: r for r in results2.get("results", [])}
    
    for id1, indicator1 in indicators1.items():
        if id1 in indicators2:
            comparison["common_indicators"].append({
                "indicator_id": id1,
                "indicator_name": indicator1["indicator_name"],
                "source1_strength": indicator1["overall_strength"],
                "source2_strength": indicators2[id1]["overall_strength"]
            })
        else:
            comparison["unique_indicators_source1"].append(indicator1)
            
    for id2, indicator2 in indicators2.items():
        if id2 not in indicators1:
            comparison["unique_indicators_source2"].append(indicator2)
    
    # Count strengths
    for indicator in results1.get("results", []):
        strength = indicator.get("overall_strength", "low")
        comparison["strength_comparison"]["source1"][strength] += 1
        
    for indicator in results2.get("results", []):
        strength = indicator.get("overall_strength", "low")
        comparison["strength_comparison"]["source2"][strength] += 1
    
    return comparison

@app.get("/indicators", 
    summary="Ottieni tutti gli indicatori",
    description="Restituisce l'elenco completo degli indicatori disponibili per l'analisi",
    response_description="Lista degli indicatori con parole chiave associate",
    tags=["Dizionario"])
async def get_indicators():
    """
    Get all available indicators for reference.
    
    Returns:
        List of all indicators.
    """
    return {"indicators": analyzer.indicators}

@app.get("/stats", 
    summary="Statistiche globali",
    description="Restituisce statistiche aggregate su tutte le analisi effettuate",
    response_description="Dati statistici sulle analisi effettuate",
    tags=["Statistiche"])
async def get_stats():
    """
    Get overall statistics about analyses performed.
    
    Returns:
        Dictionary with analysis statistics.
    """
    return analyzer.analysis_stats

@app.get("/logs", 
    summary="Log delle analisi",
    description="Restituisce i log delle analisi precedenti con paginazione",
    response_description="Lista dei log di analisi precedenti",
    tags=["Statistiche"])
async def get_logs(limit: int = 10, skip: int = 0):
    """
    Get analysis logs.
    
    Args:
        limit: Maximum number of logs to return
        skip: Number of logs to skip (for pagination)
        
    Returns:
        List of analysis logs.
    """
    logs = []
    try:
        # Get all log files
        log_files = []
        if os.path.exists("logs"):
            log_files = [f for f in os.listdir("logs") if f.startswith("analysis_") and f.endswith(".json")]
        
        # Sort by modification time (newest first)
        log_files.sort(key=lambda x: os.path.getmtime(os.path.join("logs", x)), reverse=True)
        
        # Apply pagination
        paginated_files = log_files[skip:skip+limit]
        
        # Load the log files
        for filename in paginated_files:
            with open(os.path.join("logs", filename), 'r', encoding='utf-8') as f:
                log_data = json.load(f)
                logs.append(log_data)
        return {
            "total": len(log_files),
            "logs": logs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving logs: {str(e)}")

@app.get("/trends", 
    summary="Dati di tendenza",
    description="Restituisce dati aggregati per visualizzazioni e grafici di tendenza",
    response_description="Dati di tendenza per l'analisi storica",
    tags=["Statistiche"])
async def get_trends():
    """
    Get trend data for visualization.
    
    Returns:
        Dictionary with trend data.
    """
    try:
        trend_data = {
            "indicators_over_time": {},
            "strength_distribution": {"low": 0, "medium": 0, "high": 0},
            "method_effectiveness": {}
        }
        
        # Get all log files
        log_files = []
        if os.path.exists("logs"):
            log_files = [f for f in os.listdir("logs") if f.startswith("analysis_") and f.endswith(".json")]
        
        # If no log files exist yet, return default empty trend data
        if not log_files:
            return trend_data
        
        # Process each log
        for filename in log_files:
            try:
                with open(os.path.join("logs", filename), 'r', encoding='utf-8') as f:
                    log_data = json.load(f)
                    
                    # Make sure required fields exist
                    if "timestamp" not in log_data or "results" not in log_data:
                        continue
                    
                    # Extract date (just the date part of the timestamp)
                    date = log_data["timestamp"].split("T")[0]
                    
                    # Make sure results includes total_indicators_found
                    if "total_indicators_found" not in log_data["results"]:
                        continue
                        
                    # Count indicators by dates
                    if date not in trend_data["indicators_over_time"]:
                        trend_data["indicators_over_time"][date] = 0
                    trend_data["indicators_over_time"][date] += log_data["results"]["total_indicators_found"]
                    
                    # Count strength distribution
                    for indicator in log_data["results"].get("results", []):
                        strength = indicator.get("overall_strength", "low")
                        if strength in trend_data["strength_distribution"]:
                            trend_data["strength_distribution"][strength] += 1
                    
                    # Calculate method effectiveness
                    analysis_methods = log_data["results"].get("analysis_methods", {})
                    total_indicators = log_data["results"]["total_indicators_found"]
                    for method, used in analysis_methods.items():
                        if used and total_indicators > 0:
                            if method not in trend_data["method_effectiveness"]:
                                trend_data["method_effectiveness"][method] = {"count": 0, "total": 0}
                            trend_data["method_effectiveness"][method]["count"] += 1
                            trend_data["method_effectiveness"][method]["total"] += total_indicators
            except Exception as e:
                # Skip problematic log files
                print(f"Error processing log file {filename}: {str(e)}")
                continue
        
        # Calculate average indicators found per method
        for method in trend_data["method_effectiveness"]:
            count = trend_data["method_effectiveness"][method]["count"]
            if count > 0:
                avg = trend_data["method_effectiveness"][method]["total"] / count
                trend_data["method_effectiveness"][method]["average"] = round(avg, 2)
        
        # If no data was found in any logs, ensure dates list isn't empty
        if not trend_data["indicators_over_time"]:
            today = datetime.datetime.now().strftime("%Y-%m-%d")
            trend_data["indicators_over_time"][today] = 0
        
        return trend_data
    except Exception as e:
        print(f"Error retrieving trend data: {str(e)}")
        # Return a basic structure even if an error occurs
        return {
            "indicators_over_time": {datetime.datetime.now().strftime("%Y-%m-%d"): 0},
            "strength_distribution": {"low": 0, "medium": 0, "high": 0},
            "method_effectiveness": {}
        }

@app.get("/domain-stats", 
    summary="Statistiche per Dominio",
    description="Restituisce statistiche sulle analisi effettuate per dominio web",
    response_description="Dati statistici sui domini analizzati",
    tags=["Statistiche"])
async def get_domain_stats():
    """
    Get statistics about analyzed domains.
    
    Returns:
        Dictionary with domain statistics.
    """
    return {
        "analyzed_domains": analyzer.analysis_stats.get("analyzed_domains", {}),
        "total_domains": len(analyzer.analysis_stats.get("analyzed_domains", {}))
    }

@app.get("/url-history", 
    summary="Cronologia URL",
    description="Restituisce l'elenco degli URL analizzati recentemente",
    response_description="Elenco degli URL analizzati",
    tags=["Statistiche"])
async def get_url_history(limit: int = 50):
    """
    Get recent analyzed URLs history.
    
    Args:
        limit: Maximum number of URLs to return
        
    Returns:
        List of recently analyzed URLs with analysis results.
    """
    recent_urls = analyzer.analysis_stats.get("recent_urls", [])
    return {
        "recent_urls": recent_urls[:limit],
        "total_urls": len(recent_urls)
    }

@app.get("/top-urls", 
    summary="URL più Significativi",
    description="Restituisce gli URL con il maggior numero di indicatori rilevati",
    response_description="Elenco degli URL con maggiori indicazioni",
    tags=["Statistiche"])
async def get_top_urls(limit: int = 20):
    """
    Get URLs with highest indicator counts.
    
    Args:
        limit: Maximum number of URLs to return
        
    Returns:
        List of URLs with highest indicator counts.
    """
    top_urls = analyzer.analysis_stats.get("most_indicative_urls", [])
    return {
        "top_urls": top_urls[:limit],
        "total": len(top_urls)
    }

@app.get("/date-analytics", 
    summary="Analisi per Data",
    description="Restituisce statistiche aggregate per data",
    response_description="Dati statistici suddivisi per data",
    tags=["Statistiche"])
async def get_date_analytics(days: int = 30):
    """
    Get analytics grouped by date.
    
    Args:
        days: Number of days to include in results
        
    Returns:
        Dictionary with date-based analytics.
    """
    date_stats = analyzer.analysis_stats.get("analysis_by_date", {})
    
    # Sort dates and get the most recent ones up to the specified limit
    sorted_dates = sorted(date_stats.keys(), reverse=True)
    recent_dates = sorted_dates[:days]
    
    # Filter data to only include the recent dates
    filtered_stats = {date: date_stats[date] for date in recent_dates if date in date_stats}
    
    return {
        "date_analytics": filtered_stats,
        "total_days": len(filtered_stats)
    }

@app.get("/web-coverage", 
    summary="Copertura Web",
    description="Restituisce statistiche sulla copertura dell'analisi web",
    response_description="Dati sulla copertura web dell'analisi",
    tags=["Statistiche"])
async def get_web_coverage():
    """
    Get statistics about web coverage of the analysis.
    
    Returns:
        Dictionary with web coverage statistics.
    """
    domains = analyzer.analysis_stats.get("analyzed_domains", {})
    url_count = len(analyzer.analysis_stats.get("recent_urls", []))
    
    # Calculate indicators per domain
    indicators_per_domain = []
    for domain, stats in domains.items():
        if stats.get("count", 0) > 0:
            indicators_per_domain.append({
                "domain": domain,
                "indicators_per_analysis": stats.get("total_indicators", 0) / stats.get("count", 1)
            })
    
    # Sort by indicators per analysis
    indicators_per_domain.sort(key=lambda x: x["indicators_per_analysis"], reverse=True)
    
    # Build TLD statistics
    tld_stats = {}
    for domain in domains.keys():
        tld = domain.split(".")[-1] if "." in domain else "unknown"
        tld_stats[tld] = tld_stats.get(tld, 0) + 1
    
    return {
        "total_urls_analyzed": url_count,
        "total_domains": len(domains),
        "tld_distribution": tld_stats,
        "top_indicative_domains": indicators_per_domain[:10],
        "low_indicative_domains": indicators_per_domain[-10:] if len(indicators_per_domain) > 10 else []
    }

@app.get("/export-analysis/{format}", 
    summary="Esporta Analisi",
    description="Esporta i dati di analisi in diversi formati",
    response_description="Dati di analisi nel formato richiesto",
    tags=["Statistiche"])
async def export_analysis(format: str, days: int = 30):
    """
    Export analysis data in different formats.
    
    Args:
        format: Export format (json, csv, txt)
        days: Number of days of data to include
        
    Returns:
        Formatted analysis data
    """
    # Get recent analysis data
    date_stats = analyzer.analysis_stats.get("analysis_by_date", {})
    sorted_dates = sorted(date_stats.keys(), reverse=True)
    recent_dates = sorted_dates[:days]
    
    # Filter data to only include the recent dates
    filtered_stats = {date: date_stats[date] for date in recent_dates if date in date_stats}
    
    # Get indicator stats
    indicator_stats = analyzer.analysis_stats.get("indicators_found", {})
    
    # Prepare export data
    export_data = {
        "date_range": f"Ultimi {len(filtered_stats)} giorni",
        "total_analyses": sum(stat.get("count", 0) for stat in filtered_stats.values()),
        "analyses_by_date": filtered_stats,
        "indicators_detected": indicator_stats,
        "export_date": datetime.datetime.now().isoformat()
    }
    
    # Format based on requested type
    if format.lower() == "json":
        return export_data
    elif format.lower() == "csv":
        # Convert to CSV format (simplified version)
        csv_lines = ["Date,Analyses,Indicators"]
        for date, stats in filtered_stats.items():
            csv_lines.append(f"{date},{stats.get('count', 0)},{stats.get('indicators_found', 0)}")
            
        return {"csv_data": "\n".join(csv_lines)}
    elif format.lower() == "txt":
        # Convert to human-readable text
        txt_lines = [
            f"AntiFa Model - Statistiche di Analisi",
            f"Periodo: Ultimi {len(filtered_stats)} giorni",
            f"Analisi totali: {export_data['total_analyses']}",
            f"Data di esportazione: {export_data['export_date'].split('T')[0]}",
            "",
            "Analisi per data:",
        ]
        
        for date, stats in filtered_stats.items():
            txt_lines.append(f"  {date}: {stats.get('count', 0)} analisi, {stats.get('indicators_found', 0)} indicatori")
            
        txt_lines.append("")
        txt_lines.append("Indicatori più frequenti:")
        
        # Sort indicators by frequency
        sorted_indicators = sorted(indicator_stats.items(), key=lambda x: x[1], reverse=True)
        for indicator, count in sorted_indicators[:10]:  # Top 10
            # Find indicator name
            name = next((ind["name"] for ind in analyzer.indicators if ind["id"] == indicator), indicator)
            txt_lines.append(f"  {name}: {count}")
            
        return {"text_data": "\n".join(txt_lines)}
    else:
        raise HTTPException(status_code=400, detail=f"Format '{format}' not supported. Use 'json', 'csv', or 'txt'")

# Custom OpenAPI documentation
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="AntiFa Model API Documentation",
        version="1.0.0",
        description="""
        API per l'analisi di testi alla ricerca di indicatori retorici.
        
        Questa API permette di:
        * Analizzare un testo diretto o estratto da un URL
        * Accedere al dizionario di indicatori retorici
        * Visualizzare statistiche e log delle analisi passate
        * Ottenere dati di tendenza per visualizzazioni grafiche
        
        Per ulteriori informazioni, visitare la [repository GitHub](https://github.com/fab/antifa-model)
        """,
        routes=app.routes,
    )
    
    # Add security definitions
    openapi_schema["components"] = {
        "schemas": {
            "AnalysisInput": {
                "title": "AnalysisInput",
                "type": "object",
                "properties": {
                    "text": {"title": "Text", "type": "string", "description": "Testo da analizzare"},
                    "url": {"title": "URL", "type": "string", "description": "URL da cui estrarre e analizzare il testo"},
                    "settings": {
                        "title": "Settings",
                        "type": "object",
                        "description": "Impostazioni di analisi personalizzate"
                    }
                },
                "description": "Dati di input per l'analisi"
            }
        }
    }
    
    # Customize tags
    openapi_schema["tags"] = [
        {
            "name": "Analisi",
            "description": "Endpoints per l'analisi di testi e URL"
        },
        {
            "name": "Dizionario",
            "description": "Endpoints per accedere al dizionario di indicatori"
        },
        {
            "name": "Statistiche",
            "description": "Endpoints per statistiche e log"
        },
        {
            "name": "Informazioni",
            "description": "Informazioni generali sull'API"
        }
    ]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)