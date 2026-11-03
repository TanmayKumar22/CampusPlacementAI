from typing import List

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def normalize_skills(skills_text: str) -> List[str]:
    """
    Convert comma-separated skills into a normalized list.
    """
    skills = skills_text.split(",")

    return [
        skill.strip().lower()
        for skill in skills
        if skill.strip()
    ]


def calculate_match(student_skills: str, required_skills: str):
    """
    Calculate transparent skill-based matching score.
    """

    student = set(normalize_skills(student_skills))
    required = set(normalize_skills(required_skills))

    if not required:
        return {
            "score": 0,
            "matched_skills": [],
            "missing_skills": []
        }

    matched = sorted(student.intersection(required))
    missing = sorted(required - student)

    score = round((len(matched) / len(required)) * 100, 2)

    return {
        "score": score,
        "matched_skills": matched,
        "missing_skills": missing
    }


def calculate_tfidf_similarity(
    student_text: str,
    job_text: str
):
    """
    Calculate NLP similarity using TF-IDF and cosine similarity.
    """

    if not student_text or not job_text:
        return 0.0

    documents = [
        student_text.lower(),
        job_text.lower()
    ]

    vectorizer = TfidfVectorizer(
        stop_words="english"
    )

    tfidf_matrix = vectorizer.fit_transform(documents)

    similarity = cosine_similarity(
        tfidf_matrix[0:1],
        tfidf_matrix[1:2]
    )[0][0]

    return round(float(similarity) * 100, 2)


def calculate_ai_match(
    student_skills: str,
    resume_text: str,
    required_skills: str,
    job_description: str
):
    """
    Combined explainable AI-oriented matching score.

    60% skill overlap
    40% TF-IDF similarity
    """

    baseline = calculate_match(
        student_skills,
        required_skills
    )

    tfidf_score = calculate_tfidf_similarity(
        resume_text or student_skills,
        job_description or required_skills
    )

    final_score = round(
        (baseline["score"] * 0.60)
        + (tfidf_score * 0.40),
        2
    )

    return {
        "score": final_score,
        "skill_match_score": baseline["score"],
        "tfidf_similarity": tfidf_score,
        "matched_skills": baseline["matched_skills"],
        "missing_skills": baseline["missing_skills"]
    }