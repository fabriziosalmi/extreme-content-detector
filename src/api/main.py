"""
API module for the antifa-scraper project.
This module provides a FastAPI-based REST API for the application.
"""

import logging
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from src.db.models import get_session, Website, Content
from src.scrapers.website_scraper import WebsiteScraper
from src.analysis.content_analyzer import ExtremismAnalyzer

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Antifa Scraper API",
    description="API for monitoring and analyzing extremist content online",
    version="1.0.0"
)

# Add CORS middleware to allow frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database session
def get_db():
    db = get_session()
    try:
        yield db
    finally:
        db.close()

# Pydantic models for API requests/responses
class WebsiteBase(BaseModel):
    url: HttpUrl
    name: str
    category: Optional[str] = None
    description: Optional[str] = None

class WebsiteCreate(WebsiteBase):
    pass

class WebsiteResponse(WebsiteBase):
    id: int
    created_at: datetime
    last_scraped: Optional[datetime] = None

    class Config:
        orm_mode = True

class ContentResponse(BaseModel):
    id: int
    website_id: int
    url: str
    title: Optional[str] = None
    content_excerpt: Optional[str] = None  # Changed from content_text to content_excerpt
    published_date: Optional[datetime] = None
    scraped_date: datetime
    racist_score: Optional[float] = None
    fascist_score: Optional[float] = None
    nazi_score: Optional[float] = None
    far_right_score: Optional[float] = None
    overall_extremism_score: Optional[float] = None

    class Config:
        orm_mode = True

class ContentSummary(BaseModel):
    id: int
    website_id: int
    url: str
    title: Optional[str] = None
    overall_extremism_score: Optional[float] = None

    class Config:
        orm_mode = True

class StatsResponse(BaseModel):
    total_websites: int
    total_content: int
    total_analyzed: int
    average_extremism_score: Optional[float] = None
    last_update: datetime

# API Routes
@app.get("/", response_model=dict)
def read_root():
    """Root endpoint with API information."""
    return {
        "name": "Antifa Scraper API",
        "version": "1.0.0",
        "description": "API for monitoring and analyzing extremist content online",
    }

@app.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    """Get statistics about the database."""
    total_websites = db.query(Website).count()
    total_content = db.query(Content).count()
    total_analyzed = db.query(Content).filter(Content.overall_extremism_score.isnot(None)).count()
    
    # Calculate average extremism score
    avg_score_result = db.query(
        func.avg(Content.overall_extremism_score).label('average')
    ).filter(Content.overall_extremism_score.isnot(None)).first()
    
    average_extremism_score = avg_score_result.average if avg_score_result and avg_score_result.average else None
    
    return StatsResponse(
        total_websites=total_websites,
        total_content=total_content,
        total_analyzed=total_analyzed,
        average_extremism_score=average_extremism_score,
        last_update=datetime.utcnow()
    )

