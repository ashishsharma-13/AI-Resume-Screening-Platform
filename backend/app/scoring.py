import re
from typing import Dict, Any, List

def extract_evidence_snippets(text: str, keywords: List[str], max_snippets: int = 3) -> List[str]:
    """
    Finds real sentences or bullet points in the resume that contain any of the target keywords.
    """
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    snippets = []
    
    for line in lines:
        cleaned_line = line.lstrip("•-* \t")
        if len(cleaned_line) < 15:
            continue
        line_lower = cleaned_line.lower()
        for kw in keywords:
            pat = r'\b' + re.escape(kw.lower()) + r'\b'
            if re.search(pat, line_lower):
                if cleaned_line not in snippets:
                    snippets.append(cleaned_line)
                    if len(snippets) >= max_snippets:
                        return snippets
                break
    return snippets

def evaluate_lca_candidate(parsed: Dict[str, Any]) -> Dict[str, Any]:
    text = parsed.get("raw_text", "")
    text_lower = text.lower()
    exp_years = parsed.get("experience_years", 0.0)
    
    # Criterion 1: LCA Project Experience (25 pts) - Job requirement: completed at least 3 LCA projects
    c1_kw = ["life cycle assessment", "lca", "epd", "environmental product declaration", "carbon footprint", "ghg footprint"]
    c1_evidence = extract_evidence_snippets(text, c1_kw)
    c1_score = 0
    if len(c1_evidence) >= 2 or "epd" in text_lower or text_lower.count("lca") >= 3:
        c1_score = 25
    elif len(c1_evidence) == 1 or "lca" in text_lower:
        c1_score = 15
    elif any(k in text_lower for k in ["carbon accounting", "emission inventory", "eia"]):
        c1_score = 8
        
    c1_missing = None if c1_score >= 20 else "Limited or no documented hands-on LCA/EPD client project deliverables."
    
    # Criterion 2: GaBi / SimaPro Software (25 pts) - Job requirement: hands-on experience using either GaBi or SimaPro
    c2_kw = ["gabi", "simapro", "openlca", "aspen plus"]
    c2_evidence = extract_evidence_snippets(text, c2_kw)
    c2_score = 0
    has_gabi = bool(re.search(r'\bgabi\b', text_lower))
    has_simapro = bool(re.search(r'\bsimapro\b', text_lower))
    has_openlca = bool(re.search(r'\bopenlca\b', text_lower))
    
    if has_gabi and has_simapro:
        c2_score = 25
    elif has_gabi or has_simapro:
        c2_score = 25
    elif has_openlca:
        c2_score = 18
    elif "aspen" in text_lower or "aermod" in text_lower:
        c2_score = 8
        
    c2_missing = None if c2_score >= 20 else "No direct mention of GaBi or SimaPro modeling software."
    
    # Criterion 3: LCI and LCA Modelling (20 pts) - Job requirement: build LCI model using collected inventory data
    c3_kw = ["lci", "life cycle inventory", "inventory data", "modelling", "mass balance", "emission factors", "emission inventory"]
    c3_evidence = extract_evidence_snippets(text, c3_kw)
    c3_score = 0
    if len(c3_evidence) >= 2 or "lci" in text_lower or "emission inventory" in text_lower:
        c3_score = 20
    elif len(c3_evidence) == 1 or "modelling" in text_lower:
        c3_score = 12
    elif "data validation" in text_lower or "environmental monitoring" in text_lower:
        c3_score = 6
        
    c3_missing = None if c3_score >= 15 else "Lack of verifiable LCI data compilation and process inventory modeling."
    
    # Criterion 4: ISO 14040/14044 Standards (15 pts) - Job requirement: strictly follow ISO 14040 and ISO 14044
    c4_kw = ["iso 14040", "iso 14044", "iso 14025", "iso 14001", "iso 14064"]
    c4_evidence = extract_evidence_snippets(text, c4_kw)
    c4_score = 0
    has_14040 = bool(re.search(r'iso\s*1404[04]', text_lower))
    has_14001 = bool(re.search(r'iso\s*14001', text_lower) or re.search(r'iso\s*:\s*2015', text_lower))
    
    if has_14040:
        c4_score = 15
    elif has_14001 or "iso" in text_lower or "compliance" in text_lower:
        c4_score = 8
        
    c4_missing = None if c4_score >= 12 else "No explicit certification or proven compliance with ISO 14040/14044 LCA standards."
    
    # Criterion 5: Environmental Domain & Education (15 pts) - Job requirement: Bachelor's or Master's in Environmental domain
    c5_kw = ["environmental engineering", "chemical engineering", "sustainability", "energy and environmental", "waste management"]
    c5_evidence = extract_evidence_snippets(text, c5_kw)
    c5_score = 0
    if any(k in text_lower for k in ["environmental engineering", "m.tech. in energy and environmental", "energy and environmental"]):
        c5_score = 15
    elif any(k in text_lower for k in ["civil engineering", "chemical", "environmental science", "ehs"]):
        c5_score = 12
    elif "sustainability" in text_lower:
        c5_score = 8
        
    c5_missing = None if c5_score >= 10 else "Educational background not strictly in environmental/chemical disciplines."
    
    total_lca = c1_score + c2_score + c3_score + c4_score + c5_score
    total_lca = min(100, max(0, total_lca))
    
    # Evaluated directly against the scraped job description requirement (2 to 3 years)
    meets_experience = exp_years >= 2.0
    
    criteria_list = [
        {"name": "LCA Project Experience", "weight": 25, "score": c1_score, "evidence": c1_evidence, "missing": c1_missing},
        {"name": "GaBi / SimaPro Software", "weight": 25, "score": c2_score, "evidence": c2_evidence, "missing": c2_missing},
        {"name": "LCI & LCA Modelling", "weight": 20, "score": c3_score, "evidence": c3_evidence, "missing": c3_missing},
        {"name": "ISO 14040/14044 Standards", "weight": 15, "score": c4_score, "evidence": c4_evidence, "missing": c4_missing},
        {"name": "Environmental Domain Knowledge", "weight": 15, "score": c5_score, "evidence": c5_evidence, "missing": c5_missing}
    ]
    
    return {
        "score": total_lca,
        "criteria": criteria_list,
        "meets_experience_requirement": meets_experience,
        "experience_years": exp_years
    }

