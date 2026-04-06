"""
Seed script to populate products with Romanian data.
Run this from the backend directory with: python scripts/seed_products.py
Or via Docker: docker compose run --rm main python scripts/seed_products.py
"""
import sys

sys.path.insert(0, '/base')

from app.core.database import SessionLocal
from app.models.category import Category
from app.models.product import Product


def seed_data():
    """Populate products with Romanian data."""
    session = SessionLocal()
    
    try:
        # Check if data already exists
        existing_products = session.query(Product).count()
        if existing_products > 0:
            print(f"✓ Database already contains {existing_products} product(s). Skipping seed.")
            return

        # Ensure categories exist
        categories_seed = [
            ("Panificație", "Produse de panificație și brutărie"),
            ("Lactate", "Lapte, iaurturi, smântână și brânzeturi"),
            ("Carne și mezeluri", "Carne proaspătă și produse procesate"),
            ("Apicole", "Produse din miere și derivate"),
            ("Conserve și dulcețuri", "Gemuri și produse conservate"),
            ("Ouă", "Ouă proaspete"),
            ("Uleiuri", "Uleiuri alimentare"),
            ("Legume", "Legume proaspete"),
        ]
        categories_by_name: dict[str, Category] = {}
        for category_name, category_description in categories_seed:
            category = session.query(Category).filter(Category.name == category_name).first()
            if not category:
                category = Category(
                    name=category_name,
                    description=category_description,
                    is_active=True,
                )
                session.add(category)
            categories_by_name[category_name] = category

        session.flush()

        # Romanian products
        products = [
            Product(
                name="Pâine neagră tradițională",
                description="Pâine neagră proaspătă, coapte zilnic, recunoascut pentru aroma și textura clasică",
                category_id=categories_by_name["Panificație"].id,
                brand="Păunul Fericit",
                image_url="https://images.example.com/paine-neagra.jpg",
                is_active=True
            ),
            Product(
                name="Brânză de burduf",
                description="Brânză tradițională de oaie, cu sare și condimente, produsă în Carpați",
                category_id=categories_by_name["Lactate"].id,
                brand="Brânzele Moldovei",
                image_url="https://images.example.com/branza-burduf.jpg",
                is_active=True
            ),
            Product(
                name="Lapte integral pasteurizat",
                description="Lapte integral proaspăt din ferme locale, bogat în calciu și vitamine",
                category_id=categories_by_name["Lactate"].id,
                brand="Luna Ferma",
                image_url="https://images.example.com/lapte-integral.jpg",
                is_active=True
            ),
            Product(
                name="Smântână de vaci",
                description="Smântână groasă, ideal pentru ciorbe și costume tradiționale",
                category_id=categories_by_name["Lactate"].id,
                brand="Gospodăria Români",
                image_url="https://images.example.com/smantana.jpg",
                is_active=True
            ),
            Product(
                name="Cărnuri procesate - Șunca de casă",
                description="Șuncă afumată, tradițional preparată, perfectă pentru sandvișuri",
                category_id=categories_by_name["Carne și mezeluri"].id,
                brand="Carnicerul Veseliei",
                image_url="https://images.example.com/sunca-casa.jpg",
                is_active=True
            ),
            Product(
                name="Miere de albine sălbatică",
                description="Miere pură din flori sălbatice de munte, cu proprietăți terapeutice",
                category_id=categories_by_name["Apicole"].id,
                brand="Stupina Aurie",
                image_url="https://images.example.com/miere.jpg",
                is_active=True
            ),
            Product(
                name="Brânzetură moale tradițională",
                description="Brânzetură proaspătă, cremoasă, potrivită pentru mic dejun",
                category_id=categories_by_name["Lactate"].id,
                brand="Crama Veche",
                image_url="https://images.example.com/brranzetură.jpg",
                is_active=True
            ),
            Product(
                name="Gem de coacăze negre",
                description="Gem de casă din coacăze negre, fără conservanți, îmbiar și bogat",
                category_id=categories_by_name["Conserve și dulcețuri"].id,
                brand="Zarzavagiul Bunicii",
                image_url="https://images.example.com/gem-coacaze.jpg",
                is_active=True
            ),
            Product(
                name="Iaurt natural cu cultură de bacterii vii",
                description="Iaurt închegat natural cu bacterii probiotice, fără aditivi",
                category_id=categories_by_name["Lactate"].id,
                brand="Ferma Ecologică Vlădești",
                image_url="https://images.example.com/iaurt-natural.jpg",
                is_active=True
            ),
            Product(
                name="Ouă de găini crescute în curte",
                description="Ouă proaspete, cu gălbenuș bogat în nutrienți, de la găini crescute la poală",
                category_id=categories_by_name["Ouă"].id,
                brand="Gospodăria Rototej",
                image_url="https://images.example.com/oua-curte.jpg",
                is_active=True
            ),
            Product(
                name="Ulei de floarea soarelui presat la rece",
                description="Ulei natural, presat la rece, bogat în acizi grași esențiali",
                category_id=categories_by_name["Uleiuri"].id,
                brand="Moară Vechea Petrobrazi",
                image_url="https://images.example.com/ulei-floare.jpg",
                is_active=True
            ),
            Product(
                name="Morcovi freschi biologici",
                description="Morcovi freschi, crescuți fără pesticide, proaspăt recoltați",
                category_id=categories_by_name["Legume"].id,
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
