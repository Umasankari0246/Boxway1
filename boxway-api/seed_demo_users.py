from database import get_database
from datetime import datetime

def seed_demo_users():
    db = get_database()
    user_collection = db.get_collection("users")
    
    # Delete existing demo users first to recreate
    user_collection.delete_many({"email": {"$in": ["admin@boxway.com", "architect@boxway.com"]}})
    
    # Demo users to seed (using plain text for now - will be hashed by register endpoint)
    demo_users = [
        {
            "userId": "USR-ADMIN-001",
            "email": "admin@boxway.com",
            "password": "admin123",  # Plain text for demo
            "name": "Alex Carter",
            "role": "Admin",
            "department": "Management",
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        },
        {
            "userId": "USR-ARCH-001",
            "email": "architect@boxway.com",
            "password": "arch123",  # Plain text for demo
            "name": "Marcus Johnson",
            "role": "Architect",
            "department": "Design",
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }
    ]
    
    for user_data in demo_users:
        # Insert user
        user_collection.insert_one(user_data)
        print(f"Created demo user: {user_data['email']}")
    
    print("Demo users seeded successfully!")

if __name__ == "__main__":
    seed_demo_users()
