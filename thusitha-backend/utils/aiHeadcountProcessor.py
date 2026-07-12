import sys
import json
try:
    import cv2  # type: ignore
except ImportError:
    print(json.dumps({"error": "Dependency missing: Run 'pip install opencv-python'"}))
    sys.exit(1)
import logging
import os
try:
    import numpy as np  # type: ignore
except ImportError:
    np = None

# Suppress standard output from AI libraries to keep the JSON output clean for Node.js
os.environ['YOLO_VERBOSE'] = 'False'
logging.getLogger("ultralytics").setLevel(logging.ERROR)

try:
    from ultralytics import YOLO  # type: ignore
except ImportError:
    print(json.dumps({"error": "Dependency missing: Run 'pip install ultralytics opencv-python'"}))
    sys.exit(1)

# NEW: Import face_recognition for the Verification pass
try:
    import face_recognition # type: ignore
    HAS_FACE_REC = True
except ImportError:
    HAS_FACE_REC = False

def load_yolo_model():
    try:
        return YOLO("yolov8n.pt")
    except Exception as e:
        return {"error": f"Model failed to load: {str(e)}"}


def encode_face_image(image_path):
    if not HAS_FACE_REC:
        return {"error": "face_recognition not installed"}
    if not image_path or not os.path.exists(image_path):
        return {"error": "Valid image path required"}

    try:
        img = face_recognition.load_image_file(image_path)
        encs = face_recognition.face_encodings(img)
        if encs:
            return {"encoding": encs[0].tolist()}
        return {"error": "No face found in image"}
    except Exception as e:
        return {"error": str(e)}


def build_known_encodings(expected_students):
    known_encodings = []
    students_with_encodings = []
    if np is None:
        return known_encodings, students_with_encodings

    for student in (expected_students or []):
        if student.get('face_encoding'):
            known_encodings.append(np.array(student['face_encoding']))
            students_with_encodings.append(student)
    return known_encodings, students_with_encodings


def open_camera_frame(url):
    cap = cv2.VideoCapture(url)
    if not cap.isOpened():
        return None

    success, frame = cap.read()
    cap.release()
    return frame if success else None


def count_people_in_frame(model, frame):
    results = model.predict(frame, classes=[0], verbose=False)
    return len(results[0].boxes) if results else 0


def verify_face_frame(frame, known_encodings, students_with_encodings):
    if not HAS_FACE_REC:
        return {
            "matched_student_ids": [],
            "unknown_faces_count": 0,
            "total_faces_found": 0,
            "error": "Face recognition not available"
        }
    
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    face_locations = face_recognition.face_locations(rgb_frame)
    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

    matched_ids = []
    unknown_faces = 0
    for face_encoding in face_encodings:
        matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=0.6)
        found_match = False
        for i, match in enumerate(matches):
            if match:
                matched_ids.append(students_with_encodings[i]['student_id'])
                found_match = True
                break
        if not found_match:
            unknown_faces += 1

    return {
        "matched_student_ids": matched_ids,
        "unknown_faces_count": unknown_faces,
        "total_faces_found": len(face_locations)
    }


def process_headcount_zone(model, zone):
    name = zone.get("zone_name", "Unknown")
    url = zone.get("camera_url")
    if not url:
        return name, 0

    frame = open_camera_frame(url)
    if frame is None:
        return name, 0

    try:
        return name, count_people_in_frame(model, frame)
    except Exception:
        return name, 0


def process_verify_zone(zone, known_encodings, students_with_encodings, session_id):
    name = zone.get("zone_name", "Unknown")
    url = zone.get("camera_url")
    if not url:
        return name, {
            "matched_student_ids": [],
            "unknown_faces_count": 0,
            "total_faces_found": 0,
        }

    frame = open_camera_frame(url)
    if frame is None:
        return name, {
            "matched_student_ids": [],
            "unknown_faces_count": 0,
            "total_faces_found": 0,
        }

    # 📸 Save the frame for manual Resolve verification
    if not HAS_FACE_REC:
        # If face recognition not available, still try to save frame for manual review
        img_filename = f"susp_sess_{session_id}_{name.replace(' ', '_')}.jpg"
        save_path = os.path.join("uploads", "suspicious", img_filename)
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        try:
            cv2.imwrite(save_path, frame)
            return name, {
                "matched_student_ids": [],
                "unknown_faces_count": 0,
                "total_faces_found": 0,
                "image_url": f"uploads/suspicious/{img_filename}",
                "status": "offline"
            }
        except Exception:
            return name, {
                "matched_student_ids": [],
                "unknown_faces_count": 0,
                "total_faces_found": 0,
                "status": "offline"
            }
    
    img_filename = f"susp_sess_{session_id}_{name.replace(' ', '_')}.jpg"
    save_path = os.path.join("uploads", "suspicious", img_filename)
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    cv2.imwrite(save_path, frame)
    
    res = verify_face_frame(frame, known_encodings, students_with_encodings)
    # Convert to URL format for backend
    res["image_url"] = f"uploads/suspicious/{img_filename}"
    return name, res


def process_ai(mode, zones=None, expected_students=None, image_path=None, session_id=None):
    """
    Loops through provided camera sources (RTSP streams, HTTP phone cams, or local files).
    'headcount' mode: Just counts people.
    'encode' mode: Generates a face vector for a single image.
    'verify' mode: Attempts to match faces against expected_students.
    """
    if mode == 'status':
        return {
            "yolo_loaded": True,
            "face_rec_enabled": HAS_FACE_REC,
            "device": "CPU"  # You could expand this to check for CUDA/GPU
        }

    if mode == 'encode' and HAS_FACE_REC:
        return encode_face_image(image_path)

    if (mode == 'verify' or mode == 'encode') and not HAS_FACE_REC:
        return {
            "error": "Biometric verification (dlib) is offline on this machine.",
            "suggestion": "Manual verification required or install Build Tools.",
            "fallback_active": True
        }

    model = None
    if mode == 'headcount':
        model = load_yolo_model()
        if isinstance(model, dict):
            return model

    known_encodings, students_with_encodings = build_known_encodings(expected_students) if mode == 'verify' else ([], [])
    zone_breakdown = {}
    verification_details = {}
    total_ai_headcount = 0

    for zone in (zones or []):
        if mode == 'headcount':
            name, count = process_headcount_zone(model, zone)
            zone_breakdown[name] = count
            total_ai_headcount += count
        elif mode == 'verify':
            name, details = process_verify_zone(zone, known_encodings, students_with_encodings, session_id)
            verification_details[name] = details

    if mode == 'headcount':
        return {"zone_breakdown": zone_breakdown, "total_ai_headcount": total_ai_headcount}

    return {"verification_details": verification_details}

if __name__ == "__main__":
    try:
        # 💡 Industrial Improvement: Read JSON payload from stdin
        input_data = json.load(sys.stdin)
        mode = input_data.get('mode', 'headcount')
        zones = input_data.get('zones', [])
        expected = input_data.get('expected_students', [])
        img_path = input_data.get('image_path')
        sess_id = input_data.get('session_id')
        final_output = process_ai(mode, zones, expected, img_path, sess_id)
        print(json.dumps(final_output))
    except Exception as e:
        print(json.dumps({"error": str(e)}))