"""Generate thumbnails for all case images in twzk-website.
Target: 600px wide, webp quality 75%, ~30-40KB each (down from 100-200KB).
"""

import os
import glob
from PIL import Image

ASSETS_DIR = r"C:\Users\ASUS\Desktop\twzk-website\assets"
TARGET_WIDTH = 600
QUALITY = 75

extensions = ['*.webp', '*.jpeg', '*.jpg', '*.png']
images = []
for ext in extensions:
    images.extend(glob.glob(os.path.join(ASSETS_DIR, '**', ext), recursive=True))

# Exclude thumbnails and logo
images = [p for p in images if '_thumb' not in p and 'logo' not in p.lower() and '二维码' not in p]

print(f"Found {len(images)} images to process")

total_before = 0
total_after = 0
skipped = 0

for img_path in images:
    dir_name = os.path.dirname(img_path)
    base_name = os.path.splitext(os.path.basename(img_path))[0]
    thumb_path = os.path.join(dir_name, f"{base_name}_thumb.webp")

    before_size = os.path.getsize(img_path)
    total_before += before_size

    # Check if thumbnail exists and is newer than source
    if os.path.exists(thumb_path):
        # Skip if thumb is reasonably sized (<50KB)
        thumb_size = os.path.getsize(thumb_path)
        total_after += thumb_size
        skipped += 1
        if skipped <= 3:
            print(f"  SKIP (exists): {os.path.relpath(img_path, ASSETS_DIR)} [{before_size//1024}KB -> {thumb_size//1024}KB]")
        continue

    try:
        img = Image.open(img_path)
        # Convert RGBA to RGB if needed
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')

        # Resize maintaining aspect ratio
        w, h = img.size
        if w > TARGET_WIDTH:
            ratio = TARGET_WIDTH / w
            new_h = int(h * ratio)
            img = img.resize((TARGET_WIDTH, new_h), Image.LANCZOS)

        img.save(thumb_path, 'WEBP', quality=QUALITY)

        after_size = os.path.getsize(thumb_path)
        total_after += after_size

        if len([p for p in images if not os.path.exists(os.path.join(os.path.dirname(p), f"{os.path.splitext(os.path.basename(p))[0]}_thumb.webp"))]) < 5:
            print(f"  OK: {os.path.relpath(img_path, ASSETS_DIR)} [{before_size//1024}KB -> {after_size//1024}KB]")

    except Exception as e:
        print(f"  ERROR: {os.path.relpath(img_path, ASSETS_DIR)} => {e}")

print(f"\n{'='*50}")
print(f"Total before: {total_before/1024/1024:.1f}MB")
print(f"Total after:  {total_after/1024/1024:.1f}MB")
print(f"Saved:        {(total_before-total_after)/1024/1024:.1f}MB ({(1-total_after/total_before)*100:.0f}%)")
print(f"Processed: {len(images)-skipped} new, {skipped} skipped")
