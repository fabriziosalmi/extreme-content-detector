# Antifa Scraper

A tool for monitoring and analyzing extremist content on the web. This project provides web scraping capabilities, text analysis using NLP techniques, and a modern user interface to visualize the results.

## Features

- **Web Scraping**: Monitor websites for racist, fascist, nazi, and far-right content
- **Text Analysis**: Analyze and rank content based on extremist indicators using NLP
- **SQLite Database**: Store all scraped content and analysis results
- **Modern UI**: Clean, responsive interface to visualize data and manage monitoring
- **Dockerized Deployment**: Easy deployment using Docker and docker-compose

## Project Structure

```
antifa-model/
├── data/                  # Data storage
│   └── sqlite/            # SQLite database files
├── docker/                # Docker configuration
│   ├── Dockerfile.backend # Backend Docker configuration
│   ├── Dockerfile.frontend# Frontend Docker configuration
│   └── nginx.conf         # Nginx configuration for frontend
├── src/                   # Source code
│   ├── analysis/          # Text analysis modules
│   ├── api/               # FastAPI backend
│   ├── db/                # Database models and utilities
│   └── scrapers/          # Web scraping modules
├── tests/                 # Unit tests
├── ui/                    # React frontend
├── docker-compose.yml     # Docker Compose configuration
└── requirements.txt       # Python dependencies
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Python 3.9+ (for development)
- Node.js 16+ (for frontend development)

### Running with Docker

The easiest way to get started is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/yourusername/antifa-scraper.git
cd antifa-scraper

# Start the services
docker-compose up -d

# Access the UI at http://localhost
```

### Development Setup

To set up a development environment:

```bash
# Backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Initialize the database
python -m src.db.init_db

# Start the API server
uvicorn src.api.main:app --reload

# Frontend (in another terminal)
cd ui
npm install
npm run dev
```

## Usage

1. Access the web UI at `http://localhost`
2. Add websites to monitor in the "Websites" section
3. Run the scraper to collect content
4. Run the analyzer to process and rank the content
5. View the results on the dashboard and content pages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This tool is meant for monitoring and research purposes only. The developers are not responsible for any misuse of this software.