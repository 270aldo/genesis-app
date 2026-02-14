# GENESIS Knowledge Store Management

This directory contains tools for managing Gemini File Search Stores that power the GENESIS agent knowledge bases.

## Overview

The GENESIS AI system uses 5 specialized File Search stores:

| Store | Domain | Purpose | Documents |
|-------|--------|---------|-----------|
| **GENESIS** | genesis | Core identity, philosophy, foundational knowledge | genesis_identity.md, ngx_philosophy_expanded.md, muscle_endocrine_function.md |
| **TRAIN** | train | Periodization, exercise science, training principles | training_splits.md, exercise_database.md, periodization_progression.md, corrective_exercise.md |
| **FUEL** | fuel | Nutrition protocols, macros, supplementation | nutrition_protocols.md, protein_guidelines.md, supplementation.md |
| **MIND** | mind | Sleep, stress, recovery, brain fitness | sleep_architecture.md, stress_recovery.md, brain_fitness_protocols.md |
| **TRACK** | track | Assessment, metrics, tracking systems | assessment_protocols.md, tracking_system.md |

Each store is indexed with Gemini's File Search API and queried by the corresponding agent during conversations.

## Scripts

### 1. `upload_knowledge_stores.py` - Batch Uploader (NEW)

Comprehensive batch upload script that automates the entire knowledge store setup.

**Features:**
- Creates 5 File Search stores automatically
- Uploads pre-mapped documents to each store
- Saves store IDs to `.env.stores` file
- Verifies uploads with test queries
- Retry logic with exponential backoff
- Colored terminal output with progress indicators
- Graceful error handling

**Usage:**

```bash
# Run full pipeline: create, upload, verify
python scripts/upload_knowledge_stores.py --step all

# Or run individual steps
python scripts/upload_knowledge_stores.py --step create
python scripts/upload_knowledge_stores.py --step upload
python scripts/upload_knowledge_stores.py --step verify

# Specify API key directly
python scripts/upload_knowledge_stores.py --api-key sk-xyz--step all

# List all existing stores
python scripts/upload_knowledge_stores.py --list
```

**Output Files:**
- `.env.stores` - Contains `FILESEARCH_STORE_GENESIS`, `FILESEARCH_STORE_TRAIN`, etc.

**Configuration:**
- **Chunking**: `max_tokens_per_chunk=512`, `max_overlap_tokens=50`
- **Retries**: Up to 3 attempts per file with 2-second delay
- **Model**: `gemini-2.5-flash` for verification queries

### 2. `manage_stores.py` - Individual Store Management

Lower-level script for managing individual stores (existing functionality enhanced).

**Usage:**

```bash
# Create a single store
python scripts/manage_stores.py create --domain train --display-name "GENESIS Training KB"

# Upload a file to a store
python scripts/manage_stores.py upload --domain train --file path/to/file.md

# List all stores
python scripts/manage_stores.py list

# Test query against a store
python scripts/manage_stores.py query --domain train --query "periodization"

# NEW: Batch upload (delegates to upload_knowledge_stores.py)
python scripts/manage_stores.py batch-upload --step all
python scripts/manage_stores.py batch-upload --step create
python scripts/manage_stores.py batch-upload --step upload
python scripts/manage_stores.py batch-upload --step verify
```

## Setup Instructions

### Prerequisites

```bash
pip install google-genai==1.1.0
# or: pip install -r bff/requirements.txt
```

### Step 1: Set API Key

```bash
export GOOGLE_API_KEY="sk-..."
# or pass --api-key to the script
```

### Step 2: Run Batch Upload

```bash
cd bff
python scripts/upload_knowledge_stores.py --step all
```

This will:
1. Create 5 File Search stores
2. Upload all knowledge documents
3. Verify each store with test queries
4. Save store IDs to `.env.stores`

### Step 3: Source Environment

```bash
# In your .env file, add:
source .env.stores

# Or manually copy the values to .env:
FILESEARCH_STORE_GENESIS=projects/...
FILESEARCH_STORE_TRAIN=projects/...
FILESEARCH_STORE_FUEL=projects/...
FILESEARCH_STORE_MIND=projects/...
FILESEARCH_STORE_TRACK=projects/...
```

## Document Mapping

The batch uploader automatically maps documents to stores:

```python
DOCUMENT_MAPPING = {
    "genesis": [
        "knowledge/genesis/genesis_identity.md",
        "knowledge/genesis/ngx_philosophy_expanded.md",
        "knowledge/genesis/muscle_endocrine_function.md",
    ],
    "train": [
        "knowledge/train/training_splits.md",
        "knowledge/train/exercise_database.md",
        "knowledge/train/periodization_progression.md",
        "knowledge/train/corrective_exercise.md",
    ],
    "fuel": [
        "knowledge/fuel/nutrition_protocols.md",
        "knowledge/fuel/protein_guidelines.md",
        "knowledge/fuel/supplementation.md",
    ],
    "mind": [
        "knowledge/mind/sleep_architecture.md",
        "knowledge/mind/stress_recovery.md",
        "knowledge/mind/brain_fitness_protocols.md",
    ],
    "track": [
        "knowledge/track/assessment_protocols.md",
        "knowledge/track/tracking_system.md",
    ],
}
```

