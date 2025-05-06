#!/bin/bash

# antifa-scraper setup and run script

print_help() {
  echo "Antifa Scraper - Setup and Run Script"
  echo ""
  echo "Usage: ./setup.sh [command]"
  echo ""
  echo "Commands:"
  echo "  setup      - Install dependencies and set up the environment"
  echo "  run        - Run the application in development mode"
  echo "  docker     - Build and run with Docker Compose"
  echo "  scrape     - Run the scraper manually"
  echo "  analyze    - Run the content analyzer manually"
  echo "  help       - Print this help message"
  echo ""
}

setup() {
  echo "Setting up Antifa Scraper environment..."
  
  # Check if Python is installed
  if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not installed."
    exit 1
  fi
  
  # Create virtual environment
  echo "Creating Python virtual environment..."
  python3 -m venv venv
  
  # Activate virtual environment
  source venv/bin/activate
  
  # Install Python dependencies
  echo "Installing Python dependencies..."
  pip install -r requirements.txt
  
  # Download spaCy model
  echo "Downloading spaCy model..."
  python -m spacy download en_core_web_sm
  
  # Initialize the database
  echo "Initializing database..."
  python -m src.db.init_db
  
  # Install npm dependencies for UI
  echo "Setting up frontend..."
  cd ui
  npm install
  cd ..
  
  echo "Setup complete! Use './setup.sh run' to start the application."
}

run_dev() {
  echo "Starting Antifa Scraper in development mode..."
  
  # Start backend API in background
  echo "Starting backend API..."
  source venv/bin/activate
  uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000 &
  API_PID=$!
  
  # Start frontend
  echo "Starting frontend..."
  cd ui
  npm run dev &
  UI_PID=$!
  
  # Handle exit
  trap "kill $API_PID $UI_PID; exit" INT TERM
  wait
}

run_docker() {
  echo "Building and running with Docker Compose..."
  docker-compose up --build
}

run_scraper() {
  echo "Running website scraper..."
  source venv/bin/activate
  python -m src.scrapers.website_scraper
}

run_analyzer() {
  echo "Running content analyzer..."
  source venv/bin/activate
  python -m src.analysis.content_analyzer
}

# Process command
case "$1" in
  setup)
    setup
    ;;
  run)
    run_dev
    ;;
  docker)
    run_docker
    ;;
  scrape)
    run_scraper
    ;;
  analyze)
    run_analyzer
    ;;
  help|"")
    print_help
    ;;
  *)
    echo "Unknown command: $1"
    print_help
    exit 1
    ;;
esac