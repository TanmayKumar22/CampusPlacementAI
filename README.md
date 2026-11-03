# CampusPlacementAI

AI-Based, Explainable and Fair Campus Placement Shortlisting System.

A web-based placement management platform with student profiles, PDF resume extraction, job applications, AI-assisted candidate ranking, skill-gap analysis and fairness auditing.

## Technology Stack
- React and Vite
- Python and FastAPI
- SQLAlchemy
- Scikit-learn
- TF-IDF and Cosine Similarity
- JWT Authentication

## AI Matching
The system combines 60% skill matching and 40% TF-IDF text similarity. It identifies matched skills, missing skills and candidate skill gaps.

## Responsible AI
Sensitive personal attributes are excluded from ranking. Final selection decisions require human review.

## Setup
Backend: pip install -r backend/requirements.txt
Start backend: uvicorn backend.app.main:app --reload
Frontend: cd frontend; npm install; npm run dev

API documentation: http://127.0.0.1:8000/docs
Frontend: http://localhost:5173

## Implementation Scope
The current system uses normalized skill matching and TF-IDF similarity, not a separately trained supervised ML model.
