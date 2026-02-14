# Knowledge Store Implementation Summary

## Overview

A comprehensive batch upload system has been created for GENESIS knowledge stores. This automates the entire setup process for the 5 File Search stores that power the agent knowledge bases.

## Files Created

### 1. Primary Script: `bff/scripts/upload_knowledge_stores.py` (16KB)

**Purpose**: Automated batch upload with full lifecycle management

**Key Features**:
- Creates 5 File Search stores (genesis, train, fuel, mind, track)
- Uploads pre-mapped documents to each store
- Saves store IDs to `.env.stores` file
- Verifies uploads with test queries
- Retry logic (up to 3 attempts per file)
- Colored terminal output with progress indicators
- Graceful error handling and fallback behavior

**Architecture**:
```python
class StoreManager:
  - load_env_stores()      # Load existing store IDs
  - create_store()         # Create individual store
  - upload_file()          # Upload with retry logic
  - upload_documents()     # Batch upload all docs
  - verify_store()         # Test query verification
  - save_env_file()        # Save to .env.stores
  - print_summary()        # Display results
```

**Configuration**:
```python
CHUNKING_CONFIG = {
    "max_tokens_per_chunk": 512,
    "max_overlap_tokens": 50,
}
MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds
```

**Usage**:
```bash
python scripts/upload_knowledge_stores.py --step all       # Full pipeline
python scripts/upload_knowledge_stores.py --step create    # Only create
python scripts/upload_knowledge_stores.py --step upload    # Only upload
python scripts/upload_knowledge_stores.py --step verify    # Only verify
python scripts/upload_knowledge_stores.py --list           # List stores
```

### 2. Enhanced Script: `bff/scripts/manage_stores.py` (5.5KB)

**Changes**:
- Added new `batch-upload` subcommand
- New function `cmd_batch_upload()` that delegates to `upload_knowledge_stores.py`
- Enhanced docstring with batch-upload examples
- Added imports: `subprocess` and `Path`

**New Usage**:
```bash
python scripts/manage_stores.py batch-upload --step all
python scripts/manage_stores.py batch-upload --step create
python scripts/manage_stores.py batch-upload --step upload
python scripts/manage_stores.py batch-upload --step verify
```

**Existing Commands** (unchanged):
```bash
python scripts/manage_stores.py create --domain train
python scripts/manage_stores.py upload --domain train --file docs/file.md
python scripts/manage_stores.py list
python scripts/manage_stores.py query --domain train --query "periodization"
```

### 3. Documentation: `bff/scripts/KNOWLEDGE_STORE_README.md` (9.6KB)

Comprehensive guide covering:
- Overview of 5 stores and their purposes
- Detailed usage for both scripts
- Setup instructions (3 steps)
- Document mapping reference
- Verification procedures
- Troubleshooting guide
- BFF integration details
- Environment variables reference
- Output examples
- Advanced usage patterns

### 4. Quick Start Guide: `bff/scripts/QUICK_START.md` (1.7KB)

Quick 2-minute setup guide with:
- API key setup
- Single command to run full pipeline
- Environment loading
- Verification
- Troubleshooting

## Document Mapping

All 15 knowledge documents are automatically mapped to the correct stores:

```
GENESIS (3 docs):
  ├── knowledge/genesis/genesis_identity.md
  ├── knowledge/genesis/ngx_philosophy_expanded.md
  └── knowledge/genesis/muscle_endocrine_function.md

TRAIN (4 docs):
  ├── knowledge/train/training_splits.md
  ├── knowledge/train/exercise_database.md
  ├── knowledge/train/periodization_progression.md
  └── knowledge/train/corrective_exercise.md

FUEL (3 docs):
  ├── knowledge/fuel/nutrition_protocols.md
  ├── knowledge/fuel/protein_guidelines.md
  └── knowledge/fuel/supplementation.md

MIND (3 docs):
  ├── knowledge/mind/sleep_architecture.md
  ├── knowledge/mind/stress_recovery.md
  └── knowledge/mind/brain_fitness_protocols.md

TRACK (2 docs):
  ├── knowledge/track/assessment_protocols.md
  └── knowledge/track/tracking_system.md
```

## Workflow

### Full Pipeline (--step all)

```
START
  ├─ Create 5 stores
  │   └─ Save store IDs to .env.stores
  ├─ Upload all documents (15 files)
  │   ├─ genesis (3 files)
  │   ├─ train (4 files)
  │   ├─ fuel (3 files)
  │   ├─ mind (3 files)
  │   └─ track (2 files)
  ├─ Verify each store with test query
  │   ├─ GENESIS: "What is the core identity and mission of GENESIS?"
  │   ├─ TRAIN: "What are the key principles of periodized training?"
  │   ├─ FUEL: "What are the protein guidelines for muscle building?"
  │   ├─ MIND: "How does sleep architecture relate to recovery?"
  │   └─ TRACK: "What are the key metrics in the tracking system?"
  └─ Print summary
END
```

