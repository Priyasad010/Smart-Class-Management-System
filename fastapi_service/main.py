from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import cv2
import numpy as np
import logging

# Initialize FastAPI
app = FastAPI(title="Thusitha SCMS - CCTV AI Microservice")

# Try to load YOLO and Face Recognition
try:
    from ultralytics import YOLO
    model = YOLO("yolov8n.pt")
except Exception as e:
    model = None
    logging.error(f"Failed to load YOLO model: {e}")

try:
    import face_recognition
    HAS_FACE_REC = True
except ImportError:
    HAS_FACE_REC = False
    logging.warning("face_recognition not installed")

# Try to load MediaPipe for advanced face detection
try:
    import mediapipe.python.solutions.face_detection as mp_face_detection
    HAS_MEDIAPIPE = True
except ImportError:
    HAS_MEDIAPIPE = False
    logging.warning("mediapipe not installed, falling back to dlib HOG")

def get_mediapipe_face_locations(rgb_frame):
    if not HAS_MEDIAPIPE:
        return []
    h, w, _ = rgb_frame.shape
    locations = []
    # model_selection=1 is optimized for faces further than 2 meters (CCTV/classrooms)
    with mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.2) as face_detector:
        results = face_detector.process(rgb_frame)
        if results.detections:
            for detection in results.detections:
                bbox = detection.location_data.relative_bounding_box
                
                # Convert relative bounding box to absolute pixel coordinates with 15% padding
                ymin, xmin = bbox.ymin, bbox.xmin
                ymax, xmax = ymin + bbox.height, xmin + bbox.width
                
                # Apply 15% padding
                padding_y = bbox.height * 0.15
                padding_x = bbox.width * 0.15
                
                ymin = max(0.0, ymin - padding_y)
                ymax = min(1.0, ymax + padding_y)
                xmin = max(0.0, xmin - padding_x)
                xmax = min(1.0, xmax + padding_x)
                
                top = int(ymin * h)
                left = int(xmin * w)
                bottom = int(ymax * h)
                right = int(xmax * w)
                
                locations.append((top, right, bottom, left))
    return locations

def union_face_locations(locs1, locs2):
    merged = list(locs1)
    for box2 in locs2:
        t2, r2, b2, l2 = box2
        overlap = False
        for box1 in merged:
            t1, r1, b1, l1 = box1
            # Calculate intersection
            int_t = max(t1, t2)
            int_l = max(l1, l2)
            int_b = min(b1, b2)
            int_r = min(r1, r2)
            
            if int_b > int_t and int_r > int_l:
                int_area = (int_b - int_t) * (int_r - int_l)
                area1 = (b1 - t1) * (r1 - l1)
                area2 = (b2 - t2) * (r2 - l2)
                iou = int_area / float(area1 + area2 - int_area)
                if iou > 0.3:
                    overlap = True
                    break
        if not overlap:
            merged.append(box2)
    return merged

# Pydantic models for requests
class ZoneInfo(BaseModel):
    zone_name: str
    camera_url: Optional[str] = None

class StudentInfo(BaseModel):
    student_id: int
    student_name: Optional[str] = "Student"
    face_encoding: Optional[List[float]] = None
    
class HeadcountRequest(BaseModel):
    zones: List[ZoneInfo]

class VerifyRequest(BaseModel):
    session_id: int
    zones: List[ZoneInfo]
    expected_students: List[StudentInfo]
    
class EncodeRequest(BaseModel):
    image_path: str

# Endpoints
@app.get("/status")
def get_status():
    return {
        "yolo_loaded": model is not None,
        "face_rec_enabled": HAS_FACE_REC,
        "device": "CPU"
    }

def open_camera_frame(url):
    if not url: return None
    # Resolve relative local file paths to thusitha-backend directory
    if not url.startswith("rtsp://") and not url.startswith("http://") and not url.startswith("https://"):
        if not os.path.exists(url):
            backend_url = os.path.join("..", "thusitha-backend", url)
            if os.path.exists(backend_url):
                url = backend_url
    cap = cv2.VideoCapture(url)
    if not cap.isOpened(): return None
    success, frame = cap.read()
    cap.release()
    return frame if success else None

@app.post("/headcount")
def run_headcount(req: HeadcountRequest):
    zone_breakdown = {}
    total_ai_headcount = 0
    
    for zone in req.zones:
        name = zone.zone_name
        frame = open_camera_frame(zone.camera_url)
        if frame is None:
            zone_breakdown[name] = 0
            continue
        try:
            # Convert frame and enhance contrast
            try:
                lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
                l, a, b = cv2.split(lab)
                clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
                cl = clahe.apply(l)
                limg = cv2.merge((cl, a, b))
                enhanced_frame = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
            except Exception:
                enhanced_frame = frame.copy()

            rgb_frame = cv2.cvtColor(enhanced_frame, cv2.COLOR_BGR2RGB)
            if len(rgb_frame.shape) == 2:
                rgb_frame = cv2.cvtColor(rgb_frame, cv2.COLOR_GRAY2RGB)
            elif len(rgb_frame.shape) == 3 and rgb_frame.shape[2] == 4:
                rgb_frame = rgb_frame[:, :, :3]
            rgb_frame = np.ascontiguousarray(rgb_frame, dtype=np.uint8)

            # Detect faces using both dlib HOG (primary/upsampled) and Google MediaPipe, then union them
            dlib_locs = []
            if HAS_FACE_REC:
                try:
                    dlib_locs = face_recognition.face_locations(rgb_frame, number_of_times_to_upsample=1)
                except Exception:
                    pass
            mp_locs = []
            if HAS_MEDIAPIPE:
                try:
                    mp_locs = get_mediapipe_face_locations(rgb_frame)
                except Exception:
                    pass
            face_locations = union_face_locations(dlib_locs, mp_locs)

            count = len(face_locations)
            zone_breakdown[name] = count
            total_ai_headcount += count
        except Exception:
            zone_breakdown[name] = 0
            
    return {"zone_breakdown": zone_breakdown, "total_ai_headcount": total_ai_headcount}

