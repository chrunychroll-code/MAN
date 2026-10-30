#!/usr/bin/env bash
# ==============================================================================
# CivicPulse AI — 1-Command Google Cloud Run Deployment Script
# ==============================================================================
set -e

SERVICE_NAME="civicpulse-ai"
REGION="us-central1"

echo "=================================================================="
echo " Deploying ${SERVICE_NAME} to Google Cloud Run (Region: ${REGION})"
echo "=================================================================="

# Optional Gemini API key passing if set in local environment
ENV_VARS_FLAG=""
if [ -n "$GEMINI_API_KEY" ]; then
  echo ">>> GEMINI_API_KEY detected in local environment. Injecting into Cloud Run..."
  ENV_VARS_FLAG="--set-env-vars GEMINI_API_KEY=${GEMINI_API_KEY}"
else
  echo ">>> Note: GEMINI_API_KEY not set. Deterministic local AI engine will run live (<10ms)."
fi

# Deploy directly from source via Google Cloud Run source-based buildpacks/Dockerfile
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  $ENV_VARS_FLAG

echo ""
echo "=================================================================="
echo " Deployment Complete! Query service URL via:"
echo "   gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)'"
echo "=================================================================="