@app.get("/websites", response_model=List[WebsiteResponse])
def get_websites(
    skip: int = 0, 
    limit: int = 100, 
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all websites being monitored."""
    query = db.query(Website)
    if category:
        query = query.filter(Website.category == category)
    
    return query.offset(skip).limit(limit).all()

@app.post("/websites", response_model=WebsiteResponse)
def create_website(website: WebsiteCreate, db: Session = Depends(get_db)):
    """Add a new website to monitor."""
    db_website = db.query(Website).filter(Website.url == str(website.url)).first()
    if db_website:
        raise HTTPException(status_code=400, detail="Website already exists")
    
    db_website = Website(
        url=str(website.url),
        name=website.name,
        category=website.category,
        description=website.description
    )
    db.add(db_website)
    db.commit()
    db.refresh(db_website)
    return db_website

@app.get("/websites/{website_id}", response_model=WebsiteResponse)
def get_website(website_id: int, db: Session = Depends(get_db)):
    """Get details for a specific website."""
    db_website = db.query(Website).filter(Website.id == website_id).first()
    if db_website is None:
        raise HTTPException(status_code=404, detail="Website not found")
    return db_website

@app.put("/websites/{website_id}", response_model=WebsiteResponse)
def update_website(website_id: int, website: WebsiteCreate, db: Session = Depends(get_db)):
    """Update an existing website."""
    db_website = db.query(Website).filter(Website.id == website_id).first()
    if db_website is None:
        raise HTTPException(status_code=404, detail="Website not found")
    
    # Update fields
    db_website.url = str(website.url)
    db_website.name = website.name
    db_website.category = website.category
    db_website.description = website.description
    
    db.commit()
    db.refresh(db_website)
    return db_website

@app.delete("/websites/{website_id}", response_model=dict)
def delete_website(website_id: int, db: Session = Depends(get_db)):
    """Delete a website."""
    db_website = db.query(Website).filter(Website.id == website_id).first()
    if db_website is None:
        raise HTTPException(status_code=404, detail="Website not found")
    
    # Delete related content first to maintain referential integrity
    db.query(Content).filter(Content.website_id == website_id).delete()
    
    # Delete the website
    db.delete(db_website)
    db.commit()
    
    return {"status": "success", "message": "Website deleted successfully"}

@app.get("/websites/{website_id}/content", response_model=List[ContentSummary])
def get_website_content(
    website_id: int, 
    skip: int = 0, 
    limit: int = 100,
    min_score: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """Get content from a specific website."""
    query = db.query(Content).filter(Content.website_id == website_id)
    
    if min_score is not None:
        query = query.filter(Content.overall_extremism_score >= min_score)
    
    query = query.order_by(desc(Content.scraped_date))
    return query.offset(skip).limit(limit).all()

@app.get("/content", response_model=List[ContentSummary])
def get_all_content(
    skip: int = 0, 
    limit: int = 100,
    min_score: Optional[float] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all content with optional filtering."""
    query = db.query(Content)
    
    if min_score is not None:
        query = query.filter(Content.overall_extremism_score >= min_score)
    
    if category:
        query = query.join(Website).filter(Website.category == category)
    
    query = query.order_by(desc(Content.overall_extremism_score))
    return query.offset(skip).limit(limit).all()

@app.get("/content/{content_id}", response_model=ContentResponse)
def get_content(content_id: int, db: Session = Depends(get_db)):
    """Get details for a specific content item."""
    db_content = db.query(Content).filter(Content.id == content_id).first()
    if db_content is None:
        raise HTTPException(status_code=404, detail="Content not found")
    return db_content

@app.post("/run/scraper")
def run_scraper(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Run the scraper in the background."""
    def scrape_task():
        scraper = WebsiteScraper(session=db)
        websites = scraper.get_websites_to_scrape()
        for website in websites:
            scraper.scrape_website(website)
    
    background_tasks.add_task(scrape_task)
    return {"status": "success", "message": "Scraper started in background"}

@app.post("/run/scraper/{website_id}")
def run_scraper_for_website(
    website_id: int, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    """Run the scraper for a specific website in the background."""
    # Get the website
    db_website = db.query(Website).filter(Website.id == website_id).first()
    if db_website is None:
        raise HTTPException(status_code=404, detail="Website not found")
    
    def scrape_task():
        scraper = WebsiteScraper(session=db)
        scraper.scrape_website(db_website)
    
    background_tasks.add_task(scrape_task)
    return {"status": "success", "message": f"Scraper started in background for website: {db_website.name}"}

@app.post("/run/analyzer")
def run_analyzer(
    background_tasks: BackgroundTasks, 
    limit: int = Query(100, gt=0, lt=1000),
    db: Session = Depends(get_db)
):
    """Run the content analyzer in the background."""
    def analyze_task():
        analyzer = ExtremismAnalyzer(session=db)
        contents = analyzer.get_unanalyzed_content(limit=limit)
        for content in contents:
            analyzer.analyze_content(content)
    
    background_tasks.add_task(analyze_task)
    return {"status": "success", "message": f"Analyzer started in background for up to {limit} items"}

# Run with: uvicorn src.api.main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)