# ARYA AI

### Academic Readiness & Youth Analytics AI

> An AI-driven academic and career intelligence platform designed to help students understand their potential, identify skill gaps, improve career readiness, and connect with relevant opportunities.

---

## 📌 About ARYA AI

**ARYA AI (Academic Readiness & Youth Analytics AI)** is a student-focused career intelligence platform developed to support students, faculty, Training & Placement (T&P) teams, recruiters, mentors, and university administrators.

The platform brings together academic and professional student information such as:

- Academic performance
- Attendance
- Technical skills
- Certifications
- Internships
- Projects
- Coding experience
- Communication abilities

Using this information, ARYA AI is designed to provide:

- Placement readiness insights
- Explainable AI-based recommendations
- Skill-gap analysis
- Career-path recommendations
- Personalized learning roadmaps
- Placement opportunity support
- Recruiter candidate filtering and matching
- Institutional placement analytics

The goal is to help students move from **"Where do I stand?"** to **"What should I do next?"**

---

## 🎯 Objectives

ARYA AI aims to:

- Analyze student academic and professional profiles.
- Estimate student placement and career readiness.
- Identify important skill gaps.
- Provide explainable insights behind readiness predictions.
- Recommend suitable career paths.
- Generate personalized learning roadmaps.
- Support recruiters in filtering and ranking candidates.
- Help Training & Placement teams monitor student readiness.
- Provide meaningful analytics for academic institutions.

---

## 👥 User Roles

### 🎓 Student

Students can:

- Create and manage their profile.
- View academic and professional information.
- Monitor placement readiness.
- Understand their strengths and weaknesses.
- Explore career paths.
- Identify skill gaps.
- Follow personalized learning roadmaps.
- Track placement opportunities and applications.
- Upload resumes.

### 👨‍🏫 Faculty / Mentor

Faculty and mentors can:

- Monitor student progress.
- Review student profiles.
- Analyze academic and readiness information.
- Support students with career guidance.

### 🏢 Training & Placement (T&P)

T&P teams can:

- Monitor overall student readiness.
- Analyze placement-related information.
- Manage placement opportunities.
- Review candidate eligibility.
- Track placement analytics.

### 💼 Recruiter

Recruiters can:

- Define candidate requirements.
- Apply eligibility filters.
- Review candidate profiles.
- Rank suitable candidates.
- Identify relevant student talent.

### 🏛️ University Admin

Administrators can:

- Monitor institutional analytics.
- Manage platform-level information.
- View student and placement insights.
- Support university-level decision making.

---

## 🧠 Core Intelligence

ARYA AI is designed around multiple intelligence modules.

### 📊 Placement Readiness

The system analyzes student attributes to provide a readiness indication based on available academic and professional information.

### 🔍 Explainable AI

The platform is designed to explain the factors contributing to a student's readiness result rather than presenting only a prediction.

The research design includes:

- SHAP
- LIME

These approaches can be used to understand the contribution of features such as:

- CGPA
- Attendance
- Projects
- Certifications
- Coding activity
- Communication score

### 🧩 Skill Gap Analysis

ARYA AI compares a student's existing skills with the requirements of a target career path or opportunity and identifies areas that require improvement.

### 🧭 Career Intelligence

The platform provides career-oriented insights including:

- Career path recommendations
- Skill-gap identification
- Learning recommendations
- Personalized roadmaps
- Salary-band estimation where applicable

### 🤝 Recruiter Matching

Recruiters can first apply eligibility criteria such as:

- CGPA
- Backlogs
- Branch

Eligible candidates can then be ranked using relevant readiness and profile information.

---

## 🏗️ System Architecture

```text
                    ┌───────────────────────┐
                    │       ARYA AI          │
                    │   Web Application      │
                    └───────────┬───────────┘
                                │
             ┌──────────────────┼──────────────────┐
             │                  │                  │
             ▼                  ▼                  ▼
        Student            Faculty / T&P       Recruiter
        Dashboard           Dashboard           Portal
             │                  │                  │
             └──────────────────┼──────────────────┘
                                │
                                ▼
                     ┌────────────────────┐
                     │   Backend / APIs   │
                     └─────────┬──────────┘
                               │
                 ┌─────────────┼─────────────┐
                 │             │             │
                 ▼             ▼             ▼
              Student      Placement      Profile
               Data          Data          Data
                 │
                 ▼
          ┌────────────────────┐
          │   AI / ML Engine   │
          └─────────┬──────────┘
                    │
        ┌───────────┼────────────┐
        ▼           ▼            ▼
    Readiness    Explainability  Career
    Prediction    SHAP/LIME      Intelligence
        │           │            │
        └───────────┼────────────┘
                    ▼
           Personalized Insights
