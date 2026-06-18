from pymongo import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId
import certifi
import urllib.parse

# Try to connect to MongoDB Cloud first, fallback to local instance
try:
    password = urllib.parse.quote_plus('liZXEumSsakcDldF') 
    uri = f"mongodb+srv://developer_db_user:{password}@movicloudlabscluster.p08qogp.mongodb.net/?retryWrites=true&w=majority&appName=MoviCloudLabsCluster"
    client = MongoClient(uri, server_api=ServerApi('1'), tlsCAFile=certifi.where(), serverSelectionTimeoutMS=3000)
    client.admin.command('ping')  # Test connection
    print("Connected to MongoDB Cloud")
except Exception as e:
    print(f"Could not connect to MongoDB Cloud: {e}")
    print("Falling back to local MongoDB...")
    try:
        # Try local MongoDB connection
        client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=3000)
        client.admin.command('ping')  # Test connection
        print("Connected to local MongoDB")
    except Exception as local_error:
        print(f"Could not connect to local MongoDB: {local_error}")
        print("Using in-memory mock database")
        # Create a mock client for development
        client = None

db = client.boxway_db if client else None

def get_database():
    return db
