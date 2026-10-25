#!/bin/sh
# Renders video.html to the 9:16 and 4:5 MP4s with the synthesized pop track.
# usage: sh render.sh <fontsrc dir> <scratch dir>
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
FONTS=$1; WORK=$2
FF=${FF:-/usr/local/lib/python3.13/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2}
PW=${PW:-/usr/local/lib/node_modules/playwright}
NW=${NW:-3}
python3 "$HERE/build.py" "$FONTS"
rm -rf "$WORK/frames"; mkdir -p "$WORK/frames"
i=0; while [ $i -lt "$NW" ]; do
  node "$HERE/../founders/short/render-range.js" "$PW" "$HERE/video.html" "$WORK/frames" 30 $i "$NW" &
  i=$((i + 1))
done
wait
cp "$WORK/frames/beats.json" "$HERE/cues.json"
python3 "$HERE/../founders/build/audio.py" "$HERE/cues.json" "$WORK/audio.wav"
AUD="loudnorm=I=-18:TP=-2:LRA=11"
"$FF" -y -loglevel error -framerate 30 -i "$WORK/frames/f%05d.png" -i "$WORK/audio.wav" \
  -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -af "$AUD" -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart \
  "$HERE/thanksgiving-9x16.mp4"
"$FF" -y -loglevel error -framerate 30 -i "$WORK/frames/f%05d.png" -i "$WORK/audio.wav" \
  -vf "crop=1080:1350:0:285" -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -af "$AUD" -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart \
  "$HERE/thanksgiving-4x5.mp4"
"$FF" -y -loglevel error -i "$WORK/frames/f00000.png" -vf "crop=1080:1350:0:285" "$HERE/thanksgiving-cover.png"
ls -la "$HERE"/*.mp4
