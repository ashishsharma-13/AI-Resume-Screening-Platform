import os
import json
import shutil
import time
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

try:
    from .database import init_db, get_connection
    from .parser import parse_resume
    from .scoring import score_and_classify
    from .scraper import scrape_job_description_url
except (ImportError, ValueError):
    from database import init_db, get_connection
    from parser import parse_resume
    from scoring import score_and_classify
    from scraper import scrape_job_description_url

app = FastAPI(
    title="Growth For Impact – AI Resume Screening System",
    description="Recruitment & AI Resume Screening System with Job Link Scraping & Management",
    version="1.1.0"
)

# Allowed CORS origins (local dev, Vercel deployments, custom domains)
CORS_ORIGINS_ENV = os.environ.get("CORS_ORIGINS", "")
custom_origins = [o.strip() for o in CORS_ORIGINS_ENV.split(",") if o.strip()]

default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://growthforimpact.co",
]
all_allowed_origins = list(set(default_origins + custom_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=all_allowed_origins,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()
    try:
        conn = get_connection()
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM candidates")
        cand_count = c.fetchone()[0]
        conn.close()
        if cand_count == 0:
            try:
                from .seed_data import seed_candidates
            except (ImportError, ValueError):
                from seed_data import seed_candidates
            seed_candidates()
    except Exception as e:
        print("Auto-seed check notice:", e)

PRIMARY_DATA_RESUMES = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "data", "resumes"))
if os.environ.get("VERCEL"):
    RESUMES_DIR = "/tmp/resumes"
    os.makedirs(RESUMES_DIR, exist_ok=True)
elif os.path.exists(PRIMARY_DATA_RESUMES):
    RESUMES_DIR = PRIMARY_DATA_RESUMES
else:
    RESUMES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "resumes")
    os.makedirs(RESUMES_DIR, exist_ok=True)

class StatusUpdate(BaseModel):
    status: str

class ScrapeRequest(BaseModel):
    url: str

class JobDescriptionCreate(BaseModel):
    title: str
    role_type: str = "General"
    source_url: Optional[str] = None
    location: str = "Remote"
    experience_required: str = "0 to 1 year"
    responsibilities: List[str] = []
    qualifications: List[str] = []
    criteria_weights: List[Dict[str, Any]] = []

class JobDescriptionUpdate(BaseModel):
    title: Optional[str] = None
    role_type: Optional[str] = None
    source_url: Optional[str] = None
    location: Optional[str] = None
    experience_required: Optional[str] = None
    responsibilities: Optional[List[str]] = None
    qualifications: Optional[List[str]] = None
    criteria_weights: Optional[List[Dict[str, Any]]] = None

