# AI ATS — Intelligent Recruitment & Applicant Tracking Platform

![AI ATS Banner](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80)

> **Enterprise-grade Intelligent Applicant Tracking System & Recruitment Suite with AI-Driven ATS Score Modeling, Resume Entity Extraction, Recruiter Pipeline Kanban, and Multi-Role Governance.**

---

## 📌 Project Overview

**AI ATS** is a modern, placement-ready recruitment platform engineered for fast-growing technology companies, staffing agencies, and global talent. It solves the fragmentation between candidate resume optimization and recruiter talent screening by providing real-time ATS match scoring, automated entity extraction, applicant pipeline tracking, and administrative moderation.

> [!IMPORTANT]
> **Current Development Phase**: **PHASE 1 (Frontend-First Architecture)**
> In this phase, the complete, commercial-grade UI/UX is driven by an asynchronous mock service architecture with `localStorage` persistence. No Java backend, Spring Boot server, or PostgreSQL database is created yet. The frontend service abstractions are designed to directly integrate with Spring Boot REST APIs in **Phase 2**.

---

## 🎯 Dual & Triple Role Architecture

The platform provides dedicated, custom-tailored interfaces for three core personas:

### 1. 👨‍💻 Candidate Portal
- **Dashboard**: ATS benchmark gauge, profile completion progress, recommended jobs carousel, and live application timeline.
- **Candidate Profile Management**: Multi-section editor for Personal Info, Technical/Soft Skills tags, Education, Work History, Featured Projects, and Certifications.
- **Resume Management**: Drag-and-drop file uploader (PDF/DOCX), format validator, primary resume switcher, and preview modal.
- **AI Resume Parser**: Multi-phase visual entity extractor with laser scan line animation that syncs extracted entities directly to the user profile.
- **ATS Analysis & Feedback**: Radial gauge score analyzer (overall + technical score), score vector breakdown (Keywords, Skills, Experience, Education, Formatting), missing keyword cloud, and strengths/weaknesses insights.
- **Job Discovery & Recommendations**: Multi-faceted filter system (Department, Experience Level, Job Type, Min Match %) with 1-click **Easy Apply** modal.
- **Application Tracker**: Visual pipeline tracker with milestone dates and recruiter notes.
- **Saved Jobs**: Bookmark management.

### 2. 🏢 Recruiter Portal
- **Recruiter Command Center**: Metrics for Active Jobs, Total Applicants, In Interview, and Hires This Month.
- **Company Profile Branding**: Employer logo, tagline, mission description, and benefits/perks editor.
- **Job Requisition Management**: Active/closed toggles, applicant counts, and delete actions.
- **Post New Job Wizard**: Multi-section requisition builder with salary ranges, requirements, and skill tags for ATS matching.
- **Applicant Pipeline & Screening**: Dual **Kanban Pipeline Board** and **Table View** with ATS score sorting, resume reviews, status transitions, and recruiter evaluation notes.

### 3. 🛡️ Admin Governance
- **System Overview**: Platform KPIs (total candidates, recruiters, placement rate, system health).
- **User Account Management**: Search, filter, and 1-click suspend/activate account actions.
- **Recruiter Verification**: Verify legitimate employer organizations to safeguard candidate data.
- **Job Moderation**: Audit and approve/remove job postings.
- **Platform Analytics**: Visual recruitment funnel conversions and top in-demand technical skills breakdown.

---

## ⚡ Tech Stack

| Domain | Technology |
|---|---|
| **Core Framework** | React 19 + TypeScript + Vite |
| **Routing** | React Router v7 |
| **Styling & Design System** | Tailwind CSS + Custom Design Tokens + Glassmorphism |
| **Icons** | Lucide React |
| **State & Services** | React Context API + Modular Mock Service Architecture + `localStorage` |
| **Typography** | Plus Jakarta Sans & Inter (Google Fonts) |

---

## 📁 Frontend Architecture & Folder Structure

```
src/
├── assets/                  # Brand vectors, icons, and illustrations
├── components/
│   ├── common/              # Header, Sidebar, Footer, RoleSwitcher, NotificationsDropdown
│   ├── ui/                  # Reusable Design System Kit (Button, Input, Card, Modal, Tabs, Table, etc.)
│   └── ...
├── context/                 # AuthContext, ToastContext
├── data/                    # Initial seed data for mock services
├── layouts/                 # PublicLayout, CandidateLayout, RecruiterLayout, AdminLayout, ProtectedRoute
├── pages/
│   ├── public/              # LandingPage
│   ├── auth/                # Login, Register, ForgotPassword, ResetPassword, EmailVerification
│   ├── candidate/           # Dashboard, Profile, Resumes, Parser, ATS Analysis, Jobs, Details, Applications, Saved
│   ├── recruiter/           # Dashboard, CompanyProfile, JobManagement, CreateJob, ApplicantPipeline
│   └── admin/               # Dashboard, UserManagement, RecruiterVerification, JobModeration, PlatformAnalytics
├── routes/                  # AppRoutes (Centralized route hierarchy)
├── services/
│   ├── mock/                # authService, candidateService, jobService, recruiterService, adminService, storage
│   └── index.ts             # Unified service exports
├── types/                   # TypeScript interfaces (User, Job, CandidateProfile, Application, Resume, ATSAnalysis)
├── utils/                   # cn utility, formatters, score coloring
├── App.tsx
├── main.tsx
└── index.css                # Tailwind directives + design system variables
```

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```

---

## 🎮 Quick Testing & Role Switching

In the top navigation bar, use the **Persona Switcher** to instantly switch between:
1. **Candidate** (`Alex Rivera` — Senior Full Stack Engineer)
2. **Recruiter** (`Sarah Jenkins` — Head of Talent, CloudScale AI)
3. **Admin** (`Marcus Vance` — Principal Platform Administrator)

---

## 🗺️ Roadmap to Phase 2 (Spring Boot Backend)

- [x] **Phase 1: Complete Frontend Architecture & Mock Services** (Done)
- [ ] **Phase 2: Java Spring Boot Backend REST APIs**
- [ ] **Phase 3: PostgreSQL Database & JPA Repositories**
- [ ] **Phase 4: Frontend ↔ Backend Integration (JWT Auth + Spring Security)**
- [ ] **Phase 5: Advanced AI Semantic Embedding Matching (BERT/SBERT) & Deployment**
