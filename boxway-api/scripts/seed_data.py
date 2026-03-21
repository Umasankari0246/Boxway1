import sys
import os
import certifi
import urllib.parse
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pymongo import MongoClient
from pymongo.server_api import ServerApi

# Utilizing certifi to avoid TLS/SSL internal handshake errors on certain systems with older python openssl bindings
password = urllib.parse.quote_plus('liZXEumSsakcDldF') 
uri = f"mongodb+srv://developer_db_user:{password}@movicloudlabscluster.p08qogp.mongodb.net/?retryWrites=true&w=majority&appName=MoviCloudLabsCluster"

client = MongoClient(uri, server_api=ServerApi('1'), tlsCAFile=certifi.where(), tlsAllowInvalidCertificates=True)
db = client.boxway_db
employees_collection = db.get_collection("employees")

mock_employees = [
    {
        "name": "Alex Mercer",
        "email": "alex.m@boxway.com",
        "phone": "+1 555-0101",
        "gender": "Male",
        "dob": "1985-06-15",
        "bloodGroup": "O+",
        "city": "New York",
        "role": "Senior Architect",
        "department": "Design",
        "employeeType": "Full-time",
        "startDate": "2020-03-01",
        "status": "Active",
        "highestQualification": "M.Arch",
        "university": "Columbia University",
        "graduationYear": "2010",
        "architectureSkills": ["Conceptual Design", "3D Modeling", "Urban Planning"],
        "toolsSelection": ["AutoCAD", "Revit", "Rhino"],
        "salary": 120000,
        "basicPay": 48000,
        "hra": 24000,
        "allowances": 48000,
        "familyMembers": "Spouse (Sarah), 2 Children",
        "emergencyContactName": "Sarah Mercer",
        "emergencyContactRelation": "Spouse",
        "emergencyPhone": "+1 555-0102",
        "photoUrl": "https://avatar.iran.liara.run/public/boy?username=Alex",
    },
    {
        "name": "Sophia Chen",
        "email": "sophia.c@boxway.com",
        "phone": "+1 555-0202",
        "gender": "Female",
        "dob": "1992-11-20",
        "bloodGroup": "A+",
        "city": "London",
        "role": "Interior Designer",
        "department": "Design",
        "employeeType": "Full-time",
        "startDate": "2022-01-15",
        "status": "Active",
        "highestQualification": "B.F.A Interior Design",
        "university": "Parsons School of Design",
        "graduationYear": "2014",
        "architectureSkills": ["Interior Design", "Drafting"],
        "toolsSelection": ["SketchUp", "AutoCAD", "V-Ray"],
        "salary": 85000,
        "basicPay": 34000,
        "hra": 17000,
        "allowances": 34000,
        "familyMembers": "Single",
        "emergencyContactName": "Wei Chen",
        "emergencyContactRelation": "Parent",
        "emergencyPhone": "+1 555-0203",
        "photoUrl": "https://avatar.iran.liara.run/public/girl?username=Sophia",
    },
    {
        "name": "Marcus Johnson",
        "email": "marcus.j@boxway.com",
        "phone": "+1 555-0303",
        "gender": "Male",
        "dob": "1988-04-10",
        "bloodGroup": "B+",
        "city": "Toronto",
        "role": "Project Manager",
        "department": "Management",
        "employeeType": "Contract",
        "startDate": "2023-06-01",
        "status": "Active",
        "highestQualification": "MBA",
        "university": "Rotman School of Management",
        "graduationYear": "2015",
        "architectureSkills": [],
        "toolsSelection": [],
        "salary": 110000,
        "basicPay": 44000,
        "hra": 22000,
        "allowances": 44000,
        "familyMembers": "Spouse, 1 Child",
        "emergencyContactName": "Emily Johnson",
        "emergencyContactRelation": "Spouse",
        "emergencyPhone": "+1 555-0304",
        "photoUrl": "https://avatar.iran.liara.run/public/boy?username=Marcus",
    }
]

def seed_db():
    print("Clearing existing employees...")
    employees_collection.delete_many({})
    
    print("Inserting mock employees...")
    result = employees_collection.insert_many(mock_employees)
    print(f"Successfully inserted {len(result.inserted_ids)} employees.")

if __name__ == "__main__":
    seed_db()
