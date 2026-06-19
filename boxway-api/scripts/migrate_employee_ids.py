import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_database
from bson.objectid import ObjectId

def migrate_employee_ids():
    """
    Script to update existing employees to have proper employee IDs (EMP001, EMP002, etc.)
    """
    db = get_database()
    employee_collection = db.get_collection("employees")
    
    # Get all employees
    employees = list(employee_collection.find({}))
    
    if not employees:
        print("No employees found in database.")
        return
    
    print(f"Found {len(employees)} employees to migrate.")
    
    # Sort employees by creation date (_id) to maintain consistency
    employees.sort(key=lambda x: x["_id"])
    
    # Update each employee with a proper employee ID
    for index, employee in enumerate(employees, start=1):
        employee_id = f"EMP{str(index).zfill(3)}"
        
        # Check if employee already has an employeeId
        if "employeeId" in employee and employee["employeeId"]:
            print(f"Employee {employee.get('name', 'Unknown')} already has employeeId: {employee['employeeId']}")
            continue
        
        # Update the employee with the new employeeId
        result = employee_collection.update_one(
            {"_id": employee["_id"]},
            {"$set": {"employeeId": employee_id}}
        )
        
        if result.modified_count > 0:
            print(f"Updated employee {employee.get('name', 'Unknown')} with employeeId: {employee_id}")
        else:
            print(f"Failed to update employee {employee.get('name', 'Unknown')}")
    
    print("Migration completed!")

if __name__ == "__main__":
    migrate_employee_ids()
