from pymongo import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId
import certifi
import mongomock

client = None
db = None

# Try MongoDB Cloud first
try:
    uri = "mongodb+srv://sandhyasaravanan198_db_user:subi123@cluster0.mljag5t.mongodb.net/boxway?retryWrites=true&w=majority&appName=Cluster0"

    client = MongoClient(
        uri,
        server_api=ServerApi('1'),
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=3000
    )

    client.admin.command('ping')
    print("Connected to MongoDB Cloud")

except Exception as e:
    print(f"Could not connect to MongoDB Cloud: {e}")
    print("Falling back to local MongoDB...")

    try:
        client = MongoClient(
            'mongodb://localhost:27017/',
            serverSelectionTimeoutMS=3000
        )

        client.admin.command('ping')
        print("Connected to local MongoDB")

    except Exception as local_error:
        print(f"Could not connect to local MongoDB: {local_error}")
        print("Using in-memory mock database")

        # ✅ IMPORTANT FIX (this prevents crash)
        client = mongomock.MongoClient()

# Always create DB safely
db = client["boxway"]

if hasattr(client, "list_database_names"):
    try:
        print("Databases:", client.list_database_names())
    except:
        pass


def get_database():
    return db