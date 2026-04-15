from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import random

app = Flask(__name__)
CORS(app)

def init_db():
    conn = sqlite3.connect('hostel.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS rooms (room_no TEXT PRIMARY KEY, capacity INTEGER, occupancy INTEGER, status TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS students (student_id TEXT PRIMARY KEY, name TEXT, course TEXT, semester INTEGER, room_no TEXT, FOREIGN KEY(room_no) REFERENCES rooms(room_no))''')
    c.execute('''CREATE TABLE IF NOT EXISTS mess_records (record_id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT, diet_preference TEXT, strict_restrictions TEXT, FOREIGN KEY(student_id) REFERENCES students(student_id))''')
    
    # NEW: Users table for Authentication
    c.execute('''CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, password TEXT)''')

    # Seed Default Admin
    c.execute("SELECT COUNT(*) FROM users")
    if c.fetchone()[0] == 0:
        c.execute("INSERT INTO users (username, password) VALUES (?, ?)", ('admin', 'password123'))

    c.execute("SELECT COUNT(*) FROM students")
    if c.fetchone()[0] == 0:
        print("Generating massive 8400+ records database... please wait a second.")
        rooms_data, students_data, mess_data = [], [], []
        courses = ['B.Tech CSE', 'B.Tech IT', 'B.Tech ECE', 'B.Tech MAE', 'B.Arch']
        diets = [('Vegetarian', 'None'), ('Vegetarian', 'Jain / No Onion Garlic'), ('Non-Vegetarian', 'None'), ('Non-Vegetarian', 'Strictly No Seafood/Fish')]
        student_counter = 1
        
        for block in ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']:
            for floor in range(1, 6):
                for r in range(1, 101):
                    if student_counter > 8400: break
                    room_no = f"{block}-{floor}{r:02d}"
                    capacity = 2
                    occupancy = random.choice([1, 2])
                    if student_counter + occupancy > 8400: occupancy = 1
                    status = 'Full' if occupancy == capacity else 'Partially Filled'
                    rooms_data.append((room_no, capacity, occupancy, status))

                    for _ in range(occupancy):
                        student_id = f"STU-{student_counter:05d}"
                        name = f"Student_{student_counter}"
                        students_data.append((student_id, name, random.choice(courses), random.choice([1, 2, 3, 4, 5, 6, 7, 8]), room_no))
                        diet = random.choice(diets)
                        mess_data.append((student_id, diet[0], diet[1]))
                        student_counter += 1
            if student_counter > 8400: break
                
        c.executemany("INSERT INTO rooms VALUES (?, ?, ?, ?)", rooms_data)
        c.executemany("INSERT INTO students VALUES (?, ?, ?, ?, ?)", students_data)
        c.executemany("INSERT INTO mess_records (student_id, diet_preference, strict_restrictions) VALUES (?, ?, ?)", mess_data)
        conn.commit()
    conn.close()

# --- AUTH ROUTES ---
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    conn = sqlite3.connect('hostel.db')
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE username=? AND password=?", (data['username'], data['password']))
    user = c.fetchone()
    conn.close()
    if user: return jsonify({"message": "Login successful"}), 200
    return jsonify({"error": "Invalid username or password"}), 401

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    conn = sqlite3.connect('hostel.db')
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users (username, password) VALUES (?, ?)", (data['username'], data['password']))
        conn.commit()
        return jsonify({"message": "Signup successful"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Username already exists"}), 400
    finally:
        conn.close()

# --- CRUD ROUTES ---
@app.route('/api/data', methods=['GET'])
def get_data():
    conn = sqlite3.connect('hostel.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    students = [dict(row) for row in c.execute("SELECT * FROM students ORDER BY CAST(SUBSTR(student_id, 5) AS INTEGER) DESC").fetchall()]
    rooms = [dict(row) for row in c.execute("SELECT * FROM rooms").fetchall()]
    mess = [dict(row) for row in c.execute("SELECT * FROM mess_records").fetchall()]
    conn.close()
    return jsonify({"students": students, "rooms": rooms, "mess_records": mess})

@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.json
    conn = sqlite3.connect('hostel.db')
    c = conn.cursor()
    try:
        c.execute("SELECT MAX(CAST(SUBSTR(student_id, 5) AS INTEGER)) FROM students")
        max_id = c.fetchone()[0]
        next_id = max_id + 1 if max_id else 1
        new_student_id = f"STU-{next_id:05d}"
        c.execute("INSERT INTO students (student_id, name, course, semester, room_no) VALUES (?, ?, ?, ?, ?)", (new_student_id, data['name'], data['course'], data['semester'], data['room_no']))
        c.execute("UPDATE rooms SET occupancy = occupancy + 1 WHERE room_no = ?", (data['room_no'],))
        conn.commit()
        return jsonify({"message": "Success", "student_id": new_student_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        conn.close()

@app.route('/api/students/<student_id>', methods=['PUT'])
def update_student(student_id):
    data = request.json
    conn = sqlite3.connect('hostel.db')
    c = conn.cursor()
    try:
        c.execute("SELECT room_no FROM students WHERE student_id = ?", (student_id,))
        old_room = c.fetchone()[0]
        c.execute("UPDATE students SET name=?, course=?, semester=?, room_no=? WHERE student_id=?", (data['name'], data['course'], data['semester'], data['room_no'], student_id))
        if old_room != data['room_no']:
            c.execute("UPDATE rooms SET occupancy = occupancy - 1 WHERE room_no = ?", (old_room,))
            c.execute("UPDATE rooms SET occupancy = occupancy + 1 WHERE room_no = ?", (data['room_no'],))
        conn.commit()
        return jsonify({"message": "Updated successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        conn.close()

@app.route('/api/students/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    conn = sqlite3.connect('hostel.db')
    c = conn.cursor()
    try:
        c.execute("SELECT room_no FROM students WHERE student_id = ?", (student_id,))
        room = c.fetchone()
        if room: c.execute("UPDATE rooms SET occupancy = occupancy - 1 WHERE room_no = ?", (room[0],))
        c.execute("DELETE FROM mess_records WHERE student_id = ?", (student_id,))
        c.execute("DELETE FROM students WHERE student_id = ?", (student_id,))
        conn.commit()
        return jsonify({"message": "Deleted successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        conn.close()

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)