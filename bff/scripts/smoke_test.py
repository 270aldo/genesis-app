#!/usr/bin/env python3
"""
Smoke test script for GENESIS BFF deployment.
Tests core endpoints: health, knowledge retrieval, and cross-domain knowledge.

Usage:
    python smoke_test.py                          # Test localhost:8000
    python smoke_test.py --url https://api.example.com
    python smoke_test.py --url http://api.com --token YOUR_JWT_TOKEN
"""

import argparse
import sys
import json
from typing import Optional

try:
    import httpx
except ImportError:
    print("Error: httpx not installed. Run: pip install httpx")
    sys.exit(1)


# ANSI color codes for output
class Colors:
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    RESET = "\033[0m"

    @staticmethod
    def supports_color() -> bool:
        """Check if terminal supports color output."""
        import os
        return os.getenv("NO_COLOR") is None


def colorize(text: str, color: str) -> str:
    """Apply color to text if supported."""
    if not Colors.supports_color():
        return text
    return f"{color}{text}{Colors.RESET}"


def print_header(text: str) -> None:
    """Print a section header."""
    print(f"\n{colorize('=' * 60, Colors.BLUE)}")
    print(colorize(text, Colors.BLUE))
    print(colorize('=' * 60, Colors.BLUE))


def print_pass(text: str) -> None:
    """Print a passing test."""
    print(colorize(f"✓ PASS: {text}", Colors.GREEN))


def print_fail(text: str) -> None:
    """Print a failing test."""
    print(colorize(f"✗ FAIL: {text}", Colors.RED))


def print_info(text: str) -> None:
    """Print informational text."""
    print(colorize(f"ℹ {text}", Colors.YELLOW))