To update mappings, edit the `DOCUMENT_MAPPING` dict in `upload_knowledge_stores.py`.

## Verification

After upload, the script automatically verifies each store with a test query:

| Store | Verification Query |
|-------|-------------------|
| GENESIS | "What is the core identity and mission of GENESIS?" |
| TRAIN | "What are the key principles of periodized training?" |
| FUEL | "What are the protein guidelines for muscle building?" |
| MIND | "How does sleep architecture relate to recovery?" |
| TRACK | "What are the key metrics in the tracking system?" |

To manually verify a store:

```bash
python scripts/manage_stores.py query --domain genesis --query "What is GENESIS?"
```

## Troubleshooting

### "GOOGLE_API_KEY not set"
```bash
export GOOGLE_API_KEY="your-key-here"
```

### "File not found" during upload
Ensure you're running from the `bff/` directory:
```bash
cd bff
python scripts/upload_knowledge_stores.py --step upload
```

### Timeout during upload
Large files may take 1-2 minutes. The script retries up to 3 times.

### Store verification fails
- Check that documents were uploaded successfully (look for ✓ in upload logs)
- Verify API key is valid with high quota

### Can't find `.env.stores`
Check that the script ran successfully. It's created in the `bff/` directory.

## Output Example

```
=== GENESIS KNOWLEDGE STORE BATCH UPLOAD ===

--- CREATING STORES ---

ℹ Creating store for genesis...
✓ Created genesis store: projects/123456/locations/us-central1/fileStores/abc123
ℹ Creating store for train...
✓ Created train store: projects/123456/locations/us-central1/fileStores/def456
...

--- UPLOADING DOCUMENTS ---

ℹ Uploading 3 file(s) to genesis...
ℹ   Uploading genesis_identity.md...
✓   Uploaded genesis_identity.md
...

--- VERIFYING STORES ---

ℹ Verifying genesis with query: What is the core identity and mission of GENESIS?
✓ genesis store verified
...

--- SUMMARY ---

Store Creation:
  genesis: Created
  train: Created
  ...

Document Uploads:
  genesis: 3 file(s)
    - genesis_identity.md
    - ngx_philosophy_expanded.md
    - muscle_endocrine_function.md
  ...

Store Verification:
  genesis: Verified
  train: Verified
  ...

Store IDs:
  FILESEARCH_STORE_GENESIS=projects/123456/locations/us-central1/fileStores/abc123
  FILESEARCH_STORE_TRAIN=projects/123456/locations/us-central1/fileStores/def456
  ...
```

## BFF Integration

The BFF uses these store IDs via the `knowledge_tools.py` module:

```python
# In services/knowledge_tools.py
KNOWLEDGE_STORE_MAPPING = {
    "genesis": os.getenv("FILESEARCH_STORE_GENESIS"),
    "train": os.getenv("FILESEARCH_STORE_TRAIN"),
    "fuel": os.getenv("FILESEARCH_STORE_FUEL"),
    "mind": os.getenv("FILESEARCH_STORE_MIND"),
    "track": os.getenv("FILESEARCH_STORE_TRACK"),
}

# Used in search_knowledge() tool
def search_knowledge(query: str, domain: str = "genesis") -> str:
    store_name = KNOWLEDGE_STORE_MAPPING.get(domain)
    if not store_name:
        return f"Knowledge store not configured for domain: {domain}"

    # Query via Gemini File Search API
    ...
```

## Advanced Usage

### Update Document in Store

```bash
# Remove old version (manual via console), then:
python scripts/manage_stores.py upload \
  --domain genesis \
  --file knowledge/genesis/updated_philosophy.md
```

### Bulk Update All Documents

```bash
# Delete all stores, recreate, and re-upload:
python scripts/upload_knowledge_stores.py --step all
```

### Custom Store Names

Edit `DOCUMENT_MAPPING` and rerun:

```bash
python scripts/upload_knowledge_stores.py --step create
```

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `GOOGLE_API_KEY` | Gemini API authentication | `sk-proj-...` |
| `FILESEARCH_STORE_GENESIS` | Genesis store resource name | `projects/123/locations/us-central1/fileStores/abc` |
| `FILESEARCH_STORE_TRAIN` | Train store resource name | `projects/123/locations/us-central1/fileStores/def` |
| `FILESEARCH_STORE_FUEL` | Fuel store resource name | `projects/123/locations/us-central1/fileStores/ghi` |
| `FILESEARCH_STORE_MIND` | Mind store resource name | `projects/123/locations/us-central1/fileStores/jkl` |
| `FILESEARCH_STORE_TRACK` | Track store resource name | `projects/123/locations/us-central1/fileStores/mno` |

## Related Files

- `bff/services/knowledge_tools.py` - Wraps File Search API for agents
- `bff/agents/*/` - Agents that query knowledge stores
- `bff/knowledge/` - Knowledge documents directory
- `bff/.env.stores` - Generated store IDs (auto-created)

## See Also

- [GENESIS.md](../../GENESIS.md) - Full project documentation
- [CLAUDE.md](../../CLAUDE.md) - Architecture and tech stack
- [Gemini File Search API](https://ai.google.dev/api/python/google/genai)
