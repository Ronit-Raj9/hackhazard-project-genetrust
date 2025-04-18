from fastapi import FastAPI, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
import os
import random
import numpy as np
from transformers import AutoModel, AutoTokenizer
from pydantic import BaseModel

app = FastAPI()

# Add CORS middleware to allow requests from React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
    expose_headers=["*"]  # Exposes all headers
)

# Constants
MODEL_NAME = "zhihan1996/DNABERT-2-117M"
BASES = ['A', 'T', 'C', 'G']
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Seed for reproducibility
def set_seed(seed=42):
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    np.random.seed(seed)
    random.seed(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False

set_seed()

# Load model and tokenizer
print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
print("Loading model...")
try:
    # First try to load with trust_remote_code=False to avoid Triton issues
    model = AutoModel.from_pretrained(
        MODEL_NAME, 
        trust_remote_code=False,
        local_files_only=False,
        low_cpu_mem_usage=True
    ).to(device)
except Exception as e:
    print(f"First loading attempt failed: {e}")
    # If first attempt fails, try with config_only and torch_dtype=torch.float16
    try:
        model = AutoModel.from_pretrained(
            MODEL_NAME,
            config_only=True,
            torch_dtype=torch.float16
        ).to(device)
    except Exception as e:
        print(f"Second loading attempt failed: {e}")
        # Last resort - try with from_config
        try:
            from transformers import AutoConfig
            config = AutoConfig.from_pretrained(MODEL_NAME)
            model = AutoModel.from_config(config).to(device)
        except Exception as e:
            print(f"Third loading attempt failed: {e}")
            print("Falling back to basic BERT model...")
            # Final fallback - use a basic BERT model
            from transformers import BertModel, BertConfig
            fallback_model = "bert-base-uncased"
            model = BertModel.from_pretrained(fallback_model).to(device)
            print(f"Loaded fallback model: {fallback_model}")

print("Model loaded successfully!")
model.eval()
for param in model.parameters():
    param.requires_grad = False

# Helper functions
def get_token_embeddings(sequence):
    inputs = tokenizer(sequence, return_tensors="pt", truncation=True, padding=True, max_length=512)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Handle different output formats
    if hasattr(outputs, 'last_hidden_state'):
        return outputs.last_hidden_state.squeeze(0)
    elif isinstance(outputs, tuple) and hasattr(outputs[0], 'last_hidden_state'):
        return outputs[0].last_hidden_state.squeeze(0)
    elif isinstance(outputs, dict) and 'last_hidden_state' in outputs:
        return outputs['last_hidden_state'].squeeze(0)
    else:
        # Fall back to the first tensor if structure is unknown
        if isinstance(outputs, tuple):
            return outputs[0].squeeze(0)
        return outputs.squeeze(0)

def generate_reference_token_embedding(sequences):
    all_token_embeds = []
    max_len = 0
    for seq in sequences:
        token_embed = get_token_embeddings(seq)
        all_token_embeds.append(token_embed)
        max_len = max(max_len, token_embed.size(0))

    padded_embeds = []
    for emb in all_token_embeds:
        pad_size = max_len - emb.size(0)
        if pad_size > 0:
            emb = torch.cat([emb, torch.zeros(pad_size, emb.size(1), device=device)], dim=0)
        padded_embeds.append(emb)

    return torch.stack(padded_embeds).mean(dim=0)

def find_problematic_position(token_embeddings, reference_embeddings):
    cos = torch.nn.CosineSimilarity(dim=1)
    similarities = cos(token_embeddings, reference_embeddings[:token_embeddings.size(0)])
    return torch.argmin(similarities).item()

def choose_best_alternate_base(seq, idx, reference_token_embeddings):
    best_base = None
    best_score = -1
    original_base = seq[idx]

    for base in [b for b in BASES if b != original_base]:
        new_seq = seq[:idx] + base + seq[idx + 1:]
        token_embeds = get_token_embeddings(new_seq)
        sequence_embed = token_embeds.mean(dim=0).unsqueeze(0)
        reference_mean = reference_token_embeddings.mean(dim=0).unsqueeze(0)
        score = torch.cosine_similarity(sequence_embed, reference_mean).item()
        if score > best_score:
            best_score = score
            best_base = base

    return best_base, best_score

def get_sequence_score(seq, reference_token_embeddings):
    token_embeds = get_token_embeddings(seq)
    sequence_embed = token_embeds.mean(dim=0).unsqueeze(0)
    reference_mean = reference_token_embeddings.mean(dim=0).unsqueeze(0)
    return torch.cosine_similarity(sequence_embed, reference_mean).item()

def predict_edit(seq, reference_token_embeddings):
    token_embeds = get_token_embeddings(seq)
    problem_idx = find_problematic_position(token_embeds, reference_token_embeddings)
    new_base, edited_score = choose_best_alternate_base(seq, problem_idx, reference_token_embeddings)
    edited_seq = seq[:problem_idx] + new_base + seq[problem_idx + 1:]
    return edited_seq, problem_idx, new_base, edited_score

# Reference sequences
REFERENCE_SEQUENCES = [
    "CTACTTCAAATGGGGCTACA",
    "AGTCGTACTGCATGCTCGTA",
    "ATCGCTGACAATGCTGGACA"
]
REFERENCE_EMBEDDINGS = generate_reference_token_embedding(REFERENCE_SEQUENCES)

# Pydantic model for request validation
class DNASequence(BaseModel):
    sequence: str

@app.post("/predict")
async def predict_sequence(data: DNASequence):
    try:
        sequence = data.sequence.upper()
        
        # Validate input
        if len(sequence) != 20:
            return JSONResponse(
                status_code=400,
                content={"error": "Sequence must be exactly 20 characters long"}
            )
        
        if not all(c in BASES for c in sequence):
            return JSONResponse(
                status_code=400,
                content={"error": "Sequence must contain only A, T, C, G"}
            )

        original_score = get_sequence_score(sequence, REFERENCE_EMBEDDINGS)
        edited_seq, index, base, edited_score = predict_edit(sequence, REFERENCE_EMBEDDINGS)
        
        # Convert score to percentage for the app
        efficiency = int(edited_score)
        original_efficiency = int(original_score)
        
        # Create change indicator string
        change_indicator = '.' * 20
        if index < len(change_indicator):
            change_indicator = change_indicator[:index] + '*' + change_indicator[index+1:]

        # Determine the message based on score comparison
        if edited_score > original_score:
            message = f"🔼 Editing improves similarity from {original_efficiency} to {efficiency}"
        else:
            message = f"✅ Sequence is already optimal (similarity: {original_efficiency})"

        return {
            "originalSequence": sequence,
            "editedSequence": edited_seq,
            "changeIndicator": change_indicator,
            "efficiency": efficiency,
            "changedPosition": index + 1,
            "originalBase": sequence[index],
            "newBase": base,
            "message": message,
            "originalEfficiency": original_efficiency  # Added for more context
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
