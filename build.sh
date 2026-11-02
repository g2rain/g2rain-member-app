#!/usr/bin/env bash
set -euo pipefail

# Build the g2rain-member-app container image using the repository Dockerfile.
#
# Usage:
#   ./build.sh
#   ./build.sh --image ghcr.io/g2rain/g2rain-member-app --tag 1.0.0 --build-mode production

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

IMAGE="ghcr.io/g2rain/g2rain-member-app"
TAG="$(node -p "require('./package.json').version")"
BUILD_MODE="production"
IMAGE_VERSION="$TAG"
VCS_REF="$(git rev-parse HEAD 2>/dev/null || printf '%s' unknown)"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --image)
      IMAGE="${2:-}"
      shift 2
      ;;
    --tag)
      TAG="${2:-}"
      shift 2
      ;;
    --build-mode|--mode|--vite-build-mode)
      BUILD_MODE="${2:-}"
      shift 2
      ;;
    --image-version)
      IMAGE_VERSION="${2:-}"
      shift 2
      ;;
    --vcs-ref)
      VCS_REF="${2:-}"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [--image <name>] [--tag <tag>] [--build-mode <mode>] [--image-version <version>] [--vcs-ref <commit>]"
      exit 0
      ;;
    *)
      echo "Unknown argument: $1"
      echo "Usage: $0 [--image <name>] [--tag <tag>] [--build-mode <mode>] [--image-version <version>] [--vcs-ref <commit>]"
      exit 1
      ;;
  esac
done

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: docker is not installed or not in PATH."
  exit 1
fi

echo "=== Building Docker image ==="
echo "Context: $APP_DIR"
echo "Image:   $IMAGE"
echo "Tag:     $TAG"
echo "Mode:    $BUILD_MODE"
echo "Version: $IMAGE_VERSION"
echo "Revision: $VCS_REF"

export DOCKER_BUILDKIT=1
docker build \
  --build-arg "VITE_BUILD_MODE=$BUILD_MODE" \
  --build-arg "IMAGE_VERSION=$IMAGE_VERSION" \
  --build-arg "VCS_REF=$VCS_REF" \
  -t "$IMAGE:$TAG" \
  .

echo "=== Build completed: $IMAGE:$TAG ==="
