import os
import glob
import json
import time
from datetime import datetime
from database import init_db, get_connection
from parser import parse_resume
from scoring import score_and_classify

def seed_candidates():
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    
    primary_dir = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "data", "resumes"))
    if os.path.exists(primary_dir):
        resumes_dir = primary_dir
    else:
        resumes_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "resumes")
    files = sorted(glob.glob(os.path.join(resumes_dir, "*.docx")) + glob.glob(os.path.join(resumes_dir, "*.pdf")))
    
    print(f"Found {len(files)} resumes to process from {resumes_dir}...")
    
    inserted_count = 0
    now = datetime.now().isoformat()
    
    for idx, fpath in enumerate(files, start=1):
        t0 = time.time()
        cand_id = f"CAND-{idx:03d}"
        file_name = os.path.basename(fpath)
        file_ext = os.path.splitext(fpath)[1].lower().replace(".", "")
        
        # Parse resume
        parsed = parse_resume(fpath)
        
        # Score and classify directly from actual JD requirements
        evaluation = score_and_classify(parsed)
        
        duration_ms = int((time.time() - t0) * 1000)
        
        sections_json = json.dumps(parsed.get("sections", {}))
        
        scoring_details = {
            "confidence": evaluation.get("confidence", "Moderate"),
            "reasoning": evaluation.get("reasoning", ""),
            "lca_details": evaluation.get("lca_details", {}),
            "uiux_details": evaluation.get("uiux_details", {}),
            "strengths": evaluation.get("strengths", []),
            "missing_qualifications": evaluation.get("missing_qualifications", []),
            "skills": parsed.get("skills", [])
        }
        scoring_details_json = json.dumps(scoring_details)
        
        status = "Under Review"
        
        cursor.execute("""
        INSERT INTO candidates (
            id, name, title, email, phone, location, experience_years,
            primary_role, lca_score, uiux_score, status,
            file_name, file_path, file_type, raw_text,
            sections_json, scoring_details_json,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            cand_id,
            parsed.get("name", "Unknown"),
            parsed.get("title", ""),
            parsed.get("email", ""),
            parsed.get("phone", ""),
            parsed.get("location", "India"),
            parsed.get("experience_years", 0.0),
            evaluation.get("primary_role", "Neither / Uncertain"),
            evaluation.get("lca_score", 0),
            evaluation.get("uiux_score", 0),
            status,
            file_name,
            fpath,
            file_ext,
            parsed.get("raw_text", ""),
            sections_json,
            scoring_details_json,
            now,
            now
        ))
        
        log_status = "Success" if parsed.get("is_valid", True) else "Warning"
        log_msg = f"Processed {file_name} -> Classified as {evaluation.get('primary_role')} (LCA: {evaluation.get('lca_score')}, UI/UX: {evaluation.get('uiux_score')})"
        if not parsed.get("is_valid", True):
            log_msg = f"Failed extracting {file_name}: {parsed.get('error')}"
            
        cursor.execute("""
        INSERT INTO processing_logs (candidate_id, file_name, file_type, status, message, duration_ms, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (cand_id, file_name, file_ext, log_status, log_msg, duration_ms, now))
        
        inserted_count += 1
        
    conn.commit()
    conn.close()
    print(f"Successfully processed and seeded {inserted_count} candidates into SQLite!")

if __name__ == "__main__":
    seed_candidates()
