#!/bin/bash

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Install dependencies if needed
pip install -r requirements.txt

# Start the FastAPI server
python app.py
