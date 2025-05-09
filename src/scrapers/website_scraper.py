"""
Web scraper module for the antifa-scraper project.
This module handles the scraping of websites to collect content for analysis.
"""

import datetime
import logging
import requests
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from sqlalchemy.exc import IntegrityError

from src.db.models import get_session, Website, Content

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebsiteScraper:
    """Class for scraping websites and extracting content."""
    
    def __init__(self, session=None):
        """Initialize the scraper with a database session."""
        self.session = session or get_session()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
        }
    
    def get_websites_to_scrape(self, category=None):
        """Get a list of websites to scrape from the database."""
        query = self.session.query(Website)
        if category:
            query = query.filter(Website.category == category)
        return query.all()
    
    def scrape_website(self, website):
        """Scrape a single website and store its content."""
        logger.info(f"Scraping website: {website.url}")
        
        try:
            # Get the website's homepage
            response = requests.get(website.url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            # Parse the HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract links to articles/content pages
            content_links = self._extract_content_links(soup, website.url)
            
            # Process each content link
            for link in content_links:
                self._process_content_page(link, website)
            
            # Update the last scraped timestamp
            website.last_scraped = datetime.datetime.utcnow()
            self.session.commit()
            
            logger.info(f"Successfully scraped {len(content_links)} content pages from {website.url}")
            return len(content_links)
            
        except Exception as e:
            logger.error(f"Error scraping website {website.url}: {str(e)}")
            self.session.rollback()
            return 0
    
    def _extract_content_links(self, soup, base_url):
        """Extract links to content pages from the website."""
        links = []
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            
            # Handle relative URLs
            if not href.startswith(('http://', 'https://')):
                # Join with base URL to create absolute URL
                if href.startswith('/'):
                    parsed_url = urlparse(base_url)
                    href = f"{parsed_url.scheme}://{parsed_url.netloc}{href}"
                else:
                    href = f"{base_url.rstrip('/')}/{href.lstrip('/')}"
            
            # Only include links from the same domain
            if urlparse(href).netloc == urlparse(base_url).netloc:
                links.append(href)
        
        # Remove duplicates
        return list(set(links))
    
    def _process_content_page(self, url, website):
        """Process a single content page."""
        logger.info(f"Processing content page: {url}")
        
        try:
            # Check if we've already scraped this URL
            existing = self.session.query(Content).filter_by(website_id=website.id, url=url).first()
            if existing:
                logger.info(f"Content already exists for URL: {url}")
                return False
            
            # Get the content page
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            # Parse the HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract title and content
            title = self._extract_title(soup)
            content_text = self._extract_text_content(soup)
            
            # Skip if no substantial content was found
            if not content_text or len(content_text) < 100:
                logger.info(f"Skipping URL due to insufficient content: {url}")
                return False
            
            # Create a short excerpt of the content
            content_excerpt = content_text[:500] + "..." if len(content_text) > 500 else content_text
            
            # Create a new Content record (without analysis scores)
            content = Content(
                website_id=website.id,
                url=url,
                title=title,
                content_excerpt=content_excerpt,
                scraped_date=datetime.datetime.utcnow()
                # Analysis scores will be populated later by the analyzer
            )
            
            # Save to database
            self.session.add(content)
            self.session.commit()
            logger.info(f"Successfully processed and stored content excerpt from: {url}")
            return True
            
        except IntegrityError:
            logger.warning(f"Duplicate content detected for URL: {url}")
            self.session.rollback()
            return False
        except Exception as e:
            logger.error(f"Error processing content page {url}: {str(e)}")
            self.session.rollback()
            return False
    
    def _extract_title(self, soup):
        """Extract the title from the HTML."""
        title_tag = soup.find('title')
        if title_tag:
            return title_tag.get_text().strip()
        
        h1_tag = soup.find('h1')
        if h1_tag:
            return h1_tag.get_text().strip()
        
        return None
    
    def _extract_text_content(self, soup):
        """Extract the main text content from the HTML."""
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.extract()
        
        # Get all paragraphs
        paragraphs = soup.find_all('p')
        content = '\n\n'.join([p.get_text().strip() for p in paragraphs if p.get_text().strip()])
        
        # If no paragraphs found, get text from body
        if not content:
            content = soup.get_text().strip()
        
        return content

def scrape_all_websites():
    """Scrape all websites in the database."""
    scraper = WebsiteScraper()
    websites = scraper.get_websites_to_scrape()
    
    total_content_pages = 0
    for website in websites:
        num_pages = scraper.scrape_website(website)
        total_content_pages += num_pages
    
    logger.info(f"Scraping complete. Processed {total_content_pages} content pages from {len(websites)} websites.")
    return total_content_pages

if __name__ == "__main__":
    scrape_all_websites()