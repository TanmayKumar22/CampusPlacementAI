import re

SKILL_DICTIONARY = {
    "python": ["python", "python programming"],
    "java": ["java"],
    "c++": ["c++", "cpp"],
    "c": ["c programming"],
    "javascript": ["javascript", "js"],
    "html": ["html", "html5"],
    "css": ["css", "css3"],

    "react": ["react", "react.js", "reactjs"],
    "node.js": ["node.js", "nodejs", "node"],
    "express": ["express", "express.js"],
    "bootstrap": ["bootstrap"],
    "flutter": ["flutter"],

    "fastapi": ["fastapi", "fast api"],
    "spring boot": ["spring boot", "springboot"],
    "java servlets": ["java servlets", "servlets"],
    "jsp": ["jsp"],
    "jdbc": ["jdbc"],
    "rest api": [
        "rest api",
        "restful api",
        "rest apis"
    ],

    "sql": ["sql", "mysql", "postgresql"],
    "mysql": ["mysql"],
    "mongodb": ["mongodb", "mongo db"],

    "machine learning": [
        "machine learning",
        "ml",
        "machine-learning"
    ],
    "deep learning": [
        "deep learning",
        "dl"
    ],
    "tensorflow": ["tensorflow"],
    "pytorch": ["pytorch"],

    "docker": ["docker", "docker container"],
    "git": ["git", "github", "gitlab"],

    "data structures": [
        "data structures",
        "data structure"
    ],
    "algorithms": [
        "algorithms",
        "algorithm",
        "dsa",
        "data structures and algorithms"
    ],
    "oop": [
        "oop",
        "object-oriented programming",
        "object oriented programming"
    ],

    "mvc": ["mvc", "mvc architecture"],
    "unit testing": ["unit testing", "unit test"],
    "system design": ["system design", "system design basics"],
    "rest": ["rest"],
    "rbac": [
        "rbac",
        "role-based access control",
        "role based access control"
    ],
}


def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_skills(text: str):
    if not text:
        return []

    normalized_text = normalize_text(text)
    found_skills = set()

    for skill, variations in SKILL_DICTIONARY.items():
        for variation in variations:
            pattern = r"(?<!\w)" + re.escape(variation) + r"(?!\w)"

            if re.search(pattern, normalized_text):
                found_skills.add(skill)
                break

    return sorted(found_skills)


def extract_skills_from_resume(
    resume_text: str,
    existing_skills: str = ""
):
    resume_skills = extract_skills(resume_text)

    profile_skills = extract_skills(existing_skills)

    combined_skills = sorted(
        set(resume_skills + profile_skills)
    )

    return {
        "extracted_skills": resume_skills,
        "profile_skills": profile_skills,
        "normalized_skills": combined_skills,
        "total_skills": len(combined_skills)
    }