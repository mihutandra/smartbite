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
            ("Fructe", "Fructe proaspete"),
            ("Paste și orez", "Paste făinoase și produse din cereale"),
            ("Sosuri", "Sosuri pentru gătit și condimente lichide"),
            ("Gustări", "Biscuiți, chipsuri și alte gustări"),
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
                image_url="https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSPz7HB5L-cAhs7E8ooWC3A-3hIq_09Ujajo_wN9MkAqn9yXp_cI_1MLnYhSHSRbJ93JVU5px0v",
                is_active=True
            ),
            Product(
                name="Brânză de burduf",
                description="Brânză tradițională de oaie, cu sare și condimente, produsă în Carpați",
                category_id=categories_by_name["Lactate"].id,
                brand="Brânzele Moldovei",
                image_url="https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQzkCnDG1wn4NfLl6ThJGTQ4kyVVWxkNciLe-Uoqaf1G-TpeCzZLdbg78D9zRhcs527l1_ak1F0",
                is_active=True
            ),
            Product(
                name="Lapte integral pasteurizat",
                description="Lapte integral proaspăt din ferme locale, bogat în calciu și vitamine",
                category_id=categories_by_name["Lactate"].id,
                brand="Luna Ferma",
                image_url="https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcR-pA2QNRqkGLRgbWMh1IzO1_U5OCahhhyNf0frwswYZSqAdUOSjlvi5RJgt301WQXbfHOeY7Zz",
                is_active=True
            ),
            Product(
                name="Smântână de vaci",
                description="Smântână groasă, ideal pentru ciorbe și costume tradiționale",
                category_id=categories_by_name["Lactate"].id,
                brand="Gospodăria Români",
                image_url="https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTZUWmqbOrl_w0-W96yR_LsMd17DDtGL5MGtwZYziFi0OFwIJDF1rQ7Wtxwv29Rdum-NA1Vb3M",
                is_active=True
            ),
            Product(
                name="Cărnuri procesate - Șunca de casă",
                description="Șuncă afumată, tradițional preparată, perfectă pentru sandvișuri",
                category_id=categories_by_name["Carne și mezeluri"].id,
                brand="Carnicerul Veseliei",
                image_url="https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRo2PnUc5AztUgyjlMRs1jvOgh2IvBhnht_xiF46eTT9v1_kh5LvO015o_BxJNyIZ3wG-L3Vb4",
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
                image_url="https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRet3BszPC0Df176xqrkyZyqZzbng-4yMlB6eEHp7jJ2vop6Ia_aXgDlFk3eu1EGor4-H_cnIof",
                is_active=True
            ),
            Product(
                name="Gem de coacăze negre",
                description="Gem de casă din coacăze negre, fără conservanți, îmbiar și bogat",
                category_id=categories_by_name["Conserve și dulcețuri"].id,
                brand="Zarzavagiul Bunicii",
                image_url="https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTQXtxhPfiRKrsXMQgF6iAqyslSOhOCIxo-5A57z3Yx8WPeSAI9FLAE5wA_peK0fFstkBwk6Koe",
                is_active=True
            ),
            Product(
                name="Iaurt natural cu cultură de bacterii vii",
                description="Iaurt închegat natural cu bacterii probiotice, fără aditivi",
                category_id=categories_by_name["Lactate"].id,
                brand="Ferma Ecologică Vlădești",
                image_url="https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcThO81yrf7aEBkCnNsx2Ui7UZtHTuDdNwGtmUuDGmJ-ZNFbIWsp5RTCpDHPahr-8wCPAFl0Owo",
                is_active=True
            ),
            Product(
                name="Ouă de găini crescute în curte",
                description="Ouă proaspete, cu gălbenuș bogat în nutrienți, de la găini crescute la poală",
                category_id=categories_by_name["Ouă"].id,
                brand="Gospodăria Rototej",
                image_url="https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRUwmvJUc7AG3_JslW7NFI4RCvPHjVc7OOz_u7g2Tyss6bymQ_h5Sa76pDLuzSejOqlyu6w97M",
                is_active=True
            ),
            Product(
                name="Ulei de floarea soarelui presat la rece",
                description="Ulei natural, presat la rece, bogat în acizi grași esențiali",
                category_id=categories_by_name["Uleiuri"].id,
                brand="Moară Vechea Petrobrazi",
                image_url="https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRywVzhB1kFit9AVtwt0SMVngCJioznU4SVBq4yAzJrjM30X0SZUAtxN4yJbxlIdqFD7uWv020",
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
            Product(
                name="Pâine neagră Vel Pitar",
                description="Pâine neagră feliată pentru consum zilnic.",
                category_id=categories_by_name["Panificație"].id,
                brand="Vel Pitar",
                image_url="https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTjGJVGG40VdsVQQJWfZoZeAQQe6-A07akZ4TDzFdKdUoMfnpQ6gPiC58Oc-WjnJuI44ZlPbkIX",
                is_active=True,
            ),
            Product(
                name="Lapte Zuzu 3.5%",
                description="Lapte UHT integral cu conținut de 3.5% grăsime.",
                category_id=categories_by_name["Lactate"].id,
                brand="Zuzu",
                image_url="https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQeWzG6FwBdbGIYT418jw8jguV2YAQ-aWu7TXhndLuZwacTfjE1YD4n0haejXpWNOhcd6qBAfgn",
                is_active=True,
            ),
            Product(
                name="Smântână Napolact 20%",
                description="Smântână fermentată, potrivită pentru gătit și servire.",
                category_id=categories_by_name["Lactate"].id,
                brand="Napolact",
                image_url="https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcS-0HUGuTjCe9ZnWO7ZwtKhBf7UNs400ZFai1mjl_UTm8c2s7QeRueLr6wBITXek4moYcNOMog",
                is_active=True,
            ),
            Product(
                name="Șuncă Praga Caroli",
                description="Mezel feliat din carne de porc pentru sandvișuri.",
                category_id=categories_by_name["Carne și mezeluri"].id,
                brand="Caroli",
                image_url="https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcS-EzhFU8VThk88XvyERdBbv6cI2ABEuQ8dFrzXNm5psDj0cf12pC7zxG4ughVddixAYJ47WPJ-",
                is_active=True,
            ),
            Product(
                name="Cașcaval Hochland",
                description="Cașcaval semitare pentru sandvișuri și gratinare.",
                category_id=categories_by_name["Lactate"].id,
                brand="Hochland",
                image_url="https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcScXtnb-Jx14r4QtEn9KdhKUMXUsyXdnoJMQjNtCctD3cfiBAqV-HTLkmE13ZosZkxkVf9XgsIG",
                is_active=True,
            ),
            Product(
                name="Gem de căpșuni Râureni",
                description="Gem de căpșuni cu bucăți de fruct.",
                category_id=categories_by_name["Conserve și dulcețuri"].id,
                brand="Râureni",
                image_url="https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRfKV9z8ZH6ADldha2uA7sRfLKy1i5G1i0a3rxa7yEfpAYU_4yw3mjNbg-V23skP2xO6QdcfB3X",
                is_active=True,
            ),
            Product(
                name="Iaurt simplu Activia",
                description="Iaurt cremos simplu pentru gustare zilnică.",
                category_id=categories_by_name["Lactate"].id,
                brand="Activia",
                image_url="https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcThygzsc2S9ZveOjXG24J-tVTdFP6_t0gatlIFOp9uNxkN5rav9CNN69iIEgj_NOl3lK5HyIUCP",
                is_active=True,
            ),
            Product(
                name="Ouă de găină Agricola 10 buc",
                description="Ouă proaspete calibru M, ambalaj de 10 bucăți.",
                category_id=categories_by_name["Ouă"].id,
                brand="Agricola",
                image_url="https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRvQ8n1Z9MVymGMYjsxsUSFlnHVi11Jh2QEGRy91IWKK__AGpnApgeuBiDjWcsx5g0fLrBdAQU",
                is_active=True,
            ),
            Product(
                name="Ulei de floarea-soarelui Unisol",
                description="Ulei rafinat de floarea-soarelui pentru gătit.",
                category_id=categories_by_name["Uleiuri"].id,
                brand="Unisol",
                image_url="https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTxB09OA9MvZiHXW4vszBvT_I7vCwpafDEDf0qKvs7laWEo_Xoci_DJ_vgyeDkGxnsZkR18xhkE",
                is_active=True,
            ),
            Product(
                name="Mere Golden România",
                description="Mere dulci-acrișoare, origine România.",
                category_id=categories_by_name["Fructe"].id,
                brand="Producători locali",
                image_url="https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRSjtCI8cEY0gOYuD9Zl04wESv3uih8bEtKJUfLsdtq6NNi2clsdRSbUjvDelhl8xIaxh8LI8w",
                is_active=True,
            ),
            Product(
                name="Banane Chiquita",
                description="Banane proaspete import, calibrul standard de retail.",
                category_id=categories_by_name["Fructe"].id,
                brand="Chiquita",
                image_url="https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcS48IdHOmqQEGgeYeymgmfKVsqwSu06Z-szkm_V1UCAfGTRHHmfY8YlHdauAo0xv39bycqS13Xp",
                is_active=True,
            ),
            Product(
                name="Paste Barilla Spaghetti nr.5",
                description="Paste din grâu dur, timp de fierbere aprox. 9 minute.",
                category_id=categories_by_name["Paste și orez"].id,
                brand="Barilla",
                image_url="https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcShoXCcrkN1ZecdJSJIGrOtUiwJvE3-wyXTxywda2Si-SF_jB_t9D7bVDyWc2g",
                is_active=True,
            ),
            Product(
                name="Paste Băneasa Penne",
                description="Paste românești tip penne pentru sosuri consistente.",
                category_id=categories_by_name["Paste și orez"].id,
                brand="Băneasa",
                image_url="https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQP8GRWH87qGCubVPN_S_dWmMLQ6xYHF0ZHUX00IqrbahyPeTmNyVkV1tEvl-oCwI8mhkttn5A",
                is_active=True,
            ),
            Product(
                name="Sos de roșii Mutti Passata",
                description="Passata fină de roșii pentru paste și pizza.",
                category_id=categories_by_name["Sosuri"].id,
                brand="Mutti",
                image_url="https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRVWWzAalS56vb_nOnw2DmGprgAAInuw8WMvGMCUD_pvDelOAbUXr1OYZQYz3_dj_wtXUx0Lpda",
                is_active=True,
            ),
            Product(
                name="Ketchup Heinz",
                description="Ketchup clasic pe bază de roșii coapte.",
                category_id=categories_by_name["Sosuri"].id,
                brand="Heinz",
                image_url="https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQsPDxCgLGLn8aMoUAkwb7SRItLQD77ty-BgBDks-utIFpXkrClRntTSnAs-z5JNoi-KfbZKTQ",
                is_active=True,
            ),
            Product(
                name="Piept de pui Agricola",
                description="Piept de pui refrigerat, fără os.",
                category_id=categories_by_name["Carne și mezeluri"].id,
                brand="Agricola",
                image_url="https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRTgWAw5cO025_0ylWI7gxX8E5CvhzYypyk4fLtGztdLV9p9E7VNb-dnXk-Y5xv568AyWv49EI",
                is_active=True,
            ),
            Product(
                name="Ceafă de porc Carrefour",
                description="Carne de porc refrigerată pentru grătar sau cuptor.",
                category_id=categories_by_name["Carne și mezeluri"].id,
                brand="Carrefour",
                image_url="https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTEFzDRxl4OwOnfoUsRpbd0TxAirugQa73mx03S_tC2p-cplYv_3vLWvkaJWKvWhSBymlmnC17L",
                is_active=True,
            ),
            Product(
                name="Telemea de vacă Delaco",
                description="Brânză telemea din lapte de vacă, sărată moderat.",
                category_id=categories_by_name["Lactate"].id,
                brand="Delaco",
                image_url="https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQPbkyqQS2MazSNJ7Iy7nF-hO1zRN8x4-Zw1H-0EPhjFhELnkh1PGi2-9LoeNA0jpx7nJRg_pY",
                is_active=True,
            ),
            Product(
                name="Biscuiți Oreo Original",
                description="Biscuiți sandwich cu cremă de vanilie.",
                category_id=categories_by_name["Gustări"].id,
                brand="Oreo",
                image_url="https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcREuIJZv1Tsa8cfjmjl3jjonVDbomC_TL_yu9j_viyvRDORER7LeckD7K1T8ft-bk7chCXG0gDl",
                is_active=True,
            ),
            Product(
                name="Biscuiți Picnic cacao",
                description="Biscuiți digestivi cu cacao pentru gustări rapide.",
                category_id=categories_by_name["Gustări"].id,
                brand="Picnic",
                image_url="https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTREgDDGqCXs97TlPiLb6UMx-mf0fc4MInBldoSPehiCQTiIJjzNhB_Vg8R6t9CMcyfSzIwzBu5",
                is_active=True,
            ),
            Product(
                name="Chipsuri Lay's cu sare",
                description="Chipsuri din cartofi cu sare.",
                category_id=categories_by_name["Gustări"].id,
                brand="Lay's",
                image_url="https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQlmcIBERx5gVkQya1a2Q41YZFWtRZnRlD9QUYyBz16I1QxrrbHWGssJlnIfyBUsa9qvkD0mOU",
                is_active=True,
            ),
            Product(
                name="Chipsuri Chio paprika",
                description="Chipsuri cu aromă de paprika.",
                category_id=categories_by_name["Gustări"].id,
                brand="Chio",
                image_url="https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQUFjBOOf860yXgs7j6w-y-H2AIsbHJMesOlrsmdzorjTJo_iI",
                is_active=True,
            ),
        ]
        
        existing_names = {name for (name,) in session.query(Product.name).all()}
        created = 0
        skipped = 0
        for product in products:
            if product.name in existing_names:
                skipped += 1
                continue
            session.add(product)
            created += 1
            
        session.flush()
        session.commit()
        
        print("✓ Data seeded successfully!")
        print(f"  - {created} products added")
        print(f"  - {skipped} products skipped (already existed)")
        
    except Exception as e:
        session.rollback()
        print(f"✗ Error seeding data: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed_data()
