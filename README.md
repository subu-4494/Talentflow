# TalentFlow - A Mini Hiring Platform

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Setup](#setup)
- [Project Structure](#project-structure)
- [Core Features](#core-features)
- [Technical Decisions](#technical-decisions)
- [Known Issues](#known-issues)
- [References](#references)

---

## Overview

TalentFlow is a React-based single-page application (SPA) designed for managing job listings, candidates, and assessments. It provides recruiters with an intuitive interface to create, track, and evaluate assessments while enabling candidates to submit responses efficiently. The project uses a combination of in-browser mock APIs, local persistence, and optional external APIs for a seamless experience.

---

## Architecture

The frontend architecture is divided into four main layers:  

1. **UI Layer**: Handles rendering of components and user interactions.  
2. **Service Layer**: Manages API requests, mock server handling (MSW), and local persistence.  
3. **Optional External API**: Supports integration with external services if required.  
4. **Configuration & Tooling**: Contains Vite, ESLint, CSS, and package configuration.

### Flow

- **Browser** loads the React SPA bundle.  
- **React SPA** renders the main components: NavBar, JobsPage, CandidatesPage, AssessmentsPage.  
- **UI Layer** communicates with the **Service Layer** via `APIClient`.  
- `APIClient` either interacts with the **MSW Browser Setup** or an **External API Service**.  
- **MSW Handlers** read/write to **Local DB Wrapper** and fallback to **Local Storage**.  
- On SPA initialization, **Seed Module** populates the local database.  
- Utility functions such as `slugify` assist in data normalization and formatting.

---

## Setup

### Prerequisites

- Node.js (v18+ recommended)  
- npm (v9+) or yarn  
- Git  

### Installation

```bash
# Clone repository
git clone https://github.com/subu-4494/talentflow.git
cd talentflow/frontend

# Install dependencies
npm install

# Start development server
npm run dev
The application will be accessible at http://localhost:5173.

Scripts
npm run dev - Launches the Vite development server.

npm run build - Builds the project for production.

npm run preview - Previews the production build locally.

npm run lint - Runs ESLint for code quality.

Project Structure
text
Copy code
frontend/
├─ src/
│  ├─ components/
│  │  └─ NavBar.jsx
│  ├─ routes/
│  │  ├─ JobsPage.jsx
│  │  ├─ JobDetails.jsx
│  │  ├─ JobForm.jsx
│  │  ├─ CandidatesPage.jsx
│  │  ├─ CandidateProfile.jsx
│  │  ├─ CandidateKanban.jsx
│  │  ├─ CandidateResponses.jsx
│  │  ├─ CandidateResponsesByEmail.jsx
│  │  ├─ AssessmentsPage.jsx
│  │  ├─ AssessmentBuilder.jsx
│  │  ├─ AssessmentForm.jsx
│  │  ├─ AssessmentPreview.jsx
│  │  └─ CandidateAssessmentPage.jsx
│  ├─ lib/
│  │  ├─ api.js
│  │  ├─ db.js
│  │  ├─ localStorage.js
│  │  ├─ msw/
│  │  │  ├─ browser.js
│  │  │  └─ handlers.js
│  │  └─ seed.js
│  ├─ utilis/
│  │  └─ slugify.js
│  ├─ App.jsx
│  └─ main.jsx
├─ global.css
├─ vite.config.js
├─ package.json
└─ eslint.config.js
Core Features
Job Management

Candidate Management

Assessments with conditional logic

Mock API with MSW and local persistence

Utility functions and data seeding

Technical Decisions
React SPA with Vite

MSW for mock API

IndexedDB via Dexie.js

Conditional question rendering

Client-side form validation

React Router DOM for routing

Global CSS management

ESLint for code quality

Known Issues
File uploads are stored in memory.

Complex conditional logic may need backend support.

Some components require more unit tests.

No authentication; email-based identification only.

References
Vite Documentation

React Documentation

MSW Documentation

Dexie.js Documentation

Architecture Diagram
![TalentFlow Architecture](https://github.com/subu-4494/Talentflow/blob/main/diagram.png)
    classDef pers fill:#FFE0B2,stroke:#F57C00,stroke-width:1px
    classDef config fill:#E1BEE7,stroke:#8E24AA,stroke-width:1px
    classDef external fill:#F5F5F5,stroke:#616161,stroke-width:1px,stroke-dasharray:5
    classDef optional fill:#F5F5F5,stroke:#616161,stroke-width:1px,stroke-dasharray:5
