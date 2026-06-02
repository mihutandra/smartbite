import json
import os
import re
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[1]
ROOT_DIR = BACKEND_DIR.parent

# Prefer backend/.env for local backend scripts, then fallback to repo root .env.
load_dotenv(BACKEND_DIR / ".env")
load_dotenv(ROOT_DIR / ".env")

SERPAPI_KEY = os.getenv("SERPAPI_KEY")

INPUT_FILE = BACKEND_DIR / "products_seed.json"
OUTPUT_FILE = BACKEND_DIR / "products_seed_with_images.json"
IMAGE_DIR = ROOT_DIR / "frontend" / "public" / "products"
PUBLIC_PREFIX = "/products"

IMAGE_DIR.mkdir(parents=True, exist_ok=True)


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[ăâ]", "a", text)
    text = re.sub(r"[î]", "i", text)
    text = re.sub(r"[șş]", "s", text)
    text = re.sub(r"[țţ]", "t", text)
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def get_image_url(product):
    query = f'{product["name"]} {product["brand"]} produs aliment Romania'

    params = {
        "engine": "google_images",
        "q": query,
        "api_key": SERPAPI_KEY,
        "hl": "ro",
        "gl": "ro",
    }

    response = requests.get("https://serpapi.com/search.json", params=params, timeout=20)
    response.raise_for_status()

    data = response.json()
    results = data.get("images_results", [])

    for result in results:
        url = result.get("original") or result.get("thumbnail")
        if url:
            return url

    return None


def download_image(url: str, filename: str):
    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    response = requests.get(url, headers=headers, timeout=20)
    response.raise_for_status()

    content_type = response.headers.get("Content-Type", "")
    if "image" not in content_type:
        return None

    extension = ".jpg"
    if "png" in content_type:
        extension = ".png"
    elif "webp" in content_type:
        extension = ".webp"

    file_path = IMAGE_DIR / f"{filename}{extension}"

    with open(file_path, "wb") as f:
        f.write(response.content)

    return f"{PUBLIC_PREFIX}/{filename}{extension}"


def main():
    if not SERPAPI_KEY:
        raise RuntimeError("Lipsește SERPAPI_KEY din .env")

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        products = json.load(f)

    for index, product in enumerate(products, start=1):
        print(f"[{index}/{len(products)}] {product['name']} - {product['brand']}")

        filename = slugify(f"{product['name']}-{product['brand']}")

        try:
            image_url = get_image_url(product)

            if not image_url:
                print("  Nu am găsit imagine.")
                product["image_url"] = None
                continue

            local_url = download_image(image_url, filename)
            product["image_url"] = local_url

            print(f"  OK: {local_url}")

            time.sleep(1)

        except Exception as e:
            print(f"  Eroare: {e}")
            product["image_url"] = None

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    print(f"\nGata. Fișier generat: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