class SmokeTest:
    """End-to-end smoke test for GENESIS BFF."""

    def __init__(self, url: str, token: Optional[str] = None):
        self.url = url.rstrip("/")
        self.token = token
        self.client = httpx.Client(timeout=15.0)
        self.results = []

    def _get_headers(self) -> dict:
        """Build request headers with JWT if provided."""
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def _make_mock_token(self) -> str:
        """
        Generate a minimal mock JWT for testing (if no token provided).
        Format: header.payload.signature (all base64).
        This is ONLY for local testing — production must use real Supabase tokens.
        """
        import base64
        import json

        header = base64.b64encode(json.dumps({"alg": "HS256"}).encode()).decode().rstrip("=")
        payload = base64.b64encode(
            json.dumps(
                {
                    "sub": "test-user-123",
                    "email": "test@genesis.local",
                    "aud": "authenticated",
                    "iat": 1700000000,
                    "exp": 9999999999,
                }
            ).encode()
        ).decode().rstrip("=")
        signature = base64.b64encode(b"test-signature").decode().rstrip("=")
        return f"{header}.{payload}.{signature}"

    def run(self) -> int:
        """Execute all smoke tests. Returns 0 if all pass, 1 if any fail."""
        print_header("GENESIS BFF Smoke Test")
        print_info(f"Target: {self.url}")

        if not self.token:
            self.token = self._make_mock_token()
            print_info("Using generated mock JWT token (local testing only)")

        try:
            self.test_health()
            self.test_ngx_philosophy()
            self.test_corrective_exercises()
            self.test_cross_domain_knowledge()
        except Exception as e:
            print_fail(f"Test execution error: {str(e)}")
            return 1
        finally:
            self.client.close()

        print_header("Test Summary")
        passed = sum(1 for r in self.results if r["status"] == "PASS")
        failed = sum(1 for r in self.results if r["status"] == "FAIL")
        print(f"Total: {len(self.results)} | {colorize(f'Passed: {passed}', Colors.GREEN)} | {colorize(f'Failed: {failed}', Colors.RED)}")

        return 0 if failed == 0 else 1

    def test_health(self) -> None:
        """Test 1: GET /health — verify status and knowledge stores."""
        test_name = "GET /health"
        try:
            response = self.client.get(f"{self.url}/health")
            if response.status_code != 200:
                print_fail(f"{test_name} — status {response.status_code}")
                self.results.append({"test": test_name, "status": "FAIL", "reason": f"HTTP {response.status_code}"})
                return

            data = response.json()

            # Verify response structure
            if "status" not in data:
                print_fail(f"{test_name} — missing 'status' field")
                self.results.append({"test": test_name, "status": "FAIL", "reason": "missing status"})
                return

            if data.get("status") != "ok":
                print_fail(f"{test_name} — status not 'ok', got: {data.get('status')}")
                self.results.append({"test": test_name, "status": "FAIL", "reason": f"status={data.get('status')}"})
                return

            # Check knowledge stores (all should be True or at least attempted)
            stores = data.get("knowledge_stores", {})
            print_info(f"Knowledge stores status: {json.dumps(stores, indent=2)}")

            print_pass(test_name)
            self.results.append({"test": test_name, "status": "PASS"})

        except Exception as e:
            print_fail(f"{test_name} — {str(e)}")
            self.results.append({"test": test_name, "status": "FAIL", "reason": str(e)})

    def test_ngx_philosophy(self) -> None:
        """Test 2: POST /mobile/chat — retrieve NGX philosophy."""
        test_name = "POST /mobile/chat — NGX Philosophy"
        try:
            payload = {
                "message": "¿cuál es la filosofía de NGX?",
                "agent_id": "genesis",
                "conversation_id": None,
            }
            response = self.client.post(
                f"{self.url}/mobile/chat",
                json=payload,
                headers=self._get_headers(),
            )

            if response.status_code != 200:
                print_fail(f"{test_name} — status {response.status_code}")
                self.results.append({"test": test_name, "status": "FAIL", "reason": f"HTTP {response.status_code}"})
                return

            data = response.json()

            # Verify response has text
            if "text" not in data or not data["text"]:
                print_fail(f"{test_name} — missing or empty 'text' field")
                self.results.append({"test": test_name, "status": "FAIL", "reason": "empty response"})
                return

            response_text = data["text"][:100]  # Print first 100 chars
            print_info(f"Response snippet: {response_text}...")

            print_pass(test_name)
            self.results.append({"test": test_name, "status": "PASS"})

        except Exception as e:
            print_fail(f"{test_name} — {str(e)}")
            self.results.append({"test": test_name, "status": "FAIL", "reason": str(e)})

    def test_corrective_exercises(self) -> None:
        """Test 3: POST /mobile/chat — knowledge retrieval for corrective exercises."""
        test_name = "POST /mobile/chat — Corrective Exercises (Knowledge Retrieval)"
        try:
            payload = {
                "message": "¿qué ejercicios correctivos necesito para Upper Crossed Syndrome?",
                "agent_id": "genesis",
                "conversation_id": None,
            }
            response = self.client.post(
                f"{self.url}/mobile/chat",
                json=payload,
                headers=self._get_headers(),
            )

            if response.status_code != 200:
                print_fail(f"{test_name} — status {response.status_code}")
                self.results.append({"test": test_name, "status": "FAIL", "reason": f"HTTP {response.status_code}"})
                return

            data = response.json()

            # Verify response has text
            if "text" not in data or not data["text"]:
                print_fail(f"{test_name} — missing or empty 'text' field")
                self.results.append({"test": test_name, "status": "FAIL", "reason": "empty response"})
                return

            response_text = data["text"][:100]
            print_info(f"Response snippet: {response_text}...")

            # Check if knowledge was used (optional: look for cache hit indicator)
            if "cache_info" in data:
                print_info(f"Cache info: {data['cache_info']}")

            print_pass(test_name)
            self.results.append({"test": test_name, "status": "PASS"})

        except Exception as e:
            print_fail(f"{test_name} — {str(e)}")
            self.results.append({"test": test_name, "status": "FAIL", "reason": str(e)})

    def test_cross_domain_knowledge(self) -> None:
        """Test 4: POST /mobile/chat — cross-domain knowledge (BDNF + Exercise)."""
        test_name = "POST /mobile/chat — Cross-Domain Knowledge (BDNF)"
        try:
            payload = {
                "message": "¿cómo funciona el BDNF con el ejercicio?",
                "agent_id": "genesis",
                "conversation_id": None,
            }
            response = self.client.post(
                f"{self.url}/mobile/chat",
                json=payload,
                headers=self._get_headers(),
            )

            if response.status_code != 200:
                print_fail(f"{test_name} — status {response.status_code}")
                self.results.append({"test": test_name, "status": "FAIL", "reason": f"HTTP {response.status_code}"})
                return

            data = response.json()

            # Verify response has text
            if "text" not in data or not data["text"]:
                print_fail(f"{test_name} — missing or empty 'text' field")
                self.results.append({"test": test_name, "status": "FAIL", "reason": "empty response"})
                return

            response_text = data["text"][:100]
            print_info(f"Response snippet: {response_text}...")

            print_pass(test_name)
            self.results.append({"test": test_name, "status": "PASS"})

        except Exception as e:
            print_fail(f"{test_name} — {str(e)}")
            self.results.append({"test": test_name, "status": "FAIL", "reason": str(e)})


def main():
    parser = argparse.ArgumentParser(
        description="Smoke test for GENESIS BFF deployment",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python smoke_test.py                              # Test http://localhost:8000
  python smoke_test.py --url https://api.example.com
  python smoke_test.py --url http://api.com --token YOUR_JWT_TOKEN
        """,
    )
    parser.add_argument(
        "--url",
        default="http://localhost:8000",
        help="BFF URL (default: http://localhost:8000)",
    )
    parser.add_argument(
        "--token",
        default=None,
        help="JWT token for authentication (if not provided, generates mock token for local testing)",
    )

    args = parser.parse_args()

    tester = SmokeTest(args.url, args.token)
    exit_code = tester.run()
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
