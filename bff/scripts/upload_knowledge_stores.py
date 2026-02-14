#!/usr/bin/env python3
"""Batch upload GENESIS knowledge documents to File Search Stores.

This script automates the entire knowledge store setup process:
1. Creates 5 File Search stores (genesis, train, fuel, mind, track)
2. Uploads domain-specific documents to each store
3. Saves store IDs to .env.stores file
4. Verifies uploads with test queries

Usage:
    python scripts/upload_knowledge_stores.py --api-key YOUR_API_KEY
    python scripts/upload_knowledge_stores.py --step create
    python scripts/upload_knowledge_stores.py --step upload
    python scripts/upload_knowledge_stores.py --step verify
    python scripts/upload_knowledge_stores.py --step all

Requires: GOOGLE_API_KEY environment variable (or --api-key flag)
"""

import argparse
import os
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from google import genai
from google.genai import types


# Document mapping: domain -> list of relative file paths
DOCUMENT_MAPPING: Dict[str, List[str]] = {
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

# Test queries for verification
VERIFICATION_QUERIES: Dict[str, str] = {
    "genesis": "What is the core identity and mission of GENESIS?",
    "train": "What are the key principles of periodized training?",
    "fuel": "What are the protein guidelines for muscle building?",
    "mind": "How does sleep architecture relate to recovery?",
    "track": "What are the key metrics in the tracking system?",
}

# Configuration
CHUNKING_CONFIG = {
    "max_tokens_per_chunk": 512,
    "max_overlap_tokens": 50,
}
MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds


class ColorOutput:
    """ANSI color codes for terminal output."""

    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    BLUE = "\033[94m"
    RESET = "\033[0m"
    BOLD = "\033[1m"

    @staticmethod
    def success(msg: str) -> str:
        return f"{ColorOutput.GREEN}✓ {msg}{ColorOutput.RESET}"

    @staticmethod
    def info(msg: str) -> str:
        return f"{ColorOutput.BLUE}ℹ {msg}{ColorOutput.RESET}"

    @staticmethod
    def warn(msg: str) -> str:
        return f"{ColorOutput.YELLOW}⚠ {msg}{ColorOutput.RESET}"

    @staticmethod
    def error(msg: str) -> str:
        return f"{ColorOutput.RED}✗ {msg}{ColorOutput.RESET}"

    @staticmethod
    def header(msg: str) -> str:
        return f"{ColorOutput.BOLD}{msg}{ColorOutput.RESET}"


class StoreManager:
    """Manages File Search Store operations."""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize with Gemini client."""
        key = api_key or os.getenv("GOOGLE_API_KEY")
        if not key:
            print(ColorOutput.error("Set GOOGLE_API_KEY environment variable or use --api-key"))
            sys.exit(1)
        self.client = genai.Client(api_key=key)
        self.stores: Dict[str, str] = {}  # domain -> store_name mapping
        self.results: Dict[str, Dict] = {
            domain: {"created": False, "uploaded": [], "verified": False}
            for domain in DOCUMENT_MAPPING.keys()
        }

    def load_env_stores(self) -> None:
        """Load existing store IDs from .env.stores file."""
        env_file = Path(__file__).parent.parent / ".env.stores"
        if env_file.exists():
            with open(env_file, "r") as f:
                for line in f:
                    line = line.strip()
                    if line and "=" in line and not line.startswith("#"):
                        key, value = line.split("=", 1)
                        if key.startswith("FILESEARCH_STORE_"):
                            domain = key.replace("FILESEARCH_STORE_", "").lower()
                            self.stores[domain] = value.strip()
                            print(ColorOutput.info(f"Loaded {domain} store: {value.strip()}"))

    def get_all_stores(self) -> List[Tuple[str, str]]:
        """Get list of all File Search Stores."""
        try:
            stores = self.client.file_search_stores.list()
            return [(store.display_name, store.name) for store in stores]
        except Exception as e:
            print(ColorOutput.error(f"Failed to list stores: {e}"))
            return []

    def create_store(self, domain: str, display_name: Optional[str] = None) -> Optional[str]:
        """Create a File Search Store for a domain."""
        if domain in self.stores:
            print(ColorOutput.warn(f"Store already exists for {domain}: {self.stores[domain]}"))
            return self.stores[domain]

        name = display_name or f"genesis-{domain}-kb"
        print(ColorOutput.info(f"Creating store for {domain}..."))

        try:
            store = self.client.file_search_stores.create(config={"display_name": name})
            self.stores[domain] = store.name
            self.results[domain]["created"] = True
            print(ColorOutput.success(f"Created {domain} store: {store.name}"))
            return store.name
        except Exception as e:
            print(ColorOutput.error(f"Failed to create {domain} store: {e}"))
            return None

    def upload_file(self, file_path: Path, store_name: str, domain: str) -> bool:
        """Upload a single file to a store with retry logic."""
        if not file_path.exists():
            print(ColorOutput.error(f"File not found: {file_path}"))
            return False

        file_name = file_path.name
        print(ColorOutput.info(f"  Uploading {file_name}..."))

        for attempt in range(MAX_RETRIES):
            try:
                operation = self.client.file_search_stores.upload_to_file_search_store(
                    file=str(file_path),
                    file_search_store_name=store_name,
                    config={
                        "display_name": file_name,
                    },
                )

                # Wait for operation to complete
                while not operation.done:
                    time.sleep(1)
                    operation = self.client.operations.get(operation)

                if hasattr(operation, "error") and operation.error:
                    error_msg = str(operation.error)
                    if attempt < MAX_RETRIES - 1:
                        print(
                            ColorOutput.warn(
                                f"    Attempt {attempt + 1} failed: {error_msg}. Retrying..."
                            )
                        )
                        time.sleep(RETRY_DELAY)
                        continue
                    else:
                        print(ColorOutput.error(f"    Failed after {MAX_RETRIES} attempts: {error_msg}"))
                        return False

                print(ColorOutput.success(f"    Uploaded {file_name}"))
                self.results[domain]["uploaded"].append(file_name)
                return True

            except Exception as e:
                if attempt < MAX_RETRIES - 1:
                    print(
                        ColorOutput.warn(
                            f"    Attempt {attempt + 1} exception: {e}. Retrying..."
                        )
                    )
                    time.sleep(RETRY_DELAY)
                else:
                    print(ColorOutput.error(f"    Failed after {MAX_RETRIES} attempts: {e}"))
                    return False

        return False

    def upload_documents(self, bff_path: Path) -> None:
        """Upload all documents to their respective stores."""
        print(ColorOutput.header("\n--- UPLOADING DOCUMENTS ---\n"))

        for domain, file_paths in DOCUMENT_MAPPING.items():
            store_name = self.stores.get(domain)
            if not store_name:
                print(ColorOutput.error(f"Store not created for {domain}, skipping uploads"))
                continue

            print(ColorOutput.info(f"Uploading {len(file_paths)} file(s) to {domain}..."))

            for file_path_str in file_paths:
                full_path = bff_path / file_path_str
                if not full_path.exists():
                    print(ColorOutput.warn(f"  File not found: {full_path}"))
                    continue
                self.upload_file(full_path, store_name, domain)

    def verify_store(self, domain: str) -> bool:
        """Verify a store with a test query."""
        store_name = self.stores.get(domain)
        if not store_name:
            print(ColorOutput.error(f"No store for {domain}"))
            return False

        query = VERIFICATION_QUERIES.get(domain, f"What is {domain}?")
        print(ColorOutput.info(f"Verifying {domain} with query: {query}"))

        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=query,
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

            if response.text:
                print(ColorOutput.success(f"{domain} store verified"))
                self.results[domain]["verified"] = True
                return True
            else:
                print(ColorOutput.warn(f"{domain} returned empty response"))
                return False

        except Exception as e:
            print(ColorOutput.error(f"Verification failed for {domain}: {e}"))
            return False

    def save_env_file(self) -> None:
        """Save store IDs to .env.stores file."""
        env_file = Path(__file__).parent.parent / ".env.stores"
        print(ColorOutput.info(f"Saving store IDs to {env_file}..."))

        content = "# GENESIS File Search Store IDs (Auto-generated)\n"
        content += "# Generated by upload_knowledge_stores.py\n\n"

        for domain, store_name in self.stores.items():
            content += f"FILESEARCH_STORE_{domain.upper()}={store_name}\n"

        try:
            with open(env_file, "w") as f:
                f.write(content)
            print(ColorOutput.success(f"Saved store IDs to {env_file}"))
        except Exception as e:
            print(ColorOutput.error(f"Failed to save .env.stores: {e}"))

    def print_summary(self) -> None:
        """Print a summary of all store operations."""
        print(ColorOutput.header("\n--- SUMMARY ---\n"))

        print("Store Creation:")
        for domain in sorted(self.results.keys()):
            if self.results[domain]["created"]:
                print(ColorOutput.success(f"  {domain}: Created"))
            else:
                print(ColorOutput.error(f"  {domain}: Not created"))

        print("\nDocument Uploads:")
        for domain in sorted(self.results.keys()):
            uploaded = self.results[domain]["uploaded"]
            if uploaded:
                print(ColorOutput.success(f"  {domain}: {len(uploaded)} file(s)"))
                for file in uploaded:
                    print(f"    - {file}")
            else:
                print(ColorOutput.error(f"  {domain}: No files uploaded"))

        print("\nStore Verification:")
        for domain in sorted(self.results.keys()):
            if self.results[domain]["verified"]:
                print(ColorOutput.success(f"  {domain}: Verified"))
            else:
                print(ColorOutput.error(f"  {domain}: Not verified"))

        print("\nStore IDs:")
        for domain in sorted(self.stores.keys()):
            print(f"  FILESEARCH_STORE_{domain.upper()}={self.stores[domain]}")

        print()


def run_step(step: str, manager: StoreManager, bff_path: Path) -> None:
    """Execute a single step."""
    if step == "create":
        print(ColorOutput.header("--- CREATING STORES ---\n"))
        for domain in DOCUMENT_MAPPING.keys():
            manager.create_store(domain)
        manager.save_env_file()

    elif step == "upload":
        if not manager.stores:
            manager.load_env_stores()
        if not manager.stores:
            print(ColorOutput.error("No stores found. Run 'create' step first."))
            sys.exit(1)
        manager.upload_documents(bff_path)
        manager.save_env_file()

    elif step == "verify":
        if not manager.stores:
            manager.load_env_stores()
        if not manager.stores:
            print(ColorOutput.error("No stores found. Run 'create' step first."))
            sys.exit(1)
        print(ColorOutput.header("--- VERIFYING STORES ---\n"))
        for domain in DOCUMENT_MAPPING.keys():
            manager.verify_store(domain)

    elif step == "all":
        print(ColorOutput.header("=== GENESIS KNOWLEDGE STORE BATCH UPLOAD ===\n"))

        print(ColorOutput.header("--- CREATING STORES ---\n"))
        for domain in DOCUMENT_MAPPING.keys():
            manager.create_store(domain)
        manager.save_env_file()

        print(ColorOutput.header("\n--- UPLOADING DOCUMENTS ---\n"))
        manager.upload_documents(bff_path)
        manager.save_env_file()

        print(ColorOutput.header("\n--- VERIFYING STORES ---\n"))
        for domain in DOCUMENT_MAPPING.keys():
            manager.verify_store(domain)

        manager.print_summary()


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Batch upload GENESIS knowledge documents to File Search Stores",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/upload_knowledge_stores.py --step all
  python scripts/upload_knowledge_stores.py --api-key sk-xyz --step create
  python scripts/upload_knowledge_stores.py --step upload
  python scripts/upload_knowledge_stores.py --step verify
        """,
    )

    parser.add_argument(
        "--api-key",
        help="Google API key (or use GOOGLE_API_KEY env var)",
        default=None,
    )
    parser.add_argument(
        "--step",
        choices=["create", "upload", "verify", "all"],
        default="all",
        help="Which step to execute (default: all)",
    )
    parser.add_argument(
        "--bff-path",
        help="Path to bff directory (default: auto-detect)",
        default=None,
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List all existing File Search Stores",
    )

    args = parser.parse_args()

    # Determine BFF path
    if args.bff_path:
        bff_path = Path(args.bff_path)
    else:
        bff_path = Path(__file__).parent.parent
    if not bff_path.exists():
        print(ColorOutput.error(f"BFF path not found: {bff_path}"))
        sys.exit(1)

    manager = StoreManager(api_key=args.api_key)

    if args.list:
        print(ColorOutput.header("--- EXISTING FILE SEARCH STORES ---\n"))
        stores = manager.get_all_stores()
        if stores:
            for name, resource_name in stores:
                print(f"  {name}: {resource_name}")
        else:
            print("  No stores found")
        return

    # Run the specified step
    run_step(args.step, manager, bff_path)


if __name__ == "__main__":
    main()
