#!/usr/bin/env python3
"""Manage Gemini File Search Stores for GENESIS agent knowledge bases.

Usage:
    python scripts/manage_stores.py create --domain train --display-name "GENESIS Training KB"
    python scripts/manage_stores.py upload --domain train --file docs/training_principles.pdf
    python scripts/manage_stores.py list
    python scripts/manage_stores.py query --domain train --query "periodization"
    python scripts/manage_stores.py batch-upload --step all
    python scripts/manage_stores.py batch-upload --step create

Requires: GOOGLE_API_KEY env var
"""

import argparse
import os
import subprocess
import sys
import time
from pathlib import Path

from google import genai


DOMAINS = ["genesis", "train", "fuel", "mind", "track"]


def get_client() -> genai.Client:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("ERROR: Set GOOGLE_API_KEY environment variable")
        sys.exit(1)
    return genai.Client(api_key=api_key)


def cmd_create(args):
    """Create a new File Search Store for a domain."""
    client = get_client()
    store = client.file_search_stores.create(
        config={"display_name": args.display_name or f"genesis-{args.domain}-kb"}
    )
    print(f"Created store: {store.name}")
    print(f"Set this in .env: FILESEARCH_STORE_{args.domain.upper()}={store.name}")


def cmd_upload(args):
    """Upload a file to a domain's store."""
    client = get_client()
    store_name = os.getenv(f"FILESEARCH_STORE_{args.domain.upper()}")
    if not store_name:
        print(f"ERROR: Set FILESEARCH_STORE_{args.domain.upper()} in .env first")
        sys.exit(1)

    print(f"Uploading {args.file} to {store_name}...")
    operation = client.file_search_stores.upload_to_file_search_store(
        file=args.file,
        file_search_store_name=store_name,
        config={
            "display_name": os.path.basename(args.file),
            "chunking_config": {
                "max_tokens_per_chunk": 512,
                "max_overlap_tokens": 50,
            },
        },
    )

    while not operation.done:
        print("  Processing...")
        time.sleep(3)
        operation = client.operations.get(operation)

    if hasattr(operation, "error") and operation.error:
        print(f"ERROR: Upload failed: {operation.error}")
    else:
        print(f"Uploaded: {args.file}")


def cmd_list(args):
    """List all File Search Stores."""
    client = get_client()
    stores = client.file_search_stores.list()
    for store in stores:
        print(f"  {store.display_name}: {store.name}")


def cmd_query(args):
    """Test query against a domain's store."""
    client = get_client()
    store_name = os.getenv(f"FILESEARCH_STORE_{args.domain.upper()}")
    if not store_name:
        print(f"ERROR: Set FILESEARCH_STORE_{args.domain.upper()} in .env")
        sys.exit(1)

    from google.genai import types

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=args.query,
        config=types.GenerateContentConfig(
            tools=[
                types.Tool(
                    file_search=types.FileSearch(
                        file_search_store_names=[store_name],
                    )
                )
            ],
        ),
    )
    print(f"\nQuery: {args.query}")
    print(f"Response:\n{response.text}")


def cmd_batch_upload(args):
    """Execute batch upload using the specialized script."""
    script_path = Path(__file__).parent / "upload_knowledge_stores.py"
    if not script_path.exists():
        print(f"ERROR: Script not found: {script_path}")
        sys.exit(1)

    cmd = [sys.executable, str(script_path), "--step", args.step]

    if args.api_key:
        cmd.extend(["--api-key", args.api_key])

    try:
        result = subprocess.run(cmd, check=True)
        sys.exit(result.returncode)
    except subprocess.CalledProcessError as e:
        print(f"ERROR: Batch upload failed with code {e.returncode}")
        sys.exit(e.returncode)


def main():
    parser = argparse.ArgumentParser(description="Manage GENESIS File Search Stores")
    sub = parser.add_subparsers(dest="command")

    p_create = sub.add_parser("create")
    p_create.add_argument("--domain", required=True, choices=DOMAINS)
    p_create.add_argument("--display-name", default=None)

    p_upload = sub.add_parser("upload")
    p_upload.add_argument("--domain", required=True, choices=DOMAINS)
    p_upload.add_argument("--file", required=True)

    sub.add_parser("list")

    p_query = sub.add_parser("query")
    p_query.add_argument("--domain", required=True, choices=DOMAINS)
    p_query.add_argument("--query", required=True)

    p_batch = sub.add_parser(
        "batch-upload",
        help="Batch upload all knowledge documents (calls upload_knowledge_stores.py)",
    )
    p_batch.add_argument(
        "--step",
        choices=["create", "upload", "verify", "all"],
        default="all",
        help="Which step to execute (default: all)",
    )
    p_batch.add_argument(
        "--api-key",
        help="Google API key (or use GOOGLE_API_KEY env var)",
        default=None,
    )

    args = parser.parse_args()
    if args.command == "create":
        cmd_create(args)
    elif args.command == "upload":
        cmd_upload(args)
    elif args.command == "list":
        cmd_list(args)
    elif args.command == "query":
        cmd_query(args)
    elif args.command == "batch-upload":
        cmd_batch_upload(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
