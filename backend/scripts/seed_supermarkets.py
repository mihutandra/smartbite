"""
Seed script to populate supermarkets with Romanian data.
Run this from the backend directory with: python scripts/supermarkets.py
Or via Docker: docker compose run --rm main python scripts/supermarkets.py
"""
import sys

sys.path.insert(0, '/base')

from app.core.database import SessionLocal
from app.models.supermarket import Supermarket


def seed_data():
    """Populate supermarkets with Romanian data."""
    session = SessionLocal()
    
    try:
        # Check if data already exists
        existing_supermarkets = session.query(Supermarket).count()
        if existing_supermarkets > 0:
            print(f"✓ Database already contains {existing_supermarkets} supermarket(s). Skipping seed.")
            return
        
        # Romanian supermarkets with realistic locations
        supermarkets = [
            Supermarket(
                name="Carrefour Express",
                address="Calea Victoriei 45, București, 010061",
                latitude=44.4268,
                longitude=26.1025,
                phone_number="+40213100000",
                email="contact@carrefour.ro",
                website="https://carrefour.ro",
                opening_hours={
                    "Monday": "07:00-21:00",
                    "Tuesday": "07:00-21:00",
                    "Wednesday": "07:00-21:00",
                    "Thursday": "07:00-21:00",
                    "Friday": "07:00-22:00",
                    "Saturday": "07:00-22:00",
                    "Sunday": "08:00-20:00"
                },
                is_active=True
            ),
            Supermarket(
                name="Lidl România",
                address="Strada Mihai Vodă 1, București, 030035",
                latitude=44.4155,
                longitude=26.0925,
                phone_number="+40213001000",
                email="info@lidl.ro",
                website="https://lidl.ro",
                opening_hours={
                    "Monday": "06:00-23:00",
                    "Tuesday": "06:00-23:00",
                    "Wednesday": "06:00-23:00",
                    "Thursday": "06:00-23:00",
                    "Friday": "06:00-23:00",
                    "Saturday": "06:00-23:00",
                    "Sunday": "07:00-22:00"
                },
                is_active=True
            ),
            Supermarket(
                name="Kaufland Cluj",
                address="Strada Avram Iancu 100, Cluj-Napoca, 400159",
                latitude=46.7712,
                longitude=23.6236,
                phone_number="+40264300000",
                email="contact@kaufland.ro",
                website="https://kaufland.ro",
                opening_hours={
                    "Monday": "07:00-21:00",
                    "Tuesday": "07:00-21:00",
                    "Wednesday": "07:00-21:00",
                    "Thursday": "07:00-21:00",
                    "Friday": "07:00-22:00",
                    "Saturday": "07:00-22:00",
                    "Sunday": "08:00-20:00"
                },
                is_active=True
            ),
            Supermarket(
                name="Penny Market Timișoara",
                address="Bulevardul Revoluției 5, Timișoara, 300001",
                latitude=45.7489,
                longitude=21.2087,
                phone_number="+40256400000",
                email="contact@penny.ro",
                website="https://penny.ro",
                opening_hours={
                    "Monday": "06:00-22:00",
                    "Tuesday": "06:00-22:00",
                    "Wednesday": "06:00-22:00",
                    "Thursday": "06:00-22:00",
                    "Friday": "06:00-23:00",
                    "Saturday": "06:00-23:00",
                    "Sunday": "07:00-21:00"
                },
                is_active=True
            ),
            Supermarket(
                name="Mega Image Constanța",
                address="Bulevardul Tomis 1, Constanța, 900001",
                latitude=44.1871,
                longitude=28.6593,
                phone_number="+40241800000",
                email="contact@megaimage.ro",
                website="https://megaimage.ro",
                opening_hours={
                    "Monday": "07:00-21:00",
                    "Tuesday": "07:00-21:00",
                    "Wednesday": "07:00-21:00",
                    "Thursday": "07:00-21:00",
                    "Friday": "07:00-22:00",
                    "Saturday": "07:00-22:00",
                    "Sunday": "08:00-20:00"
                },
                is_active=True
            ),
        ]
        
        # Add all supermarkets
        for supermarket in supermarkets:
            session.add(supermarket)
        
        session.flush()  # Ensure supermarkets have IDs
        session.commit()
        
        print("✓ Data seeded successfully!")
        print(f"  - {len(supermarkets)} supermarkets added")
        
    except Exception as e:
        session.rollback()
        print(f"✗ Error seeding data: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed_data()
