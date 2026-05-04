#!/usr/bin/env bash
set -euo pipefail

SRC="/Users/jimlin/Downloads/0502 TZF watermark 1"
OUT="/Users/jimlin/Downloads/跳舞影片網站/public/previews"
FFMPEG="/usr/local/bin/ffmpeg"
MANIFEST="$OUT/manifest.json"

mkdir -p "$OUT"

count=0
total=$(find "$SRC" -name "*.m4v" | wc -l | tr -d ' ')
echo "Found $total videos, cutting 10-second previews..."

echo "[" > "$MANIFEST"
first=1

while IFS= read -r -d '' src_file; do
  base=$(basename "$src_file" .m4v)
  out_mp4="$OUT/${base}.mp4"
  thumb_jpg="$OUT/${base}.jpg"

  # Cut 10-second preview with audio
  "$FFMPEG" -nostdin -y -i "$src_file" -t 10 -c:v libx264 -preset fast -crf 28 \
    -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
    -c:a aac -b:a 96k -movflags +faststart \
    "$out_mp4" -loglevel error

  # Thumbnail at 2 seconds
  "$FFMPEG" -nostdin -y -i "$src_file" -ss 2 -vframes 1 -q:v 3 \
    -vf "scale=400:-1" "$thumb_jpg" -loglevel error

  count=$((count + 1))
  echo "[$count/$total] $base"

  filename=$(basename "$out_mp4")
  thumbname=$(basename "$thumb_jpg")

  if [ $first -eq 0 ]; then echo "," >> "$MANIFEST"; fi
  first=0
  cat >> "$MANIFEST" <<JSON
  {
    "name": "$base.m4v",
    "preview": "public/previews/$filename",
    "thumb": "public/previews/$thumbname"
  }
JSON

done < <(find "$SRC" -name "*.m4v" -print0 | sort -z)

echo "]" >> "$MANIFEST"
echo "Done. $count previews saved to $OUT"