@app.get("/api/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    conn = get_connection()
    c = conn.cursor()
    
    c.execute("SELECT COUNT(*) FROM candidates")
    total_candidates = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM candidates WHERE primary_role = 'LCA Consultant'")
    lca_count = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM candidates WHERE primary_role = 'UI/UX Designer'")
    uiux_count = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM candidates WHERE primary_role = 'Both'")
    both_count = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM candidates WHERE primary_role = 'Neither / Uncertain'")
    uncertain_count = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM candidates WHERE status = 'Shortlisted'")
    shortlisted_count = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM candidates WHERE status = 'Under Review'")
    under_review_count = c.fetchone()[0]
    
    c.execute("SELECT ROUND(AVG(lca_score), 1) FROM candidates WHERE primary_role = 'LCA Consultant'")
    avg_lca_val = c.fetchone()[0] or 0.0
    
    c.execute("SELECT ROUND(AVG(uiux_score), 1) FROM candidates WHERE primary_role = 'UI/UX Designer'")
    avg_uiux_val = c.fetchone()[0] or 0.0
    
    c.execute("SELECT COUNT(*) FROM job_descriptions")
    job_count = c.fetchone()[0]
    
    # Recent candidates
    c.execute("""
    SELECT id, name, title, primary_role, lca_score, uiux_score, status, experience_years, created_at
    FROM candidates
    ORDER BY created_at DESC, id DESC
    LIMIT 6
    """)
    recent_candidates = [dict(row) for row in c.fetchall()]
    
    # Top 3 LCA and UIUX
    c.execute("""
    SELECT id, name, title, primary_role, lca_score, uiux_score, status
    FROM candidates
    ORDER BY lca_score DESC
    LIMIT 3
    """)
    top_lca = [dict(row) for row in c.fetchall()]
    
    c.execute("""
    SELECT id, name, title, primary_role, lca_score, uiux_score, status
    FROM candidates
    ORDER BY uiux_score DESC
    LIMIT 3
    """)
    top_uiux = [dict(row) for row in c.fetchall()]
    
    conn.close()
    
    return {
        "total_candidates": total_candidates,
        "lca_count": lca_count,
        "uiux_count": uiux_count,
        "both_count": both_count,
        "uncertain_count": uncertain_count,
        "shortlisted_count": shortlisted_count,
        "under_review_count": under_review_count,
        "avg_lca_score": avg_lca_val,
        "avg_uiux_score": avg_uiux_val,
        "active_jobs_count": job_count,
        "recent_candidates": recent_candidates,
        "top_lca": top_lca,
        "top_uiux": top_uiux
    }

@app.get("/api/candidates")
def list_candidates(
    search: Optional[str] = None,
    role: Optional[str] = "All",
    status: Optional[str] = "All",
    sort_by: Optional[str] = "id",
    sort_order: Optional[str] = "asc"
):
    conn = get_connection()
    c = conn.cursor()
    
    query = """
    SELECT id, name, title, email, phone, location, experience_years,
           primary_role, lca_score, uiux_score, status, file_name, file_type,
           scoring_details_json, created_at
    FROM candidates
    WHERE 1=1
    """
    params = []
    
    if search and search.strip():
        term = f"%{search.strip()}%"
        query += " AND (name LIKE ? OR title LIKE ? OR id LIKE ? OR raw_text LIKE ?)"
        params.extend([term, term, term, term])
        
    if role and role != "All":
        query += " AND primary_role = ?"
        params.append(role)
        
    if status and status != "All":
        query += " AND status = ?"
        params.append(status)
        
    allowed_sorts = {
        "id": "id",
        "name": "name",
        "lca_score": "lca_score",
        "uiux_score": "uiux_score",
        "experience_years": "experience_years",
        "created_at": "created_at"
    }
    col = allowed_sorts.get(sort_by, "id")
    direction = "DESC" if sort_order.lower() == "desc" else "ASC"
    
    query += f" ORDER BY {col} {direction}"
    
    c.execute(query, params)
    rows = c.fetchall()
    
    results = []
    for row in rows:
        item = dict(row)
        score_details = json.loads(item.get("scoring_details_json") or "{}")
        item["skills"] = score_details.get("skills", [])
        item["confidence"] = score_details.get("confidence", "Moderate")
        item["strengths"] = score_details.get("strengths", [])
        item["missing_qualifications"] = score_details.get("missing_qualifications", [])
        results.append(item)
        
    conn.close()
    return {"total": len(results), "candidates": results}

@app.get("/api/candidates/{candidate_id}")
def get_candidate(candidate_id: str):
    conn = get_connection()
    c = conn.cursor()
    
    c.execute("SELECT * FROM candidates WHERE id = ?", (candidate_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Candidate {candidate_id} not found")
        
    item = dict(row)
    item["sections"] = json.loads(item.get("sections_json") or "{}")
    item["scoring_details"] = json.loads(item.get("scoring_details_json") or "{}")
    
    conn.close()
    return item

@app.patch("/api/candidates/{candidate_id}/status")
def update_candidate_status(candidate_id: str, update: StatusUpdate):
    valid_statuses = ["Under Review", "Shortlisted", "Rejected"]
    if update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Choose from: {valid_statuses}")
        
    conn = get_connection()
    c = conn.cursor()
    now = datetime.now().isoformat()
    
    c.execute("UPDATE candidates SET status = ?, updated_at = ? WHERE id = ?", (update.status, now, candidate_id))
    if c.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Candidate {candidate_id} not found")
        
    conn.commit()
    conn.close()
    return {"success": True, "id": candidate_id, "status": update.status, "updated_at": now}

@app.get("/api/rankings")
def get_rankings(role: str = Query("lca", pattern="^(lca|uiux)$")):
    conn = get_connection()
    c = conn.cursor()
    
    score_col = "lca_score" if role == "lca" else "uiux_score"
    role_title = "LCA Consultant" if role == "lca" else "UI/UX Designer"
    
    c.execute(f"""
    SELECT id, name, title, primary_role, lca_score, uiux_score, status,
           experience_years, scoring_details_json
    FROM candidates
    ORDER BY {score_col} DESC, experience_years DESC
    """)
    rows = c.fetchall()
    
    rankings = []
    for rank, row in enumerate(rows, start=1):
        item = dict(row)
        score_details = json.loads(item.get("scoring_details_json") or "{}")
        item["rank"] = rank
        item["score"] = item[score_col]
        item["skills"] = score_details.get("skills", [])
        item["confidence"] = score_details.get("confidence", "Moderate")
        item["strengths"] = score_details.get("strengths", [])
        item["missing_qualifications"] = score_details.get("missing_qualifications", [])
        
        if role == "lca":
            item["criteria_breakdown"] = score_details.get("lca_details", {}).get("criteria", [])
        else:
            item["criteria_breakdown"] = score_details.get("uiux_details", {}).get("criteria", [])
            
        rankings.append(item)
        
    conn.close()
    return {
        "role": role,
        "role_title": role_title,
        "total": len(rankings),
        "rankings": rankings
    }

@app.post("/api/upload")
async def upload_resume(file: UploadFile = File(...)):
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".docx", ".pdf"]:
        raise HTTPException(status_code=400, detail="Only .docx and .pdf files are supported")
        
    t0 = time.time()
    now = datetime.now().isoformat()
    
    safe_filename = f"{int(time.time())}_{filename}"
    saved_path = os.path.join(RESUMES_DIR, safe_filename)
    
    with open(saved_path, "wb") as f_out:
        shutil.copyfileobj(file.file, f_out)
        
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM candidates")
    cand_num = c.fetchone()[0] + 1
    candidate_id = f"CAND-{cand_num:03d}"
    
    parsed = parse_resume(saved_path)
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
    
    c.execute("""
    INSERT INTO candidates (
        id, name, title, email, phone, location, experience_years,
        primary_role, lca_score, uiux_score, status,
        file_name, file_path, file_type, raw_text,
        sections_json, scoring_details_json,
        created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        candidate_id,
        parsed.get("name", filename),
        parsed.get("title", "New Applicant"),
        parsed.get("email", ""),
        parsed.get("phone", ""),
        parsed.get("location", "India"),
        parsed.get("experience_years", 0.0),
        evaluation.get("primary_role", "Neither / Uncertain"),
        evaluation.get("lca_score", 0),
        evaluation.get("uiux_score", 0),
        "Under Review",
        filename,
        saved_path,
        ext.replace(".", ""),
        parsed.get("raw_text", ""),
        sections_json,
        scoring_details_json,
        now,
        now
    ))
    
    log_status = "Success" if parsed.get("is_valid", True) else "Warning"
    log_msg = f"Uploaded and processed {filename} -> {evaluation.get('primary_role')} (LCA: {evaluation.get('lca_score')}, UI/UX: {evaluation.get('uiux_score')})"
    if not parsed.get("is_valid", True):
        log_msg = f"Failed extracting {filename}: {parsed.get('error')}"
        
    c.execute("""
    INSERT INTO processing_logs (candidate_id, file_name, file_type, status, message, duration_ms, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (candidate_id, filename, ext.replace(".", ""), log_status, log_msg, duration_ms, now))
    
    conn.commit()
    conn.close()
    
    return {
        "success": True,
        "candidate_id": candidate_id,
        "file_name": filename,
        "primary_role": evaluation.get("primary_role"),
        "lca_score": evaluation.get("lca_score"),
        "uiux_score": evaluation.get("uiux_score"),
        "duration_ms": duration_ms
    }

# ==========================================
# JOB DESCRIPTION MANAGEMENT & SCRAPING
# ==========================================

@app.get("/api/job-descriptions")
def get_job_descriptions():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM job_descriptions ORDER BY created_at ASC")
    rows = c.fetchall()
    
    jds = []
    for r in rows:
        item = dict(r)
        item["responsibilities"] = json.loads(item["responsibilities_json"])
        item["qualifications"] = json.loads(item["qualifications_json"])
        item["criteria_weights"] = json.loads(item["criteria_weights_json"])
        jds.append(item)
        
    conn.close()
    return {"job_descriptions": jds}

@app.post("/api/job-descriptions/scrape")
def scrape_job_link_endpoint(req: ScrapeRequest):
    if not req.url or not req.url.startswith("http"):
        raise HTTPException(status_code=400, detail="Please provide a valid web URL starting with http:// or https://")
    try:
        data = scrape_job_description_url(req.url)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scrape job link: {str(e)}")

@app.post("/api/job-descriptions")
def create_job_description(jd: JobDescriptionCreate):
    conn = get_connection()
    c = conn.cursor()
    
    new_id = f"jd-{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()
    
    resp_json = json.dumps(jd.responsibilities)
    qual_json = json.dumps(jd.qualifications)
    weights_json = json.dumps(jd.criteria_weights)
    
    c.execute("""
    INSERT INTO job_descriptions (id, title, role_type, source_url, experience_required, location, responsibilities_json, qualifications_json, criteria_weights_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        new_id, jd.title, jd.role_type, jd.source_url or "", jd.experience_required, jd.location,
        resp_json, qual_json, weights_json, now
    ))
    
    conn.commit()
    conn.close()
    return {"success": True, "id": new_id, "message": f"Job description '{jd.title}' created successfully."}

@app.put("/api/job-descriptions/{job_id}")
def update_job_description(job_id: str, jd: JobDescriptionUpdate):
    conn = get_connection()
    c = conn.cursor()
    
    c.execute("SELECT * FROM job_descriptions WHERE id = ?", (job_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Job description not found")
        
    curr = dict(row)
    title = jd.title if jd.title is not None else curr["title"]
    role_type = jd.role_type if jd.role_type is not None else curr["role_type"]
    source_url = jd.source_url if jd.source_url is not None else curr["source_url"]
    location = jd.location if jd.location is not None else curr["location"]
    experience_required = jd.experience_required if jd.experience_required is not None else curr["experience_required"]
    
    resp_json = json.dumps(jd.responsibilities) if jd.responsibilities is not None else curr["responsibilities_json"]
    qual_json = json.dumps(jd.qualifications) if jd.qualifications is not None else curr["qualifications_json"]
    weights_json = json.dumps(jd.criteria_weights) if jd.criteria_weights is not None else curr["criteria_weights_json"]
    
    c.execute("""
    UPDATE job_descriptions
    SET title = ?, role_type = ?, source_url = ?, location = ?, experience_required = ?,
        responsibilities_json = ?, qualifications_json = ?, criteria_weights_json = ?
    WHERE id = ?
    """, (title, role_type, source_url, location, experience_required, resp_json, qual_json, weights_json, job_id))
    
    conn.commit()
    conn.close()
    return {"success": True, "id": job_id, "message": "Job description updated successfully."}

@app.delete("/api/job-descriptions/{job_id}")
def delete_job_description(job_id: str):
    conn = get_connection()
    c = conn.cursor()
    
    c.execute("SELECT COUNT(*) FROM job_descriptions")
    count = c.fetchone()[0]
    if count <= 1:
        conn.close()
        raise HTTPException(status_code=400, detail="Cannot delete the last remaining job description. At least one role is required.")
        
    c.execute("DELETE FROM job_descriptions WHERE id = ?", (job_id,))
    if c.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Job description not found")
        
    conn.commit()
    conn.close()
    return {"success": True, "id": job_id, "message": "Job description deleted successfully."}

# ==========================================
# ANALYTICS & AUDIT LOGS
# ==========================================

@app.get("/api/analytics")
def get_analytics():
    conn = get_connection()
    c = conn.cursor()
    
    c.execute("SELECT lca_score, uiux_score, primary_role, experience_years, scoring_details_json FROM candidates")
    rows = c.fetchall()
    
    total = len(rows)
    lca_bins = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}
    uiux_bins = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}
    roles_dist = {"LCA Consultant": 0, "UI/UX Designer": 0, "Both": 0, "Neither / Uncertain": 0}
    exp_bins = {"0-1 yr": 0, "1-3 yrs": 0, "3-5 yrs": 0, "5+ yrs": 0}
    skills_counter = {}
    
    for r in rows:
        lca = r["lca_score"]
        uiux = r["uiux_score"]
        role = r["primary_role"]
        exp = r["experience_years"]
        
        def bin_score(s):
            if s <= 20: return "0-20"
            if s <= 40: return "21-40"
            if s <= 60: return "41-60"
            if s <= 80: return "61-80"
            return "81-100"
            
        lca_bins[bin_score(lca)] += 1
        uiux_bins[bin_score(uiux)] += 1
        roles_dist[role] = roles_dist.get(role, 0) + 1
        
        if exp <= 1.0: exp_bins["0-1 yr"] += 1
        elif exp <= 3.0: exp_bins["1-3 yrs"] += 1
        elif exp <= 5.0: exp_bins["3-5 yrs"] += 1
        else: exp_bins["5+ yrs"] += 1
        
        details = json.loads(r["scoring_details_json"] or "{}")
        for sk in details.get("skills", []):
            skills_counter[sk] = skills_counter.get(sk, 0) + 1
            
    top_skills = sorted([{"skill": k, "count": v} for k, v in skills_counter.items()], key=lambda x: x["count"], reverse=True)[:10]
    
    conn.close()
    return {
        "total_resumes": total,
        "lca_score_distribution": lca_bins,
        "uiux_score_distribution": uiux_bins,
        "role_distribution": roles_dist,
        "experience_distribution": exp_bins,
        "top_skills": top_skills
    }

@app.get("/api/processing-history")
def get_processing_history():
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    SELECT id, candidate_id, file_name, file_type, status, message, duration_ms, created_at
    FROM processing_logs
    ORDER BY id DESC
    LIMIT 100
    """)
    logs = [dict(row) for row in c.fetchall()]
    conn.close()
    return {"total_logs": len(logs), "logs": logs}

@app.get("/api/resumes/{filename}")
def download_resume(filename: str):
    fpath = os.path.join(RESUMES_DIR, filename)
    if not os.path.exists(fpath) and os.path.exists(PRIMARY_DATA_RESUMES):
        fpath = os.path.join(PRIMARY_DATA_RESUMES, filename)
    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail="Resume file not found")
    return FileResponse(fpath, filename=filename)

# Mount frontend dist static files if built
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    from fastapi.staticfiles import StaticFiles
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="static")
