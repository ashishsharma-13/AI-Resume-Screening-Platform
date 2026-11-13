import os
import re
from datetime import datetime
from typing import Dict, Any, List

def parse_date_range(text: str) -> float:
    """
    Estimates years of experience from date strings like:
    'July 2023 – Present', 'Jan 2021 – Mar 2024', '2019 - 2023', '3+ years'
    """
    current_year = 2026.3
    
    # Check for direct mentions like "3+ years", "4 years of experience"
    direct_match = re.search(r'(\d+(?:\.\d+)?)\s*\+?\s*years?\s*(?:of)?\s*experience', text, re.I)
    if direct_match:
        try:
            return float(direct_match.group(1))
        except ValueError:
            pass
            
    # Search for date ranges like Month Year - Month Year or Year - Year
    month_map = {
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    }
    
    pattern = r'([a-zA-Z]{3,9}\s+)?(20\d\d)\s*[–\-—to]+\s*([a-zA-Z]{3,9}\s+)?(20\d\d|present|current)'
    matches = re.finditer(pattern, text, re.I)
    
    total_months = 0
    intervals = []
    
    for m in matches:
        start_month_str = m.group(1).strip()[:3].lower() if m.group(1) else 'jan'
        start_year = int(m.group(2))
        start_m = month_map.get(start_month_str, 1)
        
        end_month_str = m.group(3).strip()[:3].lower() if m.group(3) else 'dec'
        end_val = m.group(4).strip().lower()
        if 'present' in end_val or 'current' in end_val:
            end_year = 2026
            end_m = 3
        else:
            try:
                end_year = int(end_val)
                end_m = month_map.get(end_month_str, 12)
            except ValueError:
                end_year = start_year
                end_m = start_m
                
        start_tot = start_year * 12 + start_m
        end_tot = end_year * 12 + end_m
        if end_tot >= start_tot and (start_tot > 2010 * 12):
            intervals.append((start_tot, end_tot))
            
    if not intervals:
        return 0.0
        
    # Merge overlapping intervals
    intervals.sort()
    merged = []
    for start, end in intervals:
        if not merged:
            merged.append([start, end])
        else:
            if start <= merged[-1][1]:
                merged[-1][1] = max(merged[-1][1], end)
            else:
                merged.append([start, end])
                
    total_m = sum(end - start for start, end in merged)
    return round(total_m / 12.0, 1)

def extract_docx(file_path: str) -> Dict[str, Any]:
    import docx
    
    try:
        doc = docx.Document(file_path)
    except Exception as e:
        return {
            "is_valid": False,
            "error": f"Failed to open DOCX file: {str(e)}",
            "raw_text": "",
            "paragraphs": [],
            "tables": []
        }
        
    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
    
    # Extract table rows as text
    table_lines = []
    for table in doc.tables:
        for row in table.rows:
            cells = [c.text.strip() for c in row.cells if c.text.strip()]
            if cells:
                table_lines.append(" | ".join(cells))
                
    raw_text = "\n".join(paragraphs + table_lines).strip()
    
    if not raw_text:
        return {
            "is_valid": False,
            "error": "The resume document contains no readable text or structured content.",
            "raw_text": "",
            "paragraphs": [],
            "tables": []
        }
        
    return {
        "is_valid": True,
        "error": None,
        "raw_text": raw_text,
        "paragraphs": paragraphs,
        "table_lines": table_lines
    }

def extract_pdf(file_path: str) -> Dict[str, Any]:
    try:
        import pymupdf as fitz
    except ImportError:
        import fitz
        
    try:
        doc = fitz.open(file_path)
        paragraphs = []
        for page in doc:
            txt = page.get_text()
            lines = [l.strip() for l in txt.split("\n") if l.strip()]
            paragraphs.extend(lines)
            
        raw_text = "\n".join(paragraphs).strip()
        if not raw_text:
            return {
                "is_valid": False,
                "error": "PDF is empty or contains non-extractable raster imagery without text.",
                "raw_text": "",
                "paragraphs": []
            }
        return {
            "is_valid": True,
            "error": None,
            "raw_text": raw_text,
            "paragraphs": paragraphs,
            "table_lines": []
        }
    except Exception as e:
        return {
            "is_valid": False,
            "error": f"Failed to read PDF file: {str(e)}",
            "raw_text": "",
            "paragraphs": []
        }

