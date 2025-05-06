"""
Database module for the antifa-scraper project.
This module handles SQLite database connections and ORM models.
"""

import os
import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

# Create base class for SQLAlchemy models
Base = declarative_base()

# Define database models
class Website(Base):
    """Model representing a website being monitored."""
    __tablename__ = 'websites'
    
    id = Column(Integer, primary_key=True)
    url = Column(String(255), unique=True, nullable=False)
    name = Column(String(255))
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_scraped = Column(DateTime, nullable=True)
    
    contents = relationship("Content", back_populates="website")
    
    def __repr__(self):
        return f"<Website(id={self.id}, url='{self.url}', name='{self.name}')>"


class Content(Base):
    """Model representing content scraped from websites."""
    __tablename__ = 'contents'
    
    id = Column(Integer, primary_key=True)
    website_id = Column(Integer, ForeignKey('websites.id'), nullable=False)
    url = Column(String(500), nullable=False)
    title = Column(String(500), nullable=True)
    content_excerpt = Column(String(1000), nullable=True)  # Short excerpt instead of full content
    published_date = Column(DateTime, nullable=True)
    scraped_date = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Rankings for different hate speech categories (0-1 scale)
    racist_score = Column(Float, nullable=True)
    fascist_score = Column(Float, nullable=True)
    nazi_score = Column(Float, nullable=True)
    far_right_score = Column(Float, nullable=True)
    overall_extremism_score = Column(Float, nullable=True)
    
    website = relationship("Website", back_populates="contents")
    
    __table_args__ = (
        UniqueConstraint('website_id', 'url', name='uix_content_website_url'),
    )
    
    def __repr__(self):
        return f"<Content(id={self.id}, url='{self.url}', title='{self.title}')>"


# Database connection setup
def get_engine(db_path=None):
    """Create SQLAlchemy engine for database connection."""
    if db_path is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        db_path = os.path.join(base_dir, 'data', 'sqlite', 'antifa_scraper.db')
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    connection_string = f"sqlite:///{db_path}"
    return create_engine(connection_string)


def get_session(engine=None):
    """Create a new SQLAlchemy session."""
    if engine is None:
        engine = get_engine()
    Session = sessionmaker(bind=engine)
    return Session()


def init_db(engine=None):
    """Initialize the database by creating all tables."""
    if engine is None:
        engine = get_engine()
    Base.metadata.create_all(engine)
    return engine