"""
Seed script to populate users with test data.
Run this from the backend directory with: python scripts/seed_users.py
Or via Docker: docker compose run --rm main python scripts/seed_users.py
"""
import sys

sys.path.insert(0, '/base')

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.enums import UserRole
from app.models.user import User


def seed_data():
    """Populate users with test data."""
    session = SessionLocal()

    try:
        # Check if data already exists
        existing_users = session.query(User).count()
        if existing_users > 0:
            print(f"✓ Database already contains {existing_users} user(s). Skipping seed.")
            return

        users = [
            User(
                name="Super Admin",
                email="admin@smartbite.ro",
                password_hash=hash_password("Admin1234!"),
                role=UserRole.ADMIN,
                phone="0700000001",
                location="București, România",
                latitude=44.4268,
                longitude=26.1025,
            ),
            User(
                name="Manager Cluj",
                email="manager@smartbite.ro",
                password_hash=hash_password("Manager1234!"),
                role=UserRole.MANAGER,
                phone="0700000002",
                location="Cluj-Napoca, România",
                latitude=46.7712,
                longitude=23.6236,
            ),
            User(
                name="Andrei Popescu",
                email="andrei.popescu@gmail.com",
                password_hash=hash_password("User1234!"),
                role=UserRole.USER,
                phone="0722111111",
                location="Timișoara, România",
                latitude=45.7489,
                longitude=21.2087,
            ),
            User(
                name="Maria Ionescu",
                email="maria.ionescu@gmail.com",
                password_hash=hash_password("User1234!"),
                role=UserRole.USER,
                phone="0733222222",
                location="Iași, România",
                latitude=47.1585,
                longitude=27.6014,
            ),
            User(
                name="Gheorghe Dumitrescu",
                email="gheorghe.dumitrescu@yahoo.com",
                password_hash=hash_password("User1234!"),
                role=UserRole.USER,
                phone="0744333333",
                location="Brașov, România",
                latitude=45.6427,
                longitude=25.5887,
            ),
        ]

        for user in users:
            session.add(user)

        session.flush()
        session.commit()

        print("✓ Data seeded successfully!")
        print(f"  - {len(users)} users added")
        print()
        print("  Test credentials:")
        print("  ADMIN   → admin@smartbite.ro     / Admin1234!")
        print("  MANAGER → manager@smartbite.ro   / Manager1234!")
        print("  USER    → andrei.popescu@gmail.com / User1234!")

    except Exception as e:
        session.rollback()
        print(f"✗ Error seeding data: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed_data()