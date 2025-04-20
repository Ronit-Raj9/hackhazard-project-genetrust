#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "========== DNA Sequence Prediction Server Setup =========="

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
VENV_PATH="$SCRIPT_DIR/dnabert_env"

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
    pip install torch==2.6.0+cpu --extra-index-url https://download.pytorch.org/whl/cpu
    pip install transformers==4.51.3 protobuf==6.30.2 einops==0.8.1 accelerate==1.6.0 fastapi==0.115.12 uvicorn==0.34.2 numpy==2.2.5
    
    # Update requirements.txt with specific versions
    cat > "$SCRIPT_DIR/requirements.txt" << EOL
torch==2.6.0+cpu
transformers==4.51.3
protobuf==6.30.2
einops==0.8.1
accelerate==1.6.0
fastapi==0.115.12
uvicorn==0.34.2
numpy==2.2.5
EOL
    
else
    # Just activate the existing environment
    echo "Activating existing virtual environment..."
    source "$VENV_PATH/bin/activate"
    
    # Make sure server dependencies are installed
    echo "Ensuring server dependencies are installed..."
    pip install -r "$SCRIPT_DIR/requirements.txt"
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