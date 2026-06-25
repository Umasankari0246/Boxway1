from pymongo import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId
import certifi

# Try to connect to MongoDB Cloud first, fallback to local instance
try:
    uri = "mongodb+srv://sandhyasaravanan198_db_user:subi123@cluster0.mljag5t.mongodb.net/boxway?retryWrites=true&w=majority&appName=Cluster0"

    client = MongoClient(
        uri,
        server_api=ServerApi('1'),
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=3000
    )

    # Test connection
    client.admin.command('ping')
    print("Connected to MongoDB Cloud")

except Exception as e:
    print(f"Could not connect to MongoDB Cloud: {e}")
    print("Falling back to local MongoDB...")

    try:
        # Try local MongoDB connection
        client = MongoClient(
            'mongodb://localhost:27017/',
            serverSelectionTimeoutMS=3000
        )

        client.admin.command('ping')
        print("Connected to local MongoDB")

    except Exception as local_error:
        print(f"Could not connect to local MongoDB: {local_error}")
        print("Using in-memory mock database")
        client = None

# Connect to the boxway database
db = client["boxway"] if client else None
if client:
    print("Databases:", client.list_database_names())

def get_database():
    return db