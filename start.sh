#!/usr/bin/env bash
# ==============================================================================
# PTE Academic Simulator - Local Quick Start Script
# Runs both backend API (port 3001) and Vite frontend (port 5173) concurrently.
# ==============================================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "🚀 Starting PTE Academic Simulator..."

if [ ! -d "node_modules" ]; then
  echo "📦 Installing npm dependencies..."
  npm install
fi

echo "✨ Launching Backend API + Vite UI..."
npm run dev