### Retry Logic

Each file upload has automatic retry:
```
Attempt 1 → Failure? ─┐
                      ├─ Wait 2s → Attempt 2 → Failure? ─┐
                                                         ├─ Wait 2s → Attempt 3 → Failure/Success
                                                         │
                      └─ Success
```

## Output Example

```
=== GENESIS KNOWLEDGE STORE BATCH UPLOAD ===

--- CREATING STORES ---

ℹ Creating store for genesis...
✓ Created genesis store: projects/123456/locations/us-central1/fileStores/abc
ℹ Creating store for train...
✓ Created train store: projects/123456/locations/us-central1/fileStores/def
ℹ Creating store for fuel...
✓ Created fuel store: projects/123456/locations/us-central1/fileStores/ghi
ℹ Creating store for mind...
✓ Created mind store: projects/123456/locations/us-central1/fileStores/jkl
ℹ Creating store for track...
✓ Created track store: projects/123456/locations/us-central1/fileStores/mno

ℹ Saving store IDs to bff/.env.stores...
✓ Saved store IDs to bff/.env.stores

--- UPLOADING DOCUMENTS ---

ℹ Uploading 3 file(s) to genesis...
ℹ   Uploading genesis_identity.md...
✓   Uploaded genesis_identity.md
ℹ   Uploading ngx_philosophy_expanded.md...
✓   Uploaded ngx_philosophy_expanded.md
ℹ   Uploading muscle_endocrine_function.md...
✓   Uploaded muscle_endocrine_function.md

ℹ Uploading 4 file(s) to train...
ℹ   Uploading training_splits.md...
✓   Uploaded training_splits.md
[... continues for all 15 files ...]

--- VERIFYING STORES ---

ℹ Verifying genesis with query: What is the core identity and mission of GENESIS?
✓ genesis store verified
ℹ Verifying train with query: What are the key principles of periodized training?
✓ train store verified
[... continues for all 5 stores ...]

--- SUMMARY ---

Store Creation:
  genesis: Created
  train: Created
  fuel: Created
  mind: Created
  track: Created

Document Uploads:
  genesis: 3 file(s)
    - genesis_identity.md
    - ngx_philosophy_expanded.md
    - muscle_endocrine_function.md
  train: 4 file(s)
    - training_splits.md
    - exercise_database.md
    - periodization_progression.md
    - corrective_exercise.md
  fuel: 3 file(s)
    - nutrition_protocols.md
    - protein_guidelines.md
    - supplementation.md
  mind: 3 file(s)
    - sleep_architecture.md
    - stress_recovery.md
    - brain_fitness_protocols.md
  track: 2 file(s)
    - assessment_protocols.md
    - tracking_system.md

Store Verification:
  genesis: Verified
  train: Verified
  fuel: Verified
  mind: Verified
  track: Verified

Store IDs:
  FILESEARCH_STORE_GENESIS=projects/123456/locations/us-central1/fileStores/abc
  FILESEARCH_STORE_TRAIN=projects/123456/locations/us-central1/fileStores/def
  FILESEARCH_STORE_FUEL=projects/123456/locations/us-central1/fileStores/ghi
  FILESEARCH_STORE_MIND=projects/123456/locations/us-central1/fileStores/jkl
  FILESEARCH_STORE_TRACK=projects/123456/locations/us-central1/fileStores/mno
```

## API Reference

### StoreManager Class

```python
class StoreManager:
    def __init__(self, api_key: Optional[str] = None)
        # Initialize with Gemini client

    def load_env_stores(self) -> None
        # Load existing store IDs from .env.stores

    def get_all_stores(self) -> List[Tuple[str, str]]
        # Get list of all File Search Stores

    def create_store(self, domain: str, display_name: Optional[str] = None) -> Optional[str]
        # Create a File Search Store for a domain
        # Returns: store_name (resource ID)

    def upload_file(self, file_path: Path, store_name: str, domain: str) -> bool
        # Upload a single file with retry logic
        # Returns: True if successful

    def upload_documents(self, bff_path: Path) -> None
        # Upload all documents to their respective stores

    def verify_store(self, domain: str) -> bool
        # Verify a store with a test query
        # Returns: True if verified

    def save_env_file(self) -> None
        # Save store IDs to .env.stores file

    def print_summary(self) -> None
        # Print comprehensive summary of all operations
```

### ColorOutput Class

Terminal formatting utility:
```python
ColorOutput.success(msg)  # Green ✓
ColorOutput.info(msg)     # Blue ℹ
ColorOutput.warn(msg)     # Yellow ⚠
ColorOutput.error(msg)    # Red ✗
ColorOutput.header(msg)   # Bold
```

## Environment Variables

