#!/bin/bash -e

mkdir -p dist/
cp -ruv res/* dist/

shopt -s globstar
for img in dist/**/*.jpg dist/**/*.png; do
   if [ ! -e "$img".webp -o "$img" -nt "$img".webp ]; then
      (cwebp -quiet -q 60 "$img" -o "$img".webp; echo "$img.webp converted") &
   else
      echo skipping "$img".webp
   fi
done

wait
