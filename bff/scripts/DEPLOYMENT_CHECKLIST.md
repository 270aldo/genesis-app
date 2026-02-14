# Knowledge Store Deployment Checklist

Use this checklist to deploy the knowledge stores in your environment.

## Pre-Deployment

- [ ] **API Key Ready**: Have your GOOGLE_API_KEY from Google Cloud Console
- [ ] **Dependencies Installed**: Run `pip install google-genai>=1.1.0`
- [ ] **Documents Verified**: All 15 files exist in `knowledge/` subdirectories
- [ ] **Scripts Present**: Both `upload_knowledge_stores.py` and `manage_stores.py` are in place

## Verify Knowledge Documents

Check all 15 documents are present:

### Genesis (3)
- [ ] `knowledge/genesis/genesis_identity.md`
- [ ] `knowledge/genesis/ngx_philosophy_expanded.md`
- [ ] `knowledge/genesis/muscle_endocrine_function.md`

### Train (4)
- [ ] `knowledge/train/training_splits.md`
- [ ] `knowledge/train/exercise_database.md`
- [ ] `knowledge/train/periodization_progression.md`
- [ ] `knowledge/train/corrective_exercise.md`

### Fuel (3)
- [ ] `knowledge/fuel/nutrition_protocols.md`
- [ ] `knowledge/fuel/protein_guidelines.md`
- [ ] `knowledge/fuel/supplementation.md`

### Mind (3)
- [ ] `knowledge/mind/sleep_architecture.md`
- [ ] `knowledge/mind/stress_recovery.md`
- [ ] `knowledge/mind/brain_fitness_protocols.md`

### Track (2)
- [ ] `knowledge/track/assessment_protocols.md`
- [ ] `knowledge/track/tracking_system.md`

## Deployment Steps

### Step 1: Environment Setup
```bash
cd bff
export GOOGLE_API_KEY="your-gemini-api-key-here"
```
- [ ] API key exported and working
- [ ] `bff/` directory is current working directory

### Step 2: Create Stores
```bash
python scripts/upload_knowledge_stores.py --step create
```
- [ ] All 5 stores created successfully
- [ ] See confirmation messages: "✓ Created genesis store", etc.
- [ ] `.env.stores` file created with store IDs

### Step 3: Upload Documents
```bash
python scripts/upload_knowledge_stores.py --step upload
```
- [ ] All 15 files uploaded
- [ ] See success messages: "✓ Uploaded genesis_identity.md", etc.
- [ ] No file-not-found errors
- [ ] Check for any retry messages (normal if they appear)

### Step 4: Verify Stores
```bash
python scripts/upload_knowledge_stores.py --step verify
```
- [ ] All 5 stores return "✓ Verified"
- [ ] Test queries get responses (may take 10-30 seconds)

### Step 5: Configure Environment
```bash
# Option A: Source the stores file
source .env.stores

# Option B: Append to .env
cat .env.stores >> .env

# Option C: Manually copy values
cat .env.stores
# Then add FILESEARCH_STORE_* variables to your .env
```
- [ ] Store IDs now available in environment
- [ ] `echo $FILESEARCH_STORE_GENESIS` returns a valid store ID

## Post-Deployment Verification

### Quick Sanity Check
```bash
python scripts/manage_stores.py list
```
- [ ] See all 5 stores listed: genesis, train, fuel, mind, track

### Test Agent Knowledge Queries
```bash
python scripts/manage_stores.py query --domain genesis --query "What is GENESIS?"
python scripts/manage_stores.py query --domain train --query "periodization"
python scripts/manage_stores.py query --domain fuel --query "protein guidelines"
python scripts/manage_stores.py query --domain mind --query "sleep"
python scripts/manage_stores.py query --domain track --query "metrics"
```
- [ ] All queries return relevant responses
- [ ] Queries use knowledge from uploaded documents

### BFF Integration Check
```bash
# Start BFF server
uvicorn main:app --reload

# In another terminal, test the chat endpoint
curl -X POST http://localhost:8000/mobile/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "What is GENESIS?"}'
```
- [ ] BFF starts without knowledge store errors
- [ ] Chat responses include knowledge-grounded information
- [ ] No 404 errors for store configuration

## Common Issues

### ✗ "GOOGLE_API_KEY not set"
```bash
export GOOGLE_API_KEY="your-key"
python scripts/upload_knowledge_stores.py --step create
```

### ✗ "File not found during upload"
```bash
# Verify you're in bff directory
pwd
# Should show: /path/to/genesis-app/bff

# Check files exist
ls knowledge/genesis/genesis_identity.md
# If missing, they need to be added to the repo
```

### ✗ "Store verification fails (empty response)"
- Store may still be indexing (takes 1-2 minutes)
- Re-run verification later:
  ```bash
  python scripts/upload_knowledge_stores.py --step verify
  ```

### ✗ "API quota exceeded"
- Wait a few hours for quota reset
- Or increase API quota in Google Cloud Console

### ✗ ".env.stores not created"
```bash
# Ensure script ran successfully
python scripts/upload_knowledge_stores.py --step create

# Manual creation if needed
cat > .env.stores << EOF
FILESEARCH_STORE_GENESIS=projects/.../fileStores/...
FILESEARCH_STORE_TRAIN=projects/.../fileStores/...
# ... etc
EOF
```

## Rollback

If something goes wrong:

### Option 1: Re-run Full Pipeline
```bash
# This will re-create stores and re-upload all files
python scripts/upload_knowledge_stores.py --step all
```

### Option 2: Selective Re-upload
```bash
# Re-upload specific domain (keeps existing store)
python scripts/upload_knowledge_stores.py --step upload
```

### Option 3: Manual Cleanup (if needed)
```bash
# List stores to find resource IDs
python scripts/manage_stores.py list

# Delete via Google Cloud Console or API
# Then re-run create step
```

## Performance Notes

- **Time to completion**: 10-15 minutes for full pipeline
- **Slowest part**: Document uploads (5-10 min)
- **Network dependency**: Uploads require good connectivity
- **API limits**: Google enforces rate limits - retries handle this

## Success Criteria

You're done when:

1. ✓ All 5 stores created (shown in list)
2. ✓ All 15 documents uploaded (confirmed in output)
3. ✓ All 5 stores verified (test queries work)
4. ✓ `.env.stores` exists with 5 `FILESEARCH_STORE_*` variables
5. ✓ Environment variables are loaded
6. ✓ BFF starts without knowledge store errors
7. ✓ Agent queries return knowledge-grounded responses

## Next Steps

After deployment:

1. **Update BFF Configuration**
   - Ensure `.env` or `.env.stores` is sourced
   - Restart BFF server

2. **Test Agents**
   - Run BFF tests: `python -m pytest tests/ -v`
   - Query agents via chat endpoint

3. **Monitor Knowledge**
   - Check agent responses include relevant knowledge
   - Add more documents as needed

4. **Future Maintenance**
   - Update documents: add new files and re-run upload step
   - Query verification: test queries periodically
   - Monitor API usage and quota

## Troubleshooting Resources

- **Script Help**: `python scripts/upload_knowledge_stores.py --help`
- **Documentation**: See `KNOWLEDGE_STORE_README.md`
- **Quick Start**: See `QUICK_START.md`
- **Full Details**: See `KNOWLEDGE_STORE_IMPLEMENTATION.md`

## Support Commands

```bash
# List all scripts and docs
ls -lh bff/scripts/

# Show all store IDs
cat .env.stores

# Test individual store
python scripts/manage_stores.py query \
  --domain genesis \
  --query "What is the NGX philosophy?"

# Get store details
python scripts/manage_stores.py list

# Re-verify a store
python scripts/upload_knowledge_stores.py --step verify
```

## Deployment Date

- **Date**: _______________
- **Deployed By**: _______________
- **Duration**: _______________
- **Issues**: _______________
- **Notes**: _______________

---

For questions or issues, refer to the documentation files or the main GENESIS.md project documentation.
