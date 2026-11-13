import sqlite3
import os
import json
from datetime import datetime

if os.environ.get("VERCEL"):
    DB_DIR = "/tmp/data"
    os.makedirs(DB_DIR, exist_ok=True)
    DB_PATH = os.path.join(DB_DIR, "candidates.db")
    bundled_db = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "candidates.db")
    if os.path.exists(bundled_db) and not os.path.exists(DB_PATH):
        import shutil
        shutil.copyfile(bundled_db, DB_PATH)
else:
    DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
    os.makedirs(DB_DIR, exist_ok=True)
    DB_PATH = os.path.join(DB_DIR, "candidates.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Candidates table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS candidates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        title TEXT,
        email TEXT,
        phone TEXT,
        location TEXT,
        experience_years REAL DEFAULT 0.0,
        primary_role TEXT NOT NULL,
        lca_score INTEGER DEFAULT 0,
        uiux_score INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Under Review',
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_type TEXT NOT NULL,
        raw_text TEXT,
        sections_json TEXT,
        scoring_details_json TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)
    
    # Audit & processing history table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS processing_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        candidate_id TEXT,
        file_name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        status TEXT NOT NULL,
        message TEXT NOT NULL,
        duration_ms INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    )
    """)
    
    # Job descriptions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS job_descriptions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        role_type TEXT NOT NULL,
        source_url TEXT,
        experience_required TEXT NOT NULL,
        location TEXT NOT NULL,
        responsibilities_json TEXT NOT NULL,
        qualifications_json TEXT NOT NULL,
        criteria_weights_json TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)
    
    # Ensure source_url column exists if table was created previously without it
    try:
        cursor.execute("ALTER TABLE job_descriptions ADD COLUMN source_url TEXT")
    except sqlite3.OperationalError:
        pass  # Column already exists
        
    # Check if job descriptions exist, if not seed default scraped ones
    cursor.execute("SELECT COUNT(*) FROM job_descriptions")
    if cursor.fetchone()[0] == 0:
        now = datetime.now().isoformat()
        
        lca_jd = {
            "id": "jd-lca-01",
            "title": "LCA Consultant",
            "role_type": "LCA Consultant",
            "source_url": "https://tally.so/r/9q5plp",
            "experience_required": "2 to 3 years",
            "location": "Chennai (onsite / relocate)",
            "responsibilities_json": json.dumps([
                "Collect, compile, and validate Life Cycle Inventory (LCI) data.",
                "Build LCI models using GaBi, SimaPro, or OpenLCA software.",
                "Document all LCA assumptions ensuring audit-readiness and traceability.",
                "Collaborate with Cross-Functional Teams (CFTs) on plant-level energy, resources, and logistics.",
                "Conduct public benchmarking against academic databases, industry reports, and regulatory filings.",
                "Ensure strict adherence to ISO 14040 and ISO 14044 standards."
            ]),
            "qualifications_json": json.dumps([
                "Bachelor's or Master's degree in Environmental Engineering, Chemical, or related sustainability discipline.",
                "2 to 3 years of experience running Life Cycle Assessment (LCA) projects independently.",
                "Hands-on expertise using either GaBi or SimaPro software.",
                "Completed at least 3 verified LCA / EPD projects.",
                "Knowledge of Environmental Product Declarations (EPD) and GHG emission accounting."
            ]),
            "criteria_weights_json": json.dumps([
                {"criterion": "LCA Project Experience", "weight": 25, "desc": "Completed LCA/EPD projects and industrial studies"},
                {"criterion": "GaBi / SimaPro Software", "weight": 25, "desc": "Demonstrated hands-on proficiency in GaBi, SimaPro, or OpenLCA"},
                {"criterion": "LCI & LCA Modelling", "weight": 20, "desc": "Inventory data modeling, emission factors, and mass balance"},
                {"criterion": "ISO 14040/14044 Standards", "weight": 15, "desc": "Compliance with international environmental management norms"},
                {"criterion": "Environmental Domain Knowledge", "weight": 15, "desc": "Degree in Environmental/Chemical engineering and ESG/EHS domain"}
            ]),
            "created_at": now
        }
        
        uiux_jd = {
            "id": "jd-uiux-02",
            "title": "UI/UX Design Intern",
            "role_type": "UI/UX Designer",
            "source_url": "https://tally.so/r/0QovpQ",
            "experience_required": "0 to 1 year",
            "location": "Remote",
            "responsibilities_json": json.dumps([
                "Design and develop engaging user interfaces for website and job board.",
                "Create high-fidelity interactive prototypes and design specifications using Figma.",
                "Conduct user research and usability testing to understand user behavior and psychology.",
                "Collaborate with cross-functional teams to align design solutions with business objectives.",
                "Maintain and expand cohesive design system, typography, and visual identity."
            ]),
            "qualifications_json": json.dumps([
                "Proficiency in UI/UX design principles and human-centered design methodologies.",
                "Hands-on experience with Figma, wireframing, and interactive prototyping tools.",
                "Strong understanding of user psychology, information architecture, and usability testing.",
                "Excellent aesthetic sense, visual composition, and attention to detail.",
                "0 to 1 year experience (recent graduates and career transitions welcome)."
            ]),
            "criteria_weights_json": json.dumps([
                {"criterion": "UI/UX Projects & Case Studies", "weight": 25, "desc": "Portfolio projects, website/mobile app designs, user flows"},
                {"criterion": "User Research & Psychology", "weight": 20, "desc": "User interviews, personas, usability testing, and behavior insights"},
                {"criterion": "Figma & Prototyping", "weight": 25, "desc": "High-fidelity interactive prototyping, auto-layout, design systems"},
                {"criterion": "Visual Design & Aesthetics", "weight": 15, "desc": "Typography, color palettes, spacing, UI kits, and visual identity"},
                {"criterion": "Usability & Interaction Design", "weight": 15, "desc": "Micro-interactions, accessibility (WCAG), and responsive UX"}
            ]),
            "created_at": now
        }
        
        cursor.execute("""
        INSERT INTO job_descriptions (id, title, role_type, source_url, experience_required, location, responsibilities_json, qualifications_json, criteria_weights_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            lca_jd["id"], lca_jd["title"], lca_jd["role_type"], lca_jd["source_url"], lca_jd["experience_required"], lca_jd["location"],
            lca_jd["responsibilities_json"], lca_jd["qualifications_json"], lca_jd["criteria_weights_json"],
            lca_jd["created_at"]
        ))
        
        cursor.execute("""
        INSERT INTO job_descriptions (id, title, role_type, source_url, experience_required, location, responsibilities_json, qualifications_json, criteria_weights_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            uiux_jd["id"], uiux_jd["title"], uiux_jd["role_type"], uiux_jd["source_url"], uiux_jd["experience_required"], uiux_jd["location"],
            uiux_jd["responsibilities_json"], uiux_jd["qualifications_json"], uiux_jd["criteria_weights_json"],
            uiux_jd["created_at"]
        ))
    else:
        # Update existing records to ensure source_url and 2-3 years clean text
        cursor.execute("""
        UPDATE job_descriptions
        SET source_url = 'https://tally.so/r/9q5plp', experience_required = '2 to 3 years'
        WHERE id = 'jd-lca-01'
        """)
        cursor.execute("""
        UPDATE job_descriptions
        SET source_url = 'https://tally.so/r/0QovpQ', experience_required = '0 to 1 year'
        WHERE id = 'jd-uiux-02'
        """)
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database schema updated successfully.")
