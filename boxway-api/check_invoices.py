from database import get_database

db = get_database()
invoices = list(db.get_collection('invoices').find())

print(f"=== Total invoices in database: {len(invoices)} ===")
for inv in invoices:
    print(f"Invoice: {inv.get('invoiceId')}")
    print(f"  client field: '{inv.get('client')}'")
    print(f"  amount: {inv.get('amount')}")
    print()
