"""
Seed script to populate products with Romanian data.
Run this from the backend directory with: python scripts/seed_products.py
Or via Docker: docker compose run --rm main python scripts/seed_products.py
"""
import sys

sys.path.insert(0, '/base')

from app.core.database import SessionLocal
from app.models.product import Product


def seed_data():
    """Populate products with Romanian data."""
    session = SessionLocal()
    
    try:
        # Romanian products
        products = [
            Product(
                name="Pâine neagră tradițională",
                description="Pâine neagră proaspătă, coapte zilnic, recunoascut pentru aroma și textura clasică",
                brand="Păunul Fericit",
                image_url="https://images.example.com/paine-neagra.jpg",
                is_active=True
            ),
            Product(
                name="Brânză de burduf",
                description="Brânză tradițională de oaie, cu sare și condimente, produsă în Carpați",
                brand="Brânzele Moldovei",
                image_url="https://images.example.com/branza-burduf.jpg",
                is_active=True
            ),
            Product(
                name="Lapte integral pasteurizat",
                description="Lapte integral proaspăt din ferme locale, bogat în calciu și vitamine",
                brand="Luna Ferma",
                image_url="https://images.example.com/lapte-integral.jpg",
                is_active=True
            ),
            Product(
                name="Smântână de vaci",
                description="Smântână groasă, ideal pentru ciorbe și costume tradiționale",
                brand="Gospodăria Români",
                image_url="https://images.example.com/smantana.jpg",
                is_active=True
            ),
            Product(
                name="Cărnuri procesate - Șunca de casă",
                description="Șuncă afumată, tradițional preparată, perfectă pentru sandvișuri",
                brand="Carnicerul Veseliei",
                image_url="https://images.example.com/sunca-casa.jpg",
                is_active=True
            ),
            Product(
                name="Miere de albine sălbatică",
                description="Miere pură din flori sălbatice de munte, cu proprietăți terapeutice",
                brand="Stupina Aurie",
                image_url="https://images.example.com/miere.jpg",
                is_active=True
            ),
            Product(
                name="Brânzetură moale tradițională",
                description="Brânzetură proaspătă, cremoasă, potrivită pentru mic dejun",
                brand="Crama Veche",
                image_url="https://images.example.com/brranzetură.jpg",
                is_active=True
            ),
            Product(
                name="Gem de coacăze negre",
                description="Gem de casă din coacăze negre, fără conservanți, îmbiar și bogat",
                brand="Zarzavagiul Bunicii",
                image_url="https://images.example.com/gem-coacaze.jpg",
                is_active=True
            ),
            Product(
                name="Iaurt natural cu cultură de bacterii vii",
                description="Iaurt închegat natural cu bacterii probiotice, fără aditivi",
                brand="Ferma Ecologică Vlădești",
                image_url="https://images.example.com/iaurt-natural.jpg",
                is_active=True
            ),
            Product(
                name="Ouă de găini crescute în curte",
                description="Ouă proaspete, cu gălbenuș bogat în nutrienți, de la găini crescute la poală",
                brand="Gospodăria Rototej",
                image_url="https://images.example.com/oua-curte.jpg",
                is_active=True
            ),
            Product(
                name="Ulei de floarea soarelui presat la rece",
                description="Ulei natural, presat la rece, bogat în acizi grași esențiali",
                brand="Moară Vechea Petrobrazi",
                image_url="https://images.example.com/ulei-floare.jpg",
                is_active=True
            ),
            Product(
                name="Morcovi freschi biologici",
                description="Morcovi freschi, crescuți fără pesticide, proaspăt recoltați",
                brand="Grădina Naturii",
                image_url="https://images.example.com/morcovi.jpg",
                is_active=True
            ),
        ]
        
        # Add all products
        for product in products:
            session.add(product)
            
        session.flush()
        session.commit()
        
        print("✓ Data seeded successfully!")
        print(f"  - {len(products)} products added")
        
    except Exception as e:
        session.rollback()
        print(f"✗ Error seeding data: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed_data()
