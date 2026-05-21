"""
Seed script to populate supermarkets with Romanian data.
Run this from the backend directory with: python scripts/seed_supermarkets.py
Or via Docker: docker compose run --rm main python scripts/seed_supermarkets.py
"""
import sys

sys.path.insert(0, '/base')

from app.core.database import SessionLocal
from app.models.supermarket import Supermarket


def seed_data():
    """Populate supermarkets with Romanian data."""
    session = SessionLocal()

    try:
        # Romanian supermarkets with realistic locations
        supermarkets_data = [
            dict(
                name="Carrefour Express",
                address="Calea Victoriei 45, București, 010061",
                latitude=44.4268,
                longitude=26.1025,
                phone_number="+40213100000",
                email="contact@carrefour.ro",
                website="https://carrefour.ro",
                rating=4.2,
                logo_url="https://images.seeklogo.com/logo-png/31/2/carrefour-logo-png_seeklogo-318190.png",
                opening_hours={
                    "Monday": "07:00-21:00",
                    "Tuesday": "07:00-21:00",
                    "Wednesday": "07:00-21:00",
                    "Thursday": "07:00-21:00",
                    "Friday": "07:00-22:00",
                    "Saturday": "07:00-22:00",
                    "Sunday": "08:00-20:00",
                },
                is_active=True,
            ),
            dict(
                name="Lidl România",
                address="Strada Mihai Vodă 1, București, 030035",
                latitude=44.4155,
                longitude=26.0925,
                phone_number="+40213001000",
                email="info@lidl.ro",
                website="https://lidl.ro",
                rating=4.5,
                logo_url="https://e7.pngegg.com/pngimages/727/982/png-clipart-lidl-logo-ireland-logo-lidl-symbols-lidl-logo-miscellaneous-cdr-thumbnail.png",
                opening_hours={
                    "Monday": "06:00-23:00",
                    "Tuesday": "06:00-23:00",
                    "Wednesday": "06:00-23:00",
                    "Thursday": "06:00-23:00",
                    "Friday": "06:00-23:00",
                    "Saturday": "06:00-23:00",
                    "Sunday": "07:00-22:00",
                },
                is_active=True,
            ),
            dict(
                name="Kaufland Cluj",
                address="Strada Avram Iancu 100, Cluj-Napoca, 400159",
                latitude=46.7712,
                longitude=23.6236,
                phone_number="+40264300000",
                email="contact@kaufland.ro",
                website="https://kaufland.ro",
                rating=4.3,
                logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Kaufland_201x_logo.svg/3840px-Kaufland_201x_logo.svg.png",
                opening_hours={
                    "Monday": "07:00-21:00",
                    "Tuesday": "07:00-21:00",
                    "Wednesday": "07:00-21:00",
                    "Thursday": "07:00-21:00",
                    "Friday": "07:00-22:00",
                    "Saturday": "07:00-22:00",
                    "Sunday": "08:00-20:00",
                },
                is_active=True,
            ),
            dict(
                name="Penny Market Timișoara",
                address="Bulevardul Revoluției 5, Timișoara, 300001",
                latitude=45.7489,
                longitude=21.2087,
                phone_number="+40256400000",
                email="contact@penny.ro",
                website="https://penny.ro",
                rating=3.8,
                logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Penny-Logo.svg/3840px-Penny-Logo.svg.png",
                opening_hours={
                    "Monday": "06:00-22:00",
                    "Tuesday": "06:00-22:00",
                    "Wednesday": "06:00-22:00",
                    "Thursday": "06:00-22:00",
                    "Friday": "06:00-23:00",
                    "Saturday": "06:00-23:00",
                    "Sunday": "07:00-21:00",
                },
                is_active=True,
            ),
            dict(
                name="Mega Image Constanța",
                address="Bulevardul Tomis 1, Constanța, 900001",
                latitude=44.1871,
                longitude=28.6593,
                phone_number="+40241800000",
                email="contact@megaimage.ro",
                website="https://megaimage.ro",
                rating=4.0,
                logo_url="https://upload.wikimedia.org/wikipedia/ro/thumb/1/1d/Logo_Mega_Image.svg/1280px-Logo_Mega_Image.svg.png",
                opening_hours={
                    "Monday": "07:00-21:00",
                    "Tuesday": "07:00-21:00",
                    "Wednesday": "07:00-21:00",
                    "Thursday": "07:00-21:00",
                    "Friday": "07:00-22:00",
                    "Saturday": "07:00-22:00",
                    "Sunday": "08:00-20:00",
                },
                is_active=True,
            ),
        ]

        names = [item["name"] for item in supermarkets_data]
        existing = (
            session.query(Supermarket)
            .filter(Supermarket.name.in_(names))
            .all()
        )
        existing_by_name = {supermarket.name: supermarket for supermarket in existing}

        updated_count = 0
        added_count = 0

        for supermarket_data in supermarkets_data:
            existing_supermarket = existing_by_name.get(supermarket_data["name"])
            if existing_supermarket:
                existing_supermarket.logo_url = supermarket_data["logo_url"]
                existing_supermarket.rating = supermarket_data["rating"]
                updated_count += 1
            else:
                session.add(Supermarket(**supermarket_data))
                added_count += 1

        session.commit()

        print("✓ Supermarket seed/update finished successfully!")
        print(f"  - {updated_count} supermarket logo(s) updated")
        print(f"  - {added_count} supermarket(s) added")

    except Exception as e:
        session.rollback()
        print(f"✗ Error seeding data: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed_data()
