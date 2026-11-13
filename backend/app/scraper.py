import urllib.request
import re
from typing import Dict, Any, List
from bs4 import BeautifulSoup

def scrape_job_description_url(url: str) -> Dict[str, Any]:
    """
    Fetches and parses a job description URL (Tally forms, job posts, etc.)
    Extracts title, location, experience requirements, responsibilities, and qualifications.
    """
    url = url.strip()
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    )
    
    html = urllib.request.urlopen(req, timeout=12).read().decode("utf-8", errors="ignore")
    soup = BeautifulSoup(html, "html.parser")
    
    # Extract Title
    title = soup.title.string.strip() if soup.title and soup.title.string else "New Job Role"
    title = re.sub(r"\s*\|\s*Tally.*", "", title, flags=re.I).strip()
    title = re.sub(r"Page \d+ of \d+", "", title, flags=re.I).strip()
    
    # Clean non-content elements
    for s in soup(["script", "style", "svg", "noscript", "meta"]):
        s.decompose()
        
    text_content = soup.get_text("\n")
    lines = [line.strip() for line in text_content.split("\n") if line.strip()]
    
    # Identify Location
    location = "Remote / Onsite"
    for idx, line in enumerate(lines):
        if re.search(r"^Location:?", line, re.I):
            if idx + 1 < len(lines):
                location = lines[idx + 1].strip()
            elif ":" in line:
                location = line.split(":", 1)[1].strip()
            break
        elif any(loc in line.lower() for loc in ["chennai", "remote", "pune", "bangalore", "mumbai", "delhi", "hyderabad"]):
            if len(line) < 40 and not any(w in line.lower() for w in ["about", "consultancy", "leading"]):
                location = line
                break
                
    # Identify Experience Required
    exp_req = "Not specified"
    for line in lines:
        exp_m = re.search(r"(\d+\s*(?:to|-)\s*\d+\s*years?|\d+\+?\s*years?|\d+\s*-\s*\d+\s*year)", line, re.I)
        if exp_m and any(w in line.lower() for w in ["experience", "consultant", "role", "must have", "open to"]):
            exp_req = exp_m.group(1).strip()
            break
            
    # Extract Responsibilities & Qualifications
    responsibilities = []
    qualifications = []
    
    current_section = "general"
    for line in lines:
        lower = line.lower()
        if any(h in lower for h in ["key responsibilities", "responsibilities", "what you'll do", "what you will do"]):
            current_section = "responsibilities"
            continue
        elif any(h in lower for h in ["expected qualifications", "qualifications", "requirements", "mandatory requirements", "skills and tools"]):
            current_section = "qualifications"
            continue
        elif any(h in lower for h in ["about the organization", "about us", "role overview", "what makes this role special", "compensation", "apply"]):
            current_section = "other"
            continue
            
        clean_item = line.lstrip("•-* \t").strip()
        if len(clean_item) < 15 or len(clean_item) > 300:
            continue
            
        if current_section == "responsibilities":
            if clean_item not in responsibilities:
                responsibilities.append(clean_item)
        elif current_section == "qualifications":
            if clean_item not in qualifications:
                qualifications.append(clean_item)
                
    # Fallback if structure didn't capture bullet items
    if not responsibilities:
        bullet_lines = [l.lstrip("•-* \t") for l in lines if (l.startswith("-") or l.startswith("*") or l.startswith("•")) and len(l) > 20]
        responsibilities = bullet_lines[:5] if bullet_lines else [
            "Execute key operational and project deliverables aligned with role scope.",
            "Collaborate with cross-functional teams and maintain quality standards."
        ]
        
    if not qualifications:
        qualifications = [
            f"Relevant experience in the required domain ({exp_req}).",
            "Proficiency with industry standard software, methods, and communication."
        ]
        
    # Suggested role type and default criteria weights
    is_lca = bool(re.search(r"\b(lca|life\s*cycle|sustainability|environmental)\b", title.lower() + " " + text_content.lower()))
    is_design = bool(re.search(r"\b(ui|ux|design|figma|product\s*designer)\b", title.lower() + " " + text_content.lower()))
    
    if is_lca:
        role_type = "LCA Consultant"
        criteria = [
            {"criterion": "LCA Project Experience", "weight": 25, "desc": "Completed LCA/EPD projects and industrial studies"},
            {"criterion": "GaBi / SimaPro Software", "weight": 25, "desc": "Demonstrated hands-on proficiency in GaBi, SimaPro, or OpenLCA"},
            {"criterion": "LCI & LCA Modelling", "weight": 20, "desc": "Inventory data modeling, emission factors, and mass balance"},
            {"criterion": "ISO 14040/14044 Standards", "weight": 15, "desc": "Compliance with international environmental management norms"},
            {"criterion": "Environmental Domain Knowledge", "weight": 15, "desc": "Degree in Environmental/Chemical engineering and ESG/EHS domain"}
        ]
    elif is_design:
        role_type = "UI/UX Designer"
        criteria = [
            {"criterion": "UI/UX Projects & Case Studies", "weight": 25, "desc": "Portfolio projects, website/mobile app designs, user flows"},
            {"criterion": "User Research & Psychology", "weight": 20, "desc": "User interviews, personas, usability testing, and behavior insights"},
            {"criterion": "Figma & Prototyping", "weight": 25, "desc": "High-fidelity interactive prototyping, auto-layout, design systems"},
            {"criterion": "Visual Design & Aesthetics", "weight": 15, "desc": "Typography, color palettes, spacing, UI kits, and visual identity"},
            {"criterion": "Usability & Interaction Design", "weight": 15, "desc": "Micro-interactions, accessibility (WCAG), and responsive UX"}
        ]
    else:
        role_type = title.split("(")[0].strip()
        criteria = [
            {"criterion": "Core Domain Expertise", "weight": 30, "desc": "Demonstrated technical project background in the role domain"},
            {"criterion": "Tooling & Platform Proficiency", "weight": 25, "desc": "Hands-on mastery of primary tools and software"},
            {"criterion": "Project Deliverables", "weight": 20, "desc": "Proven track record of completed deliverables"},
            {"criterion": "Standards & Compliance", "weight": 15, "desc": "Familiarity with industry protocols and guidelines"},
            {"criterion": "Domain Education & Background", "weight": 10, "desc": "Formal qualifications and certifications"}
        ]
        
    return {
        "title": title,
        "role_type": role_type,
        "source_url": url,
        "location": location,
        "experience_required": exp_req if exp_req != "Not specified" else "1-3 years",
        "responsibilities": responsibilities[:8],
        "qualifications": qualifications[:8],
        "criteria_weights": criteria
    }

