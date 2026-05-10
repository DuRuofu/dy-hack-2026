#!/bin/bash
# 清除所有 demo 运行时产生的临时输出文件（视频、音频、帧图片等）
# 用法: bash scripts/clean.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOTAL=0

for dir in "$PROJECT_ROOT"/demos/*/output; do
  if [ -d "$dir" ]; then
    SIZE=$(du -sh "$dir" 2>/dev/null | cut -f1)
    COUNT=$(find "$dir" -type f | wc -l | tr -d ' ')
    DEMO=$(basename "$(dirname "$dir")")
    if [ "$COUNT" -gt 0 ]; then
      echo "  $DEMO: $SIZE ($COUNT 个文件)"
      rm -rf "$dir"/*
      TOTAL=$((TOTAL + 1))
    fi
  fi
done

if [ "$TOTAL" -eq 0 ]; then
  echo "没有需要清理的临时文件。"
else
  echo "已清理 $TOTAL 个 demo 的输出目录。"
fi
