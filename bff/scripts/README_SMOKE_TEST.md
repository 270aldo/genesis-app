# GENESIS BFF Smoke Test

End-to-end smoke test script for the GENESIS Backend for Frontend (BFF) deployment.

## What it tests

1. **GET /health** — Verifies BFF is running and knowledge stores are initialized
2. **POST /mobile/chat** (NGX Philosophy) — Tests basic chat with Spanish query about coaching philosophy
3. **POST /mobile/chat** (Corrective Exercises) — Tests knowledge retrieval for exercise corrections
4. **POST /mobile/chat** (Cross-Domain BDNF) — Tests cross-domain knowledge integration

## Requirements

```bash
pip install httpx
```

## Usage

### Local Development (localhost:8000)
```bash
cd bff
python scripts/smoke_test.py
```

### Cloud Run Deployment
```bash
python scripts/smoke_test.py --url https://your-project-hash.run.app
```

### With Custom JWT Token
```bash
python scripts/smoke_test.py --url http://localhost:8000 --token YOUR_JWT_TOKEN
```

### Disable Color Output
```bash
NO_COLOR=1 python scripts/smoke_test.py
```

## Output

Each test prints one of:
- ✓ PASS: Test passed
- ✗ FAIL: Test failed with reason
- ℹ Info: Additional context (cache info, response snippets, etc.)

Exit code:
- `0`: All tests passed
- `1`: One or more tests failed

## Example Run

```
============================================================
GENESIS BFF Smoke Test
============================================================
ℹ Target: http://localhost:8000
ℹ Using generated mock JWT token (local testing only)

============================================================
✓ PASS: GET /health
ℹ Knowledge stores status: {"genesis": true, "train": true, ...}
✓ PASS: POST /mobile/chat — NGX Philosophy
ℹ Response snippet: GENESIS es un sistema de entrenamiento...
✓ PASS: POST /mobile/chat — Corrective Exercises (Knowledge Retrieval)
ℹ Response snippet: Los ejercicios correctivos para...
✓ PASS: POST /mobile/chat — Cross-Domain Knowledge (BDNF)
ℹ Response snippet: El BDNF (Factor Neurotrófico Derivado del Cerebro)...

============================================================
Test Summary
============================================================
Total: 4 | Passed: 4 | Failed: 0
```

## Authentication

The script automatically generates a minimal mock JWT token for local testing. For production deployments:

1. Use the `--token` flag with a real Supabase JWT:
   ```bash
   SUPABASE_TOKEN=$(supabase auth get-jwt --token "...")
   python scripts/smoke_test.py --url https://api.com --token $SUPABASE_TOKEN
   ```

2. Or use a test user's session token from the auth table

## CI/CD Integration

Use in GitHub Actions or Cloud Build:

```yaml
- name: Run BFF Smoke Tests
  run: |
    pip install httpx
    python bff/scripts/smoke_test.py --url ${{ env.BFF_URL }}
  env:
    BFF_URL: ${{ steps.deploy.outputs.url }}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Connection refused` | BFF not running or wrong URL — check `--url` flag |
| `HTTP 401` | Missing/invalid JWT — ensure token is valid or use default mock |
| `HTTP 500` | BFF error — check `/health` endpoint and server logs |
| `Empty response text` | Agent didn't generate response — check Gemini config |
| `httpx not installed` | Run `pip install httpx` |

## Notes

- All chat queries are in Spanish (NGX uses Spanish extensively)
- Mock JWT tokens generated locally have hardcoded `sub=test-user-123`
- For production, supply real Supabase tokens via `--token`
- Knowledge store tests assume File Search API is configured (graceful fallback if not)