def parse_resume(file_path: str) -> Dict[str, Any]:
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == ".docx":
        res = extract_docx(file_path)
    elif ext == ".pdf":
        res = extract_pdf(file_path)
    else:
        return {
            "is_valid": False,
            "error": f"Unsupported format '{ext}'. Only .docx and .pdf are supported.",
            "name": "Unknown",
            "title": "Unspecified",
            "raw_text": "",
            "sections": {},
            "skills": []
        }
        
    if not res["is_valid"]:
        base_name = os.path.basename(file_path)
        return {
            "is_valid": False,
            "error": res["error"],
            "name": f"Unknown ({base_name})",
            "title": "Unreadable / Empty Document",
            "email": "N/A",
            "phone": "N/A",
            "location": "N/A",
            "experience_years": 0.0,
            "raw_text": "",
            "sections": {},
            "skills": []
        }
        
    paras = res["paragraphs"]
    raw_text = res["raw_text"]
    
    # Extract candidate name & title
    name = paras[0] if len(paras) > 0 else "Unknown"
    title = paras[1] if len(paras) > 1 else "Professional"
    if len(name) > 60:
        name = name[:60]
        
    # Extract email and phone
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', raw_text)
    email = email_match.group(0) if email_match else "Not provided"
    
    phone_match = re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3}[-.\s]?\d{3,4}', raw_text)
    phone = phone_match.group(0) if phone_match else "Not provided"
    
    # Location
    loc_match = re.search(r'(?:Location|Address|City):\s*([^\n\r]+)', raw_text, re.I)
    location = loc_match.group(1).strip() if loc_match else "India"
    
    # Split into sections
    section_map = {
        "experience": [],
        "projects": [],
        "education": [],
        "certifications": [],
        "summary": [],
        "skills": []
    }
    
    current_key = "summary"
    
    known_headers = {
        "experience": ["experience", "work experience", "professional experience", "employment history"],
        "projects": ["projects", "projects / deliverables", "academic projects", "key projects"],
        "education": ["education", "academic background", "qualifications"],
        "certifications": ["certifications & licenses", "certifications", "licenses", "courses"],
        "summary": ["professional summary", "summary", "about me", "profile"],
        "skills": ["core skills", "skills", "technical skills", "key skills", "tools & technologies"]
    }
    
    for p in paras:
        p_clean = p.strip()
        p_lower = p_clean.lower()
        
        matched_sec = None
        for sec, triggers in known_headers.items():
            for tr in triggers:
                if p_lower == tr or p_lower.startswith(tr + " —") or p_lower.startswith(tr + " -"):
                    matched_sec = sec
                    break
            if matched_sec:
                break
                
        if matched_sec:
            current_key = matched_sec
        else:
            if current_key:
                section_map[current_key].append(p_clean)
                
    # Flatten sections text
    sections_text = {k: "\n".join(v) for k, v in section_map.items()}
    
    # Experience calculation
    exp_years = parse_date_range(sections_text["experience"] or raw_text)
    
    # Skills extraction from skills section or text
    extracted_skills = []
    skill_keywords = [
        "Figma", "UI/UX", "User Research", "Wireframing", "Prototyping",
        "Design Systems", "Usability Testing", "Information Architecture", "Visual Design",
        "Interaction Design", "Adobe XD", "Illustrator", "Photoshop",
        "Life Cycle Assessment", "LCA", "GaBi", "SimaPro", "OpenLCA", "EPD",
        "ISO 14040", "ISO 14044", "ISO 14001", "Carbon Footprint", "GHG Accounting",
        "EIA", "EHS", "Sustainability Reporting", "BRSR", "Waste Management",
        "Python", "SQL", "Power BI", "Excel", "Data Analysis", "AutoCAD"
    ]
    
    for sk in skill_keywords:
        pat = r'\b' + re.escape(sk) + r'\b'
        if re.search(pat, raw_text, re.I):
            extracted_skills.append(sk)
            
    return {
        "is_valid": True,
        "error": None,
        "name": name,
        "title": title,
        "email": email,
        "phone": phone,
        "location": location,
        "experience_years": exp_years,
        "raw_text": raw_text,
        "sections": sections_text,
        "skills": extracted_skills
    }