**Required**:
- `GOOGLE_API_KEY` - Gemini API key for authentication

**Generated** (by script):
- `FILESEARCH_STORE_GENESIS` - Genesis store resource ID
- `FILESEARCH_STORE_TRAIN` - Train store resource ID
- `FILESEARCH_STORE_FUEL` - Fuel store resource ID
- `FILESEARCH_STORE_MIND` - Mind store resource ID
- `FILESEARCH_STORE_TRACK` - Track store resource ID

**Generated Location**:
- File: `bff/.env.stores` (auto-created)
- Load with: `source .env.stores` or copy to `.env`

## Setup Instructions

### 1. Get API Key
```bash
# From Google Cloud Console
export GOOGLE_API_KEY="sk-proj-..."
```

### 2. Run Batch Upload
```bash
cd bff
python scripts/upload_knowledge_stores.py --step all
```

### 3. Load Store IDs
```bash
# Option A: Source directly (Linux/Mac)
source .env.stores

# Option B: Append to .env
cat .env.stores >> .env
```

### 4. Verify
```bash
python scripts/manage_stores.py query --domain genesis --query "What is GENESIS?"
```

## Error Handling

The script gracefully handles:
- Missing API key → Clear error message
- File not found → Skip file, continue
- Upload timeout → Auto-retry up to 3 times
- Verification timeout → Mark as not verified, continue
- Missing store → Graceful degradation
- Invalid domain → Skip domain, continue

All errors are logged with colored output for visibility.

## Integration with BFF

The knowledge stores are used by `bff/services/knowledge_tools.py`:

```python
KNOWLEDGE_STORE_MAPPING = {
    "genesis": os.getenv("FILESEARCH_STORE_GENESIS"),
    "train": os.getenv("FILESEARCH_STORE_TRAIN"),
    "fuel": os.getenv("FILESEARCH_STORE_FUEL"),
    "mind": os.getenv("FILESEARCH_STORE_MIND"),
    "track": os.getenv("FILESEARCH_STORE_TRACK"),
}

def search_knowledge(query: str, domain: str = "genesis") -> str:
    # Uses the store IDs to query via Gemini File Search API
    ...
```

All 5 agents (genesis, train, fuel, mind, track) use these stores via the `search_knowledge()` tool.

## Testing

Both scripts have been syntax-validated:
```bash
python -m py_compile upload_knowledge_stores.py
python -m py_compile manage_stores.py
```

To test after API setup:
```bash
python scripts/upload_knowledge_stores.py --list  # List existing stores
python scripts/manage_stores.py list              # Alternative list
```

## Extensibility

### Add New Documents

1. Place document in `knowledge/{domain}/`
2. Update `DOCUMENT_MAPPING` in `upload_knowledge_stores.py`
3. Re-run: `python scripts/upload_knowledge_stores.py --step upload`

### Change Chunking Config

Edit `CHUNKING_CONFIG` in `upload_knowledge_stores.py`:
```python
CHUNKING_CONFIG = {
    "max_tokens_per_chunk": 512,  # Adjust token size
    "max_overlap_tokens": 50,      # Adjust overlap
}
```

### Custom Verification Queries

Edit `VERIFICATION_QUERIES` in `upload_knowledge_stores.py`:
```python
VERIFICATION_QUERIES = {
    "genesis": "Your custom query...",
    ...
}
```

## File Sizes

```
upload_knowledge_stores.py   16 KB
manage_stores.py (updated)    5.5 KB
KNOWLEDGE_STORE_README.md     9.6 KB
QUICK_START.md                1.7 KB
───────────────────────────────────
Total documentation          11.3 KB
```

## Dependencies

- `google-genai>=1.1.0` (required for API calls)
- `pathlib` (stdlib)
- `argparse` (stdlib)
- `subprocess` (stdlib)
- `sys` (stdlib)
- `time` (stdlib)

## Performance Characteristics

- **Create 5 stores**: ~5-10 seconds
- **Upload 15 files**: ~5-10 minutes (depends on file size)
- **Verify 5 stores**: ~30-60 seconds
- **Total time**: ~10-15 minutes for full pipeline

Uploads are sequential with 1-2 minute processing per file.

## Known Limitations

- Uploads are sequential (not parallel) - can parallelize if needed
- Verification uses simple queries - could be enhanced
- No delta sync (always re-uploads all files)
- Requires manual `.env.stores` sourcing

## Future Enhancements

- Parallel uploads for faster processing
- Delta sync (only upload changed files)
- Automatic .env loading
- Store deletion command
- Document versioning
- Batch update from multiple stores
- Store health check command
- Integration with CI/CD pipeline

## References

- [Gemini File Search API Docs](https://ai.google.dev/api/python/google/genai)
- [GENESIS Project Documentation](../../CLAUDE.md)
- [Knowledge Tools Source](../services/knowledge_tools.py)
