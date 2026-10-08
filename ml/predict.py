from __future__ import annotations
import json, sys
from pathlib import Path
import joblib
import pandas as pd

ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "models" / "arya_placement_model.joblib"
METRICS_PATH = ROOT / "models" / "training_metrics.json"
FEATURES = [
    "age", "gender", "cgpa", "attendance_percentage", "backlogs",
    "coding_score", "aptitude_score", "communication_score", "technical_score",
    "projects_count", "major_projects", "internships_count", "internship_months",
    "certifications_count", "hackathons_participated", "hackathons_won",
    "coding_platform_score", "github_projects", "linkedin_score", "resume_score",
    "soft_skills_score", "leadership_score", "extracurricular_score", "training_hours",
    "mock_interview_score", "preferred_domain"
]


def predict(features: dict):
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Trained ARYA model not found. Run python ml/train.py first.")
    pipe = joblib.load(MODEL_PATH)
    row = {k: features.get(k) for k in FEATURES}
    df = pd.DataFrame([row], columns=FEATURES)
    probability = float(pipe.predict_proba(df)[0, 1])
    prediction = "Placed" if probability >= 0.5 else "Not Placed"
    confidence = abs(probability - 0.5) * 2
    metrics = json.loads(METRICS_PATH.read_text()) if METRICS_PATH.exists() else {}
    top = metrics.get("top_feature_importance", [])[:7]
    return {
        "model_version": metrics.get("model_version", "kaggle-student-placement-8000-v3"),
        "placement_probability": probability,
        "prediction": prediction,
        "confidence": confidence,
        "priority_features": [x["feature"] for x in top],
        "dataset_rows": metrics.get("dataset_rows"),
        "dataset_features": metrics.get("feature_count"),
        "roc_auc": metrics.get("roc_auc"),
        "accuracy": metrics.get("accuracy"),
        "selected_model": metrics.get("selected_model"),
    }


def main():
    payload = json.load(sys.stdin)
    action = payload.get("action", "readiness")
    if action != "readiness":
        raise ValueError(f"Unsupported action: {action}")
    print(json.dumps(predict(payload.get("features", {}))))

if __name__ == "__main__":
    main()
