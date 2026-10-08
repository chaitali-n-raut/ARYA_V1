# Kaggle dataset provenance

Primary training source used by the current ARYA ML model:

- Kaggle competition: **Binary Classification of Student Placement Outcomes**
- Training file: `student_placement_train.csv`
- Training rows: 8,000
- Predictive features: 26 (plus `student_id` and target `placed` in the CSV)
- Target: `placed`
- Test file included locally: `student_placement_test.csv`

The raw files in this project were supplied by the project owner from Kaggle. The competition data is subject to Kaggle's competition rules; do not redistribute the raw competition files outside permitted use.

Training command:

```bash
python ml/train.py
```

The production model is written to `ml/models/arya_placement_model.joblib` and evaluation metrics are written to `ml/models/training_metrics.json`.
