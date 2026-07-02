#!/bin/bash
set -e

echo "==> Building Medusa (backend + admin)..."
pnpm build

echo "==> Starting Medusa server..."
exec pnpm start
