from pymongo import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId
import certifi
import urllib.parse

# You mentioned earlier: mongodb+srv://developer_db_user:<db_password>@movicloudlabscluster.p08qogp.mongodb.net/?appName=MoviCloudLabsCluster
# URL encode the password to handle any special characters in it, replace 'password123' if that wasn't the exact password
password = urllib.parse.quote_plus('liZXEumSsakcDldF') 
uri = f"mongodb+srv://developer_db_user:{password}@movicloudlabscluster.p08qogp.mongodb.net/?retryWrites=true&w=majority&appName=MoviCloudLabsCluster"

client = MongoClient(uri, server_api=ServerApi('1'), tlsCAFile=certifi.where())
db = client.boxway_db

def get_database():
    return db
