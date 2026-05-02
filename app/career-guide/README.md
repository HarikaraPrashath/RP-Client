# Career Guide Component

A chat-based Career Guidance UI that collects student attributes, calls the backend prediction service, and renders explainable, personalized recommendations. It is part of the RP-Client frontend and integrates with the FastAPI backend at `/predict-career`.

## Table of Contents

- Project Title and Description
- Architecture Diagram (Component Only)
- Prerequisites and Requirements
- Installation Instructions
- Usage Examples
- System Testing and Validation
- Configuration
- License and Licensing Information
- Troubleshooting and FAQ
- Contribution Guidelines

## Project Title and Description

**Project Title:** Career Guide (RP-Client)

**Description:**
The Career Guide component is a conversational interface that gathers user inputs (skills, GPA, semester, OCEAN, RIASEC) and requests predictions and guidance from the backend. The backend uses a trained model plus LLM-generated guidance to return top career matches and actionable recommendations.

## Architecture Diagram (Component Only)

```mermaid
flowchart LR
	A[CareerGuide UI
	(Next.js / app/career-guide)] -->|POST /predict-career| B[FastAPI app
	(model_deploy/app.py)]
	B --> C[Career Guide Model
	(joblib model + encoder)]
	B --> D[Guidance Prompt Builder
	(lib/prompt.py)]
	D --> E[Groq LLM
	(GROQ_API_KEY)]
	B --> F[Response: top-1, top-3, guidance, suggestions]
	F --> A
	A -->|PUT /profile| G[Profile Service
	(career_market/profile_service.py)]
```

## Prerequisites and Requirements

- Node.js 18+ and pnpm (frontend)
- Python 3.10+ and pip (backend)
- FastAPI + dependencies in [model_deploy/requirements.txt](model_deploy/requirements.txt)
- A Groq API key for guidance text (`GROQ_API_KEY`)

## Installation Instructions

### Backend (FastAPI)

```bash
cd model_deploy
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
set GROQ_API_KEY=your_api_key_here
python -m uvicorn app:app --reload --port 8000
```

### Frontend (Next.js)

```bash
cd RP-Client
pnpm install
set NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
pnpm dev
```

## Usage Examples

### Start the Career Guide UI

Open `http://localhost:3000/career-guide` and type `start` to begin the assessment.

### Call the Prediction API Directly

```bash
curl -X POST http://127.0.0.1:8000/predict-career \
	-H "Content-Type: application/json" \
	-d "{\
		\"Soft_Skills\": \"communication, teamwork\",\
		\"Key_Skils\": \"python, react\",\
		\"Current_semester\": \"2Y2S\",\
		\"Learning_Style\": \"visual\",\
		\"GPA\": 3.1,\
		\"English_score\": 7.5,\
		\"Ocean_Openness\": 4,\
		\"Ocean_Conscientiousness\": 4,\
		\"Ocean_Extraversion\": 3,\
		\"Ocean_Agreeableness\": 4,\
		\"Ocean_Neuroticism\": 2,\
		\"Riasec_Realistic\": 6,\
		\"Riasec_Investigative\": 7,\
		\"Riasec_Artistic\": 4,\
		\"Riasec_Social\": 5,\
		\"Riasec_Enterprising\": 6,\
		\"Riasec_Conventional\": 5,\
		\"Is_Sliit_Student\": true,\
		\"Specialization\": \"Software Engineering\"\
	}"
```

## System Testing and Validation

1) Verify the backend health endpoint:

```bash
curl http://127.0.0.1:8000/
```

Expected output:

```json
{"status":"Career Prediction API running"}
```

2) Verify `/predict-career` responds with top predictions and guidance (see the curl example above).

3) Open the Career Guide page and complete the flow to confirm UI renders predictions.

## Configuration

### Backend

- `GROQ_API_KEY`: Required to generate guidance using Groq LLM.
- `FRONTEND_ORIGINS`: Comma-separated list of allowed frontend origins for CORS.

### Frontend

- `NEXT_PUBLIC_API_URL`: Base URL for the backend (defaults to `http://127.0.0.1:8000`).

## License and Licensing Information

License not specified yet. Add a `LICENSE` file at the repo root to define usage and contribution terms.

## Troubleshooting and FAQ

- **CORS errors:** Ensure `FRONTEND_ORIGINS` includes your frontend URL (e.g., `http://localhost:3000`).
- **LLM guidance missing:** Confirm `GROQ_API_KEY` is set and valid in the backend environment.
- **Prediction errors:** Check model files under `models/Career_Guide/` exist and match the expected names.

## Contribution Guidelines

1) Create a feature branch.
2) Keep changes scoped to the component or related services.
3) Add or update tests or validation steps in this README when changing behavior.
4) Open a pull request with a clear description and screenshots when UI changes.
