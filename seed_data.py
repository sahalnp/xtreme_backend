import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'xtreme_core.settings')
django.setup()

from django.contrib.auth.models import User
from store.models import Category, Product

def seed():
    # 1. Admin user
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@xtremeshoes.com', 'admin123')
        print("Admin user created: username='admin', password='admin123'")
    else:
        u = User.objects.get(username='admin')
        u.set_password('admin123')
        u.is_staff = True
        u.is_superuser = True
        u.save()
        print("Admin user password reset to 'admin123'")

    # 2. Categories
    categories = [
        {'name': 'Sneakers', 'description': 'Streetwear and lifestyle sneakers'},
        {'name': 'Running Shoes', 'description': 'High-performance marathon and road runners'},
        {'name': 'Basketball', 'description': 'Court-ready high-tops and traction kicks'},
        {'name': 'Casual & Loafers', 'description': 'Comfortable everyday footwear'},
        {'name': 'Outdoor & Trail', 'description': 'Rugged grip all-weather footwear'},
    ]

    cat_objs = {}
    for cat in categories:
        obj, created = Category.objects.get_or_create(
            name=cat['name'],
            defaults={'description': cat['description'], 'is_active': True, 'is_deleted': False}
        )
        cat_objs[cat['name']] = obj

    # 3. Products
    products = [
        {
            'name': 'Nike Air Max Pulse',
            'category': cat_objs['Sneakers'],
            'price': 139.99,
            'color': 'Black / White / Wolf Grey',
            'size': 'UK 7, UK 8, UK 9, UK 10, UK 11',
            'stock': 25,
            'description': 'Engineered with point-loaded cushioning and iconic Air unit for ultimate rebound.'
        },
        {
            'name': 'Adidas Ultraboost Light',
            'category': cat_objs['Running Shoes'],
            'price': 189.99,
            'color': 'Core Black / Cloud White',
            'size': 'UK 6, UK 7, UK 8, UK 9, UK 10',
            'stock': 18,
            'description': 'Experience epic energy with the lightest BOOST midsole ever built.'
        },
        {
            'name': 'Jordan Retro High OG',
            'category': cat_objs['Basketball'],
            'price': 199.99,
            'color': 'Chicago Red / Black / Sail',
            'size': 'UK 8, UK 9, UK 10, UK 11, UK 12',
            'stock': 12,
            'description': 'Legendary silhouette featuring premium leather and classic Jordan wings logo.'
        },
        {
            'name': 'Puma Velocity Nitro 3',
            'category': cat_objs['Running Shoes'],
            'price': 129.99,
            'color': 'Electric Lime / Black',
            'size': 'UK 7, UK 8, UK 9, UK 10',
            'stock': 30,
            'description': 'Nitro foam technology delivering explosive responsiveness in a lightweight design.'
        },
        {
            'name': 'New Balance 9060 Chunky',
            'category': cat_objs['Sneakers'],
            'price': 159.99,
            'color': 'Rain Cloud / Castlerock',
            'size': 'UK 7, UK 8, UK 9, UK 10, UK 11',
            'stock': 15,
            'description': 'Sleek Y2K aesthetics combined with ABZORB and SBS cushioning.'
        },
        {
            'name': 'Salomon XT-6 Gore-Tex',
            'category': cat_objs['Outdoor & Trail'],
            'price': 210.00,
            'color': 'Phantom / Black',
            'size': 'UK 8, UK 9, UK 10, UK 11',
            'stock': 10,
            'description': 'Tough waterproof trail icon suited for rough terrains and high street style.'
        }
    ]

    for p in products:
        if not Product.objects.filter(name=p['name']).exists():
            Product.objects.create(
                name=p['name'],
                category=p['category'],
                price=p['price'],
                color=p['color'],
                size=p['size'],
                stock=p['stock'],
                description=p['description'],
                is_active=True,
                is_deleted=False
            )
            print(f"Product created: {p['name']}")

    print("Seed completed successfully!")

if __name__ == '__main__':
    seed()

