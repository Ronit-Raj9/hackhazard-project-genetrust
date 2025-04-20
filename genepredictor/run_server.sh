#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "========== DNA Sequence Prediction Server Setup =========="

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
VENV_PATH="$SCRIPT_DIR/dnabert_env"
MODEL_PATH="$SCRIPT_DIR/DNABERT-2-117M"

# Initialize and update git submodules if needed
echo "Checking DNABERT-2 model..."
if [ ! -d "$MODEL_PATH" ] || [ ! -f "$MODEL_PATH/config.json" ]; then
    echo "Initializing DNABERT-2 model submodule..."
    cd "$(dirname "$SCRIPT_DIR")"  # Go to root project directory
    git submodule update --init --recursive
    cd - > /dev/null  # Return to original directory
fi

# Check if environment already exists, use it without asking
if [ -d "$VENV_PATH" ]; then
    echo "Environment already exists. Using existing environment..."
    CREATE_ENV=false
else
    CREATE_ENV=true
fi

# Create and setup the environment if needed
if [ "$CREATE_ENV" = true ]; then
    echo "Creating new virtual environment..."
    python -m venv "$VENV_PATH"
    
    echo "Activating virtual environment..."
    source "$VENV_PATH/bin/activate"
    
    echo "Installing CPU-only dependencies..."
    pip install torch --extra-index-url https://download.pytorch.org/whl/cpu
    pip install transformers protobuf einops accelerate fastapi uvicorn numpy
    
    # Update requirements.txt
    echo "torch" > "$SCRIPT_DIR/requirements.txt"
    echo "transformers" >> "$SCRIPT_DIR/requirements.txt"
    echo "protobuf" >> "$SCRIPT_DIR/requirements.txt"
    echo "einops" >> "$SCRIPT_DIR/requirements.txt"
    echo "accelerate" >> "$SCRIPT_DIR/requirements.txt"
    echo "fastapi" >> "$SCRIPT_DIR/requirements.txt"
    echo "uvicorn" >> "$SCRIPT_DIR/requirements.txt"
    echo "numpy" >> "$SCRIPT_DIR/requirements.txt"
    
    # Check for git-lfs
    if ! command -v git-lfs &> /dev/null; then
        echo "WARNING: git-lfs not found. If you encounter model loading issues, install it:"
        echo "  On Fedora: sudo dnf install git-lfs"
        echo "  On Ubuntu: sudo apt-get install git-lfs"
        echo "  On Amazon Linux: sudo yum install git-lfs"
    fi
else
    # Just activate the existing environment
    echo "Activating existing virtual environment..."
    source "$VENV_PATH/bin/activate"
    
    # Make sure server dependencies are installed
    echo "Ensuring server dependencies are installed..."
    pip install fastapi uvicorn numpy
fi

# Set environment variables to ensure CPU-only usage
export CUDA_VISIBLE_DEVICES=""
export USE_TORCH=1
export USE_CUDA=0
export USE_TRITON=0

# Inform the user
echo ""
echo "========== Starting DNA Sequence Prediction Server =========="
echo "API will be available at http://localhost:4000"
echo "Example usage with curl:"
echo "curl -X POST http://localhost:4000/predict -H \"Content-Type: application/json\" -d '{\"sequence\": \"ACGTAGCATCGGATCTATCT\"}'"
echo ""
echo "Press Ctrl+C to stop the server"
echo "==========================================================="
echo ""

# Run the FastAPI server
cd "$SCRIPT_DIR"
python app.py 