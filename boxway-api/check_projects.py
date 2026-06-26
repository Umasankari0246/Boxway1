from database import get_database

db = get_database()
projects = list(db.get_collection('projects').find())
clients = list(db.get_collection('clients').find())

print(f"=== Total projects in database: {len(projects)} ===")
for p in projects:
    print(f"Project: {p.get('name')}")
    print(f"  client field: '{p.get('client')}'")
    print(f"  _id: {p.get('_id')}")
    print()

print(f"=== Total clients in database: {len(clients)} ===")
for c in clients:
    print(f"Client: {c.get('name')}")
    print(f"  clientId: '{c.get('clientId')}'")
    print(f"  _id: {c.get('_id')}")
    print()
