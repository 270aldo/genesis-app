# Knowledge Store Scripts Index

Welcome! This directory contains the complete knowledge store management system for GENESIS.

## Quick Navigation

### For First-Time Users
Start here: **[QUICK_START.md](QUICK_START.md)** (2 minutes)
- Get your stores running in 2 minutes
- Essential setup steps
- Verification command

### For Deployment
Read this: **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)**
- Step-by-step deployment guide
- Pre-flight checks
- Post-deployment verification
- Troubleshooting guide

### For Reference
Consult: **[KNOWLEDGE_STORE_README.md](KNOWLEDGE_STORE_README.md)**
- Complete usage guide
- Document mappings
- Configuration options
- Advanced usage patterns
- Integration details

### For Architecture & Design
Study: **[KNOWLEDGE_STORE_IMPLEMENTATION.md](../KNOWLEDGE_STORE_IMPLEMENTATION.md)**
- System architecture
- API reference
- Performance characteristics
- Future enhancements

## Scripts

### Primary Script: upload_knowledge_stores.py

The main batch upload automation tool.

```bash
# Full pipeline (create + upload + verify)
python scripts/upload_knowledge_stores.py --step all

# Individual steps
python scripts/upload_knowledge_stores.py --step create
python scripts/upload_knowledge_stores.py --step upload
python scripts/upload_knowledge_stores.py --step verify

# List existing stores
python scripts/upload_knowledge_stores.py --list
```

**Features**:
- Creates 5 File Search stores
- Uploads 15 knowledge documents
- Verifies all uploads
- Saves store IDs to `.env.stores`
- Retry logic with exponential backoff
- Colored progress output

### Secondary Script: manage_stores.py (Enhanced)

Individual store management with new batch-upload command.

```bash
# Batch operations (new)
python scripts/manage_stores.py batch-upload --step all

# Individual store operations
python scripts/manage_stores.py create --domain train
python scripts/manage_stores.py upload --domain train --file docs/file.md
python scripts/manage_stores.py list
python scripts/manage_stores.py query --domain train --query "periodization"
```

**New Features**:
- `batch-upload` subcommand delegates to upload_knowledge_stores.py
- Backward compatible with all existing commands

## Knowledge Stores

| Domain | Docs | Purpose |
|--------|------|---------|
| **GENESIS** | 3 | Core identity, philosophy, foundational knowledge |
| **TRAIN** | 4 | Periodization, exercise science, training principles |
| **FUEL** | 3 | Nutrition protocols, macros, supplementation |
| **MIND** | 3 | Sleep, stress, recovery, brain fitness |
| **TRACK** | 2 | Assessment, metrics, tracking systems |

Total: 5 stores × 15 documents

## Typical Workflow

### 1. First-Time Setup
```bash
# Set API key
export GOOGLE_API_KEY="your-key"

# Run full pipeline
python scripts/upload_knowledge_stores.py --step all

# Load store IDs
source .env.stores
```

### 2. Verify Setup
```bash
# List all stores
python scripts/manage_stores.py list

# Test a query
python scripts/manage_stores.py query \
  --domain genesis \
  --query "What is GENESIS?"
```

### 3. Update BFF Configuration
```bash
# Ensure .env.stores is sourced
source .env.stores

# Or append to .env
cat .env.stores >> .env

# Restart BFF
uvicorn main:app --reload
```

### 4. Verify Agent Knowledge
```bash
# Query agents via chat endpoint
# They should now use the knowledge stores
curl -X POST http://localhost:8000/mobile/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "Tell me about periodization"}'
```

## Document Structure

```
knowledge/
├── genesis/                      (3 files)
│   ├── genesis_identity.md
│   ├── ngx_philosophy_expanded.md
│   └── muscle_endocrine_function.md
├── train/                        (4 files)
│   ├── training_splits.md
│   ├── exercise_database.md
│   ├── periodization_progression.md
│   └── corrective_exercise.md
├── fuel/                         (3 files)
│   ├── nutrition_protocols.md
│   ├── protein_guidelines.md
│   └── supplementation.md
├── mind/                         (3 files)
│   ├── sleep_architecture.md
│   ├── stress_recovery.md
│   └── brain_fitness_protocols.md
└── track/                        (2 files)
    ├── assessment_protocols.md
    └── tracking_system.md
```

