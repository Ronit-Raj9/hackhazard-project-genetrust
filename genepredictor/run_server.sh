#!/bin/bash

set -e

echo "========== DNA Sequence Prediction Server Setup =========="

# Directory setup
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
VENV_PATH="$SCRIPT_DIR/dnabert_env"

PYTHON_BIN="python3.13"

# Check if Python 3.12 exists
if ! command -v $PYTHON_BIN &> /dev/null; then
    echo "❌ Python 3.13 not found. Please install it and try again."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "$VENV_PATH" ]; then
    echo "Creating new virtual environment..."
    $PYTHON_BIN -m venv "$VENV_PATH"
fi

# Activate the virtual environment
echo "Activating virtual environment..."
source "$VENV_PATH/bin/activate"

# Upgrade pip to avoid PEP 668 issues
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install torch==2.6.0+cpu --extra-index-url https://download.pytorch.org/whl/cpu
pip install transformers==4.51.3 protobuf==6.30.2 einops==0.8.1 accelerate==1.6.0 fastapi==0.115.12 uvicorn==0.34.2 numpy==2.2.5

# Write/update requirements.txt
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

# Set CPU usage
export CUDA_VISIBLE_DEVICES=""
export USE_TORCH=1
export USE_CUDA=0
export USE_TRITON=0

# Launch the server
echo ""
echo "========== Starting DNA Sequence Prediction Server =========="
echo "API will be available at http://localhost:4000"
echo "Example usage:"
echo "curl -X POST http://localhost:4000/predict -H \"Content-Type: application/json\" -d '{\"sequence\": \"ACGTAGCATCGGATCTATCT\"}'"
echo ""

cd "$SCRIPT_DIR"
$PYTHON_BIN app.py
