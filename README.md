# Extremist Content Analysis Application

This application scrapes and analyzes websites for extremist content, producing analytics and visualizations to help track and understand extremist online presence.

## Screenshots

![screenshot1](https://github.com/fabriziosalmi/antifa-model/blob/main/screenshot_1.png?raw=true)

## Features

- Website scraping and content analysis
- Extremism scoring and classification system
- Dashboard for monitoring extremist content
- Storage-efficient design that analyzes content on-the-fly
- Modern React-based UI with Material UI components

## System Requirements

- Python 3.10+
- Node.js 14+
- SQLite (production version can use PostgreSQL)

## Installation and Setup

1. Clone the repository:
   ```
   git clone https://github.com/fabriziosalmi/extreme-content-detector.git
   cd antifa-model
   ```

2. Set up the Python environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Initialize or reset the database:
   ```
   python -m src.db.init_db --reset
   ```

4. Set up the UI:
   ```
   cd ui
   npm install
   npm run build
   cd ..
   ```

5. Start the backend server:
   ```
   uvicorn src.api.main:app --reload
   ```

6. For development, start the frontend:
   ```
   cd ui
   npm run dev
   ```

## Architecture

- **Backend**: Python with FastAPI
- **Frontend**: React with Material UI
- **Database**: SQLite (default) or PostgreSQL
- **Scraping**: BeautifulSoup and Requests
- **Analysis**: NLTK and transformers for NLP

## Database Schema

The application uses two main tables:
- **Websites**: Stores information about monitored websites
- **Content**: Stores analyzed content with extremism scores (only excerpts, not full content)

## Docker Deployment

Docker configuration is available in the `docker` directory:

```
docker-compose up -d
```

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

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Disclaimer

This tool is meant for monitoring and research purposes only. The developers are not responsible for any misuse of this software.
