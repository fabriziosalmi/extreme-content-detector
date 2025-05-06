"""
Database initialization module.
"""
from src.db.models import init_db, get_engine, get_session, Website

def initialize_database():
    """Initialize the database and create the tables."""
    engine = init_db()
    print("Database initialized successfully.")
    return engine

def add_default_websites(session=None):
    """Add some default websites to monitor."""
    if session is None:
        session = get_session()
    
    # List of known far-right/extremist websites to monitor
    # Note: This is just a sample list for demonstration purposes
    default_websites = [
        {
            "url": "https://example-extremist1.com",
            "name": "Example Extremist Site 1",
            "category": "far-right",
            "description": "Known for extreme right-wing content"
        },
        {
            "url": "https://example-extremist2.com",
            "name": "Example Extremist Site 2",
            "category": "neo-nazi",
            "description": "Site with neo-Nazi propaganda"
        }
    ]
    
    # Add websites if they don't already exist
    for website_data in default_websites:
        existing = session.query(Website).filter_by(url=website_data["url"]).first()
        if not existing:
            website = Website(**website_data)
            session.add(website)
    
    session.commit()
    print(f"Added {len(default_websites)} default websites to monitor.")

if __name__ == "__main__":
    engine = initialize_database()
    add_default_websites()