def generate_skill_gap_recommendation(
    matched_skills: list,
    missing_skills: list
):
    if not missing_skills:
        return {
            "status": "Ready",
            "message": "Candidate matches all required skills.",
            "priority_skills": [],
            "recommendations": []
        }

    recommendations = []

    for skill in missing_skills:
        recommendations.append({
            "skill": skill,
            "recommendation": (
                f"Improve {skill} through a course, "
                f"project or practical hands-on work."
            )
        })

    return {
        "status": "Skill Gap Identified",
        "message": (
            f"{len(missing_skills)} required skill(s) "
            "are missing."
        ),
        "priority_skills": missing_skills,
        "recommendations": recommendations
    }


def generate_explanation(
    match_score: float,
    skill_match_score: float,
    tfidf_similarity: float,
    matched_skills: list,
    missing_skills: list
):
    if match_score >= 80:
        assessment = "Strong candidate match"
    elif match_score >= 60:
        assessment = "Good candidate match"
    elif match_score >= 40:
        assessment = "Moderate candidate match"
    else:
        assessment = "Low candidate match"

    return {
        "assessment": assessment,
        "match_score": match_score,
        "skill_match_score": skill_match_score,
        "tfidf_similarity": tfidf_similarity,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "reason": (
            f"Candidate matched {len(matched_skills)} "
            f"required skill(s) and is missing "
            f"{len(missing_skills)} skill(s)."
        )
    }