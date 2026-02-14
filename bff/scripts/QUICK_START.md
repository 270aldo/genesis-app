# Knowledge Store Quick Start

Get your GENESIS knowledge stores up and running in 2 minutes.

## Step 1: Set Your API Key

```bash
export GOOGLE_API_KEY="your-gemini-api-key-here"
```

## Step 2: Run the Batch Upload

```bash
cd bff
python scripts/upload_knowledge_stores.py --step all
```

That's it! The script will:
- Create 5 File Search stores (genesis, train, fuel, mind, track)
- Upload 15 knowledge documents
- Verify all uploads
- Save store IDs to `.env.stores`

## Step 3: Load Store IDs in Your Environment

```bash
# Option A: Source the file (Linux/Mac)
source .env.stores

# Option B: Copy values to your .env manually
cat .env.stores >> .env
```

## Verify It Works

```bash
python scripts/manage_stores.py query --domain genesis --query "What is GENESIS?"
```

## Troubleshooting

**"GOOGLE_API_KEY not set"**
```bash
export GOOGLE_API_KEY="your-key"
```

**"File not found"**
- Ensure you're in the `bff/` directory
- Check that `knowledge/` subdirectory exists with documents

**Timeout errors**
- Some files take 1-2 minutes. The script retries automatically.
- Check your API quota if errors persist.

## What Gets Created

```
.env.stores (auto-generated)
├── FILESEARCH_STORE_GENESIS=projects/...
├── FILESEARCH_STORE_TRAIN=projects/...
├── FILESEARCH_STORE_FUEL=projects/...
├── FILESEARCH_STORE_MIND=projects/...
└── FILESEARCH_STORE_TRACK=projects/...
```

## Next Steps

- [Full Documentation](KNOWLEDGE_STORE_README.md)
- Query stores: `python scripts/manage_stores.py query --domain train --query "periodization"`
- Upload new docs: `python scripts/manage_stores.py upload --domain genesis --file my-doc.md`
- List stores: `python scripts/manage_stores.py list`