@app.post("/verify")
def run_verify(req: VerifyRequest):
    verification_details = {}
    fallback_active = not HAS_FACE_REC
    
    known_encodings = []
    students_with_encodings = []
    if not fallback_active:
        for student in req.expected_students:
            if student.face_encoding:
                known_encodings.append(np.array(student.face_encoding))
                students_with_encodings.append(student)
            
    for zone in req.zones:
        name = zone.zone_name
        
        # 1. Resolve camera/video source URL
        if zone.camera_url and zone.camera_url.isdigit():
            cap_url = int(zone.camera_url)
        else:
            if zone.camera_url and os.path.exists(zone.camera_url):
                cap_url = zone.camera_url
            else:
                cap_url = os.path.join("..", "thusitha-backend", zone.camera_url) if zone.camera_url else ""

        img_filename = f"susp_sess_{req.session_id}_{name.replace(' ', '_')}.jpg"
        save_dir = os.path.join("..", "thusitha-backend", "uploads", "suspicious")
        os.makedirs(save_dir, exist_ok=True)
        save_path = os.path.join(save_dir, img_filename)

        details = {
            "matched_student_ids": [],
            "unknown_faces_count": 0,
            "total_faces_found": 0,
        }

        # 2. Open stream and sample up to 15 frames over 2-3 seconds of footage
        cap = cv2.VideoCapture(cap_url)
        if not cap.isOpened():
            verification_details[name] = details
            continue

        frames = []
        step = 4  # sample every 4 frames (speeds up CPU processing while capturing temporal variations)
        max_samples = 15
        
        while len(frames) < max_samples:
            for _ in range(step - 1):
                cap.grab()
            success, frame = cap.read()
            if not success:
                break
            frames.append(frame)
        cap.release()

        if not frames:
            verification_details[name] = details
            continue

        # Use middle frame as the representative frame to annotate and save
        representative_frame_idx = len(frames) // 2
        rep_frame = frames[representative_frame_idx].copy()

        # If biometrics engine is offline, save representative image and continue
        if fallback_active:
            cv2.imwrite(save_path, rep_frame)
            details["image_url"] = f"uploads/suspicious/{img_filename}"
            details["status"] = "offline"
            verification_details[name] = details
            continue

        # 3. Enhance contrast of representative frame
        try:
            lab = cv2.cvtColor(rep_frame, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            cl = clahe.apply(l)
            limg = cv2.merge((cl, a, b))
            enhanced_frame = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
        except Exception as e:
            logging.error(f"CLAHE contrast enhancement failed: {e}")
            enhanced_frame = rep_frame.copy()

        rgb_frame = cv2.cvtColor(enhanced_frame, cv2.COLOR_BGR2RGB)
        # Ensure image is exactly 8-bit RGB (3 channels) for dlib/face_recognition
        if len(rgb_frame.shape) == 2:
            rgb_frame = cv2.cvtColor(rgb_frame, cv2.COLOR_GRAY2RGB)
        elif len(rgb_frame.shape) == 3 and rgb_frame.shape[2] == 4:
            rgb_frame = rgb_frame[:, :, :3]
        rgb_frame = np.ascontiguousarray(rgb_frame, dtype=np.uint8)

        # 4. Get seat/face locations from the representative frame
        dlib_locs = []
        if HAS_FACE_REC:
            try:
                dlib_locs = face_recognition.face_locations(rgb_frame, number_of_times_to_upsample=1)
            except Exception as e:
                logging.error(f"dlib HOG detection failed: {e}")
                
        mp_locs = []
        if HAS_MEDIAPIPE:
            try:
                mp_locs = get_mediapipe_face_locations(rgb_frame)
            except Exception as e:
                logging.error(f"MediaPipe detection failed: {e}")
                
        face_locations = union_face_locations(dlib_locs, mp_locs)
        print(f"DEBUG Combined face detection: found {len(face_locations)} seats.")

        matched_ids = []
        unknown_faces = 0
        h_img, w_img, _ = rep_frame.shape

        # 5. Verify each detected face seat location across all 15 video frames
        for top, right, bottom, left in face_locations:
            fh = bottom - top
            fw = right - left
            
            face_encodings_for_this_seat = []
            
            for f in frames:
                # Crop the same coordinates from this frame (with 10% movement margin)
                margin_y = int(fh * 0.1)
                margin_x = int(fw * 0.1)
                t_crop = max(0, top - margin_y)
                b_crop = min(h_img, bottom + margin_y)
                l_crop = max(0, left - margin_x)
                r_crop = min(w_img, right + margin_x)
                
                face_crop = f[t_crop:b_crop, l_crop:r_crop]
                if face_crop.size == 0:
                    continue
                    
                # Normalize crop
                face_crop_rgb = cv2.cvtColor(face_crop, cv2.COLOR_BGR2RGB)
                if len(face_crop_rgb.shape) == 2:
                    face_crop_rgb = cv2.cvtColor(face_crop_rgb, cv2.COLOR_GRAY2RGB)
                elif len(face_crop_rgb.shape) == 3 and face_crop_rgb.shape[2] == 4:
                    face_crop_rgb = face_crop_rgb[:, :, :3]
                face_crop_rgb = np.ascontiguousarray(face_crop_rgb, dtype=np.uint8)
                
                # Extract encoding from crop
                crop_h, crop_w, _ = face_crop_rgb.shape
                crop_loc = [(0, crop_w, crop_h, 0)]
                try:
                    encs = face_recognition.face_encodings(face_crop_rgb, crop_loc)
                    if encs:
                        face_encodings_for_this_seat.append(encs[0])
                except Exception:
                    pass
            
            # Find best match across all sampled frames for this seat
            best_student = None
            min_distance = 999.0
            
            for enc in face_encodings_for_this_seat:
                if len(known_encodings) == 0:
                    break
                distances = face_recognition.face_distance(known_encodings, enc)
                best_idx = np.argmin(distances)
                dist = distances[best_idx]
                if dist < min_distance:
                    min_distance = dist
                    best_student = students_with_encodings[best_idx]
            
            # Draw results on the representative frame
            if best_student is not None and min_distance < 0.45:
                matched_ids.append(best_student.student_id)
                cv2.rectangle(rep_frame, (left, top), (right, bottom), (0, 255, 0), 2)
                label = f"{best_student.student_name} (ID: {best_student.student_id})"
                cv2.putText(rep_frame, label, (left, max(top - 10, 20)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            else:
                unknown_faces += 1
                cv2.rectangle(rep_frame, (left, top), (right, bottom), (0, 0, 255), 2)
                cv2.putText(rep_frame, "Unknown", (left, max(top - 10, 20)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

        # 5.5 Overlaid blue body feature (YOLOv8 headcount visual)
        if model is not None:
            try:
                results = model.predict(rep_frame, classes=[0], verbose=False)
                if results and len(results[0].boxes) > 0:
                    for box in results[0].boxes:
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        cv2.rectangle(rep_frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
                        cv2.putText(rep_frame, "Person", (x1, max(y1 - 10, 20)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
            except Exception as e:
                logging.error(f"YOLO headcount annotation overlay failed: {e}")

        # 6. Save representative annotated frame to disk
        cv2.imwrite(save_path, rep_frame)
        
        details["image_url"] = f"uploads/suspicious/{img_filename}"
        details["matched_student_ids"] = matched_ids
        details["unknown_faces_count"] = unknown_faces
        details["total_faces_found"] = len(face_locations)
        
        verification_details[name] = details
        
    return {
        "verification_details": verification_details,
        "fallback_active": fallback_active
    }

@app.post("/encode")
def run_encode(req: EncodeRequest):
    if not HAS_FACE_REC:
        return {"error": "face_recognition not installed", "fallback_active": True}
        
    try:
        # resolve path relative to backend folder since paths are coming from there
        abs_path = os.path.join("..", "thusitha-backend", req.image_path)
        img = face_recognition.load_image_file(abs_path)
        # Ensure image is exactly 8-bit RGB (3 channels) for dlib/face_recognition
        if len(img.shape) == 2:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
        elif len(img.shape) == 3 and img.shape[2] == 4:
            img = img[:, :, :3]
            
        if img.dtype != np.uint8:
            if np.issubdtype(img.dtype, np.floating):
                if img.max() <= 1.0:
                    img = (img * 255).astype(np.uint8)
                else:
                    img = img.astype(np.uint8)
            else:
                if img.max() > 255:
                    img = (img / 256).astype(np.uint8)
                else:
                    img = img.astype(np.uint8)
        img = np.ascontiguousarray(img)

        # Apply CLAHE local contrast enhancement to improve detection on diverse skin tones
        try:
            lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            cl = clahe.apply(l)
            limg = cv2.merge((cl, a, b))
            img = cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)
        except Exception as e:
            logging.error(f"CLAHE contrast enhancement failed during encoding: {e}")

        # Detect face locations using Google MediaPipe (primary) or fall back to HOG
        face_locations = []
        if HAS_MEDIAPIPE:
            try:
                face_locations = get_mediapipe_face_locations(img)
            except Exception as e:
                logging.error(f"MediaPipe encode detection failed: {e}")

        print(f"DEBUG run_encode: shape={img.shape}, dtype={img.dtype}, faces_found={len(face_locations)}")
        
        try:
            if face_locations:
                encs = face_recognition.face_encodings(img, face_locations)
            else:
                encs = face_recognition.face_encodings(img)
        except Exception as e:
            print(f"CRITICAL ERROR in face_encodings: shape={img.shape}, dtype={img.dtype}. Error: {e}")
            raise e
            
        if encs:
            return {"encoding": encs[0].tolist()}
        return {"error": "No face found in image"}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
