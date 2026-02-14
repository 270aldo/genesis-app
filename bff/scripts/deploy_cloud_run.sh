#!/bin/bash
# Deploy GENESIS BFF to Google Cloud Run
# Usage: ./deploy_cloud_run.sh [PROJECT_ID] [REGION]

set -e

# Configuration
SERVICE_NAME="genesis-bff"
REGION="${2:-us-central1}"
PROJECT_ID="${1:-$(gcloud config get-value project)}"

if [ -z "$PROJECT_ID" ]; then
  echo "Error: PROJECT_ID not provided and gcloud config not set"
  echo "Usage: ./deploy_cloud_run.sh PROJECT_ID [REGION]"
  exit 1
fi

# Determine image registry (Artifact Registry is recommended)
IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/genesis/${SERVICE_NAME}:latest"

echo "=========================================="
echo "GENESIS BFF Cloud Run Deployment"
echo "=========================================="
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"
echo "Image: $IMAGE_TAG"
echo ""

# Check if .env.cloud-run exists
if [ ! -f ".env.cloud-run" ]; then
  echo "Warning: .env.cloud-run not found"
  echo "Deployment will use Cloud Run secrets/environment variables"
  echo "Make sure to set the following via Cloud Run console or Secret Manager:"
  echo "  - SUPABASE_URL"
  echo "  - SUPABASE_SERVICE_KEY"
  echo "  - DATABASE_URL"
  echo "  - GOOGLE_API_KEY"
  echo "  - JWT_SECRET"
  echo ""
  ENV_VARS=""
else
  echo "Loading environment variables from .env.cloud-run"
  # Parse .env.cloud-run and filter out secrets (marked with _SECRET)
  ENV_VARS=$(grep -v '^#' .env.cloud-run | grep -v '^$' | grep -v '_SECRET' | tr '\n' ',' | sed 's/,$//')
  echo "Non-secret env vars: $ENV_VARS"
  echo ""
fi

# Step 1: Build Docker image
echo "Step 1: Building Docker image..."
cd "$(dirname "$0")/.."
docker build -t $IMAGE_TAG .

# Step 2: Push to Artifact Registry
echo ""
echo "Step 2: Pushing to Artifact Registry..."
docker push $IMAGE_TAG

# Step 3: Deploy to Cloud Run
echo ""
echo "Step 3: Deploying to Cloud Run..."

# Build deploy command with env vars if available
DEPLOY_CMD="gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_TAG \
  --region $REGION \
  --platform managed \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --min-instances 0 \
  --max-instances 5 \
  --allow-unauthenticated \
  --port 8000"

# Add environment variables if they exist
if [ -n "$ENV_VARS" ]; then
  DEPLOY_CMD="$DEPLOY_CMD --set-env-vars=$ENV_VARS"
fi

# Execute deployment
eval "$DEPLOY_CMD"

# Step 4: Get the deployed service URL
echo ""
echo "Step 4: Retrieving service URL..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --format 'value(status.url)')

echo ""
echo "=========================================="
echo "Deployment Successful!"
echo "=========================================="
echo "Service URL: $SERVICE_URL"
echo ""

# Step 5: Run health check
echo "Step 5: Running health check (waiting 10 seconds for startup)..."
sleep 10

HEALTH_CHECK=$(curl -s "$SERVICE_URL/health" | grep -o '"status":"healthy"' || echo "")

if [ -n "$HEALTH_CHECK" ]; then
  echo "✓ Health check passed!"
else
  echo "⚠ Health check may have failed. Check logs:"
  echo "  gcloud logs read --limit=50 --service=cloud-run"
fi

echo ""
echo "Next steps:"
echo "1. Update mobile app GENESIS_BFF_URL to: $SERVICE_URL"
echo "2. Verify secrets are set in Cloud Run console:"
echo "   - SUPABASE_URL, SUPABASE_SERVICE_KEY, DATABASE_URL"
echo "   - GOOGLE_API_KEY, JWT_SECRET"
echo "3. Monitor logs: gcloud logs read --service=$SERVICE_NAME --limit=100"
echo ""