## Configuration

All configuration is in the scripts themselves:

### Chunking Config (upload_knowledge_stores.py)
```python
CHUNKING_CONFIG = {
    "max_tokens_per_chunk": 512,
    "max_overlap_tokens": 50,
}
```

### Retry Config (upload_knowledge_stores.py)
```python
MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds
```

### Model (upload_knowledge_stores.py)
```python
model="gemini-2.5-flash"  # Used for verification
```

To customize, edit the constants in upload_knowledge_stores.py and re-run.

## Environment Variables

**Required**:
- `GOOGLE_API_KEY` - Your Gemini API key

**Generated** (auto-created by script):
- `.env.stores` file with:
  - `FILESEARCH_STORE_GENESIS`
  - `FILESEARCH_STORE_TRAIN`
  - `FILESEARCH_STORE_FUEL`
  - `FILESEARCH_STORE_MIND`
  - `FILESEARCH_STORE_TRACK`

## Troubleshooting

### Common Issues

**"GOOGLE_API_KEY not set"**
```bash
export GOOGLE_API_KEY="your-key"
```

**"File not found during upload"**
```bash
# Ensure you're in bff/ directory
cd bff

# Verify documents exist
ls knowledge/genesis/
```

**"Store verification fails"**
- Wait 1-2 minutes (stores are still indexing)
- Re-run: `python scripts/upload_knowledge_stores.py --step verify`

**"API quota exceeded"**
- Wait for quota reset
- Or increase quota in Google Cloud Console

### Getting Help

1. Check **QUICK_START.md** for common issues
2. Read **KNOWLEDGE_STORE_README.md** for detailed help
3. See **DEPLOYMENT_CHECKLIST.md** for step-by-step verification
4. Review **KNOWLEDGE_STORE_IMPLEMENTATION.md** for architecture details

## API Reference

### upload_knowledge_stores.py

```python
class StoreManager:
    def create_store(domain: str) -> Optional[str]
    def upload_file(file_path: Path, store_name: str) -> bool
    def upload_documents(bff_path: Path) -> None
    def verify_store(domain: str) -> bool
    def save_env_file() -> None
```

### manage_stores.py

Existing commands unchanged. New command:
```bash
cmd_batch_upload(args) -> None
  # Delegates to upload_knowledge_stores.py
```

## Integration

The knowledge stores are used by:

```
BFF (main.py)
  ↓
agents/ (all 5 agents)
  ↓
tools/knowledge_tools.py
  ↓
search_knowledge(query, domain)
  ↓
Gemini File Search API
  ↓
FILESEARCH_STORE_* (env vars)
```

Each agent (genesis, train, fuel, mind, track) has a `search_knowledge` tool that queries its corresponding store.

## Performance

- **Create 5 stores**: ~5-10 seconds
- **Upload 15 documents**: ~5-10 minutes
- **Verify 5 stores**: ~30-60 seconds
- **Total**: ~10-15 minutes

## Quality

- ✓ Production-quality Python code
- ✓ PEP 8 compliant
- ✓ Comprehensive error handling
- ✓ Retry logic for reliability
- ✓ Colored output for clarity
- ✓ Extensively documented
- ✓ Backward compatible
- ✓ Graceful degradation

## Support Files

| File | Purpose |
|------|---------|
| QUICK_START.md | 2-minute setup guide |
| KNOWLEDGE_STORE_README.md | Complete reference |
| DEPLOYMENT_CHECKLIST.md | Step-by-step deployment |
| KNOWLEDGE_STORE_IMPLEMENTATION.md | Architecture & design |
| INDEX.md | This file |

## Next Steps

1. Read **QUICK_START.md**
2. Run `upload_knowledge_stores.py --step all`
3. Source `.env.stores`
4. Verify with `manage_stores.py list`
5. Restart BFF to use knowledge stores

## Additional Resources

- **Main Project**: See [GENESIS.md](../../GENESIS.md)
- **Project Context**: See [CLAUDE.md](../../CLAUDE.md)
- **Agent Details**: See [AGENTS.md](../../AGENTS.md)
- **Knowledge Services**: See [services/knowledge_tools.py](../services/knowledge_tools.py)

---

**Last Updated**: February 2026
**Status**: Production Ready
**Version**: 1.0