def evaluate_uiux_candidate(parsed: Dict[str, Any]) -> Dict[str, Any]:
    text = parsed.get("raw_text", "")
    text_lower = text.lower()
    exp_years = parsed.get("experience_years", 0.0)
    
    # Criterion 1: UI/UX Projects & Case Studies (25 pts)
    c1_kw = ["ui/ux", "case study", "product design", "mobile app", "web app", "website redesign", "user flow"]
    c1_evidence = extract_evidence_snippets(text, c1_kw)
    c1_score = 0
    if len(c1_evidence) >= 2 or "case study" in text_lower or text_lower.count("design") >= 8:
        c1_score = 25
    elif len(c1_evidence) == 1 or "ui/ux" in text_lower or "product designer" in text_lower:
        c1_score = 18
    elif any(k in text_lower for k in ["graphic designer", "visual designer", "frontend"]):
        c1_score = 10
        
    c1_missing = None if c1_score >= 18 else "No complete end-to-end UI/UX product case studies or digital project deliverables found."
    
    # Criterion 2: User Research & Psychology (20 pts)
    c2_kw = ["user research", "user interviews", "user psychology", "empathy map", "personas", "heuristic", "affinity mapping"]
    c2_evidence = extract_evidence_snippets(text, c2_kw)
    c2_score = 0
    has_user_research = bool(re.search(r'\buser\s+research\b', text_lower))
    has_psychology = bool(re.search(r'\b(psychology|behavior|insights|interviews)\b', text_lower))
    
    if has_user_research and has_psychology:
        c2_score = 20
    elif has_user_research or "personas" in text_lower:
        c2_score = 15
    elif "research" in text_lower:
        c2_score = 8
        
    c2_missing = None if c2_score >= 15 else "Limited evidence of user research, persona definition, or behavioral analysis."
    
    # Criterion 3: Figma & Prototyping (25 pts)
    c3_kw = ["figma", "prototyping", "interactive prototype", "wireframe", "high-fidelity", "auto-layout"]
    c3_evidence = extract_evidence_snippets(text, c3_kw)
    c3_score = 0
    has_figma = bool(re.search(r'\bfigma\b', text_lower))
    has_prototype = bool(re.search(r'\bprototyp(e|ing|es)\b', text_lower))
    has_wireframe = bool(re.search(r'\bwirefram(e|ing|es)\b', text_lower))
    
    if has_figma and (has_prototype or has_wireframe):
        c3_score = 25
    elif has_figma:
        c3_score = 20
    elif has_prototype or "adobe xd" in text_lower:
        c3_score = 12
        
    c3_missing = None if c3_score >= 20 else "Figma and interactive prototyping experience not demonstrated."
    
    # Criterion 4: Visual Design & Design Systems (15 pts)
    c4_kw = ["design system", "visual design", "typography", "color palette", "ui kit", "style guide", "visual hierarchy"]
    c4_evidence = extract_evidence_snippets(text, c4_kw)
    c4_score = 0
    if "design system" in text_lower or (re.search(r'\bvisual\s+design\b', text_lower) and "typography" in text_lower):
        c4_score = 15
    elif "visual design" in text_lower or "typography" in text_lower or "ui kit" in text_lower:
        c4_score = 10
    elif "graphic design" in text_lower:
        c4_score = 6
        
    c4_missing = None if c4_score >= 10 else "No formal design system creation or advanced typography/visual hierarchy documentation."
    
    # Criterion 5: Usability & Interaction Design (15 pts)
    c5_kw = ["usability testing", "interaction design", "micro-interactions", "accessibility", "responsive", "wcag"]
    c5_evidence = extract_evidence_snippets(text, c5_kw)
    c5_score = 0
    if "usability testing" in text_lower or "interaction design" in text_lower:
        c5_score = 15
    elif "usability" in text_lower or "responsive" in text_lower or "accessibility" in text_lower:
        c5_score = 10
    elif "front-end" in text_lower or "html" in text_lower:
        c5_score = 5
        
    c5_missing = None if c5_score >= 10 else "Usability testing, accessibility, or interaction design patterns missing."
    
    total_uiux = c1_score + c2_score + c3_score + c4_score + c5_score
    total_uiux = min(100, max(0, total_uiux))
    
    criteria_list = [
        {"name": "UI/UX Projects & Case Studies", "weight": 25, "score": c1_score, "evidence": c1_evidence, "missing": c1_missing},
        {"name": "User Research & Psychology", "weight": 20, "score": c2_score, "evidence": c2_evidence, "missing": c2_missing},
        {"name": "Figma & Prototyping", "weight": 25, "score": c3_score, "evidence": c3_evidence, "missing": c3_missing},
        {"name": "Visual Design & Design Systems", "weight": 15, "score": c4_score, "evidence": c4_evidence, "missing": c4_missing},
        {"name": "Usability & Interaction Design", "weight": 15, "score": c5_score, "evidence": c5_evidence, "missing": c5_missing}
    ]
    
    return {
        "score": total_uiux,
        "criteria": criteria_list,
        "meets_intern_experience": exp_years <= 2.0,
        "experience_years": exp_years
    }

def score_and_classify(parsed: Dict[str, Any]) -> Dict[str, Any]:
    if not parsed.get("is_valid", True):
        return {
            "lca_score": 0,
            "uiux_score": 0,
            "primary_role": "Neither / Uncertain",
            "confidence": "Low",
            "reasoning": f"Unreadable or empty resume: {parsed.get('error', 'Document parse failure')}",
            "lca_details": {
                "score": 0,
                "criteria": [],
                "meets_experience_requirement": False,
                "experience_years": 0.0
            },
            "uiux_details": {
                "score": 0,
                "criteria": [],
                "meets_intern_experience": True,
                "experience_years": 0.0
            },
            "strengths": [],
            "missing_qualifications": ["Readable document content", "Work experience", "Education"]
        }
        
    lca_eval = evaluate_lca_candidate(parsed)
    uiux_eval = evaluate_uiux_candidate(parsed)
    
    lca_score = lca_eval["score"]
    uiux_score = uiux_eval["score"]
    
    # Classification logic
    lca_thresh = 40
    uiux_thresh = 40
    
    if lca_score >= lca_thresh and uiux_score >= uiux_thresh:
        primary_role = "Both"
        confidence = "High" if (lca_score >= 60 and uiux_score >= 60) else "Moderate"
        reasoning = f"Demonstrates qualifications across both LCA ({lca_score}/100) and UI/UX ({uiux_score}/100)."
    elif lca_score >= lca_thresh:
        primary_role = "LCA Consultant"
        confidence = "High" if lca_score >= 65 else "Moderate"
        reasoning = f"Strong alignment with LCA Consultant role ({lca_score}/100) with proven environmental assessment and modeling knowledge."
    elif uiux_score >= uiux_thresh:
        primary_role = "UI/UX Designer"
        confidence = "High" if uiux_score >= 65 else "Moderate"
        reasoning = f"Strong alignment with UI/UX Design role ({uiux_score}/100) with Figma prototyping and user experience focus."
    else:
        primary_role = "Neither / Uncertain"
        confidence = "Low"
        reasoning = f"Candidate scores low for both roles (LCA: {lca_score}/100, UI/UX: {uiux_score}/100). Background appears centered in other disciplines."
        
    # Extract overall strengths and missing items
    strengths = []
    missing_items = []
    
    if primary_role == "LCA Consultant":
        for c in lca_eval["criteria"]:
            if c["score"] >= c["weight"] * 0.75:
                strengths.append(f"{c['name']}: {c['score']}/{c['weight']} pts")
            elif c["missing"]:
                missing_items.append(c["missing"])
    elif primary_role == "UI/UX Designer":
        for c in uiux_eval["criteria"]:
            if c["score"] >= c["weight"] * 0.75:
                strengths.append(f"{c['name']}: {c['score']}/{c['weight']} pts")
            elif c["missing"]:
                missing_items.append(c["missing"])
    elif primary_role == "Both":
        strengths.append(f"Dual-role versatility: LCA ({lca_score}/100) and UI/UX ({uiux_score}/100)")
    else:
        missing_items.append("No substantial LCA modeling or UI/UX product design portfolio detected.")
        
    return {
        "lca_score": lca_score,
        "uiux_score": uiux_score,
        "primary_role": primary_role,
        "confidence": confidence,
        "reasoning": reasoning,
        "lca_details": lca_eval,
        "uiux_details": uiux_eval,
        "strengths": strengths,
        "missing_qualifications": missing_items
    }
