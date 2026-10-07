#!/usr/bin/env python3
"""
Image processing script: Process images from portfolio folder to xingxueji website
- Convert to WebP format
- Keep good quality (quality=85)
- Max size 1920px
- Auto categorize
"""

import os
import re
import shutil
from pathlib import Path
from PIL import Image

# Config
PORTFOLIO_DIR = Path('../作品集')
PUBLIC_IMAGES_DIR = Path('public/images')
IMAGES_JS_PATH = Path('src/data/images.js')
MAX_SIZE = 1920
WEBP_QUALITY = 85

# Existing images (skip these)
EXISTING_IMAGES = {
    'OIP-C.jpg', 'OIP-C.webp', '20200324171249_spioe.jpg', '20200324171249_spioe.webp'
}

# Game keywords
GAME_KEYWORDS = [
    'arknights', 'rhodes island', 'kal\'tsit', 'amya', 'amiya',
    'hypergryph', 'p0.png', 'p0.jpg',
]

# Anime keywords
ANIME_KEYWORDS = [
    're:zero', 'rem', 'chunibyou',
    'demon slayer', 'kimetsu', 'zenitsu',
    'sword art online', 'asuna',
    'naruto', 'bleach',
]

def guess_category(filename):
    """Guess category from filename"""
    name = filename.lower()

    for kw in GAME_KEYWORDS:
        if kw in name:
            return '游戏'

    for kw in ANIME_KEYWORDS:
        if kw in name:
            return '动漫'

    if re.match(r'\d{8}_\d{6}_\d+', filename):
        return '游戏'

    return '动漫'

def guess_title(filename):
    """Guess title from filename"""
    name = Path(filename).stem

    name = re.sub(r'[-_]\d+$', '', name)
    name = re.sub(r'^\d{8}_\d{6}_', '', name)
    name = re.sub(r'^Image_\d+', '', name)

    chinese_match = re.search(r'[\u4e00-\u9fa5]+', name)
    if chinese_match:
        return chinese_match.group(0)

    return name.replace('_', ' ').replace('-', ' ').strip()[:20]

def process_image(src_path, dst_path, max_size=MAX_SIZE, quality=WEBP_QUALITY):
    """Process single image"""
    try:
        with Image.open(src_path) as img:
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if 'A' in img.mode else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')

            width, height = img.size
            if width > max_size or height > max_size:
                ratio = min(max_size / width, max_size / height)
                new_size = (int(width * ratio), int(height * ratio))
                img = img.resize(new_size, Image.LANCZOS)

            img.save(dst_path, 'WEBP', quality=quality, optimize=True)
            return True
    except Exception as e:
        print(f"  FAIL: {e}")
        return False

def main():
    PUBLIC_IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    image_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
    files = [f for f in PORTFOLIO_DIR.iterdir()
             if f.is_file() and f.suffix.lower() in image_extensions
             and f.name not in EXISTING_IMAGES]

    if not files:
        print("No new images found")
        return

    print(f"\nFound {len(files)} new images, processing...\n")

    images_content = IMAGES_JS_PATH.read_text(encoding='utf-8')
    id_matches = re.findall(r'id:\s*(\d+)', images_content)
    max_id = max(int(x) for x in id_matches) if id_matches else 0

    new_entries = []

    for i, src_file in enumerate(files, 1):
        print(f"[{i}/{len(files)}] Processing {src_file.name}...")

        dst_name = src_file.stem + '.webp'
        dst_path = PUBLIC_IMAGES_DIR / dst_name

        if process_image(src_file, dst_path):
            file_size = dst_path.stat().st_size
            size_kb = file_size / 1024

            category = guess_category(src_file.name)
            title = guess_title(src_file.name)

            new_entries.append({
                'id': max_id + len(new_entries) + 1,
                'src': f'./images/{dst_name}',
                'category': category,
                'title': title,
                'size_kb': size_kb
            })

            print(f"  OK {dst_name} ({size_kb:.0f}KB) - {category} - {title}")
        else:
            print(f"  SKIP {src_file.name}")

    if not new_entries:
        print("\nNo images processed successfully")
        return

    new_images_code = ',\n'.join([
        f"  {{\n    id: {img['id']},\n    src: '{img['src']}',\n    category: '{img['category']}',\n    title: '{img['title']}',\n  }}"
        for img in new_entries
    ])

    updated_content = images_content.replace(
        '\n]',
        ',\n' + new_images_code + '\n]'
    )
    IMAGES_JS_PATH.write_text(updated_content, encoding='utf-8')

    game_count = sum(1 for img in new_entries if img['category'] == '游戏')
    anime_count = sum(1 for img in new_entries if img['category'] == '动漫')
    other_count = len(new_entries) - game_count - anime_count

    print(f"\nDONE: Processed {len(new_entries)} images")
    print(f"   Game: {game_count}")
    print(f"   Anime: {anime_count}")
    print(f"   Other: {other_count}")
    print(f"Updated: {IMAGES_JS_PATH}")
    print(f"\nNext steps:")
    print(f"  cd xingxueji")
    print(f"  npm run build")
    print(f"  git add .")
    print(f"  git commit -m \"Add {len(new_entries)} images\"")
    print(f"  git push")

if __name__ == '__main__':
    main()
