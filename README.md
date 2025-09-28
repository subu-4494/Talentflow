# Talentflow  A mini hiring platform

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

### Mermaid Diagram

```mermaid
flowchart TD
    Browser["User's Browser"]:::external
    ReactApp["React SPA (Vite Bundle)"]:::service

    subgraph "UI Layer" 
        direction TB
        NavBar["[NavBar Component](https://github.com/subu-4494/talentflow/blob/main/frontend/src/components/NavBar.jsx)"]:::ui
        subgraph "Page Routes"
            direction TB
            JobsPage["[JobsPage](https://github.com/subu-4494/talentflow/blob/main/frontend/src/routes/JobsPage.jsx)"]:::ui
            JobDetails["[JobDetails](https://github.com/subu-4494/talentflow/blob/main/frontend/src/routes/JobDetails.jsx)"]:::ui
            JobForm["[JobForm](https://github.com/subu-4494/talentflow/blob/main/frontend/src/routes/JobForm.jsx)"]:::ui
            CandidatesPage["[CandidatesPage](https://github.com/subu-4494/talentflow/blob/main/frontend/src/routes/CandidatesPage.jsx)"]:::ui
            CandidateProfile["[CandidateProfile](https://github.com/subu-4494/talentflow/blob/main/frontend/src/routes/CandidateProfile.jsx)"]:::ui
            CandidateKanban["[CandidateKanban](https://github.com/subu-4494/talentflow/blob/main/frontend/src/routes/CandidateKanban.jsx)"]:::ui
            CandidateResponses["[CandidateResponses](https://github.com/subu-4494/talentflow/blob/main/frontend/src/routes/CandidateResponses.jsx)"]:::ui
            CandidateResponsesByEmail["[CandidateResponsesByEmail](https://github.com/subu-4494/talentflow/blob/main/frontend/src/routes/CandidateResponsesByEmail.jsx)"]:::ui
            AssessmentsPage["[AssessmentsPage](https://github.com/subu-4494/talentflow/blob/main/frontend/src/routes/AssessmentsPage.jsx)"]:::ui
            AssessmentBuilder["[AssessmentBuilder](https://github.com/subu-4494/talentflow/blob/main/frontend/src/routes/AssessmentBuilder.jsx)"]:::ui
            AssessmentForm["[AssessmentForm](https://github.com/subu-4494/talentflow/blob/main/frontend/src/routes/AssessmentForm.jsx)"]:::ui
            AssessmentPreview["[AssessmentPreview](https://github.com/subu-4494/talentflow/blob/main/frontend/src/routes/AssessmentPreview.jsx)"]:::ui
            CandidateAssessmentPage["[CandidateAssessmentPage](https://github.com/subu-4494/talentflow/blob/main/frontend/src/routes/CandidateAssessmentPage.jsx)"]:::ui
        end
    end

    subgraph "Service Layer" 
        direction TB
        APIClient["[API Client (api.js)](https://github.com/subu-4494/talentflow/blob/main/frontend/src/lib/api.js)"]:::service
        MSWBrowser["[MSW Browser Setup](https://github.com/subu-4494/talentflow/blob/main/frontend/src/lib/msw/browser.js)"]:::service
        Handlers["[MSW Handlers](https://github.com/subu-4494/talentflow/blob/main/frontend/src/lib/msw/handlers.js)"]:::service
        DBWrapper["[Local DB Wrapper (db.js)](https://github.com/subu-4494/talentflow/blob/main/frontend/src/lib/db.js)"]:::pers
        LocalStorage["[Local Storage Fallback](https://github.com/subu-4494/talentflow/blob/main/frontend/src/lib/localStorage.js)"]:::pers
        SeedModule["[Seed Data Module](https://github.com/subu-4494/talentflow/blob/main/frontend/src/lib/seed.js)"]:::service
        Slugify["[slugify Utility](https://github.com/subu-4494/talentflow/blob/main/frontend/src/utilis/slugify.js)"]:::service
    end

    ExternalAPI["External API Service"]:::optional

    subgraph "Config & Tooling"
        direction TB
        ViteConfig["[vite.config.js](https://github.com/subu-4494/talentflow/blob/main/frontend/vite.config.js)"]:::config
        ESLintConfig["[eslint.config.js](https://github.com/subu-4494/talentflow/blob/main/frontend/eslint.config.js)"]:::config
        GlobalCSS["[global.css](https://github.com/subu-4494/talentflow/blob/main/frontend/global.css)"]:::config
        PackageJSON["[package.json](https://github.com/subu-4494/talentflow/blob/main/frontend/package.json)"]:::config
    end

    Browser --> ReactApp
    ReactApp --> NavBar
    ReactApp --> JobsPage
    ReactApp --> CandidatesPage
    ReactApp --> AssessmentsPage
    NavBar --> JobsPage
    JobsPage --> APIClient
    JobForm --> APIClient
    CandidateProfile --> APIClient
    AssessmentBuilder --> APIClient
    APIClient --> MSWBrowser
    MSWBrowser --> Handlers
    Handlers --> DBWrapper
    Handlers --> LocalStorage
    APIClient --> ExternalAPI
    ReactApp --> SeedModule
    SeedModule --> DBWrapper
    APIClient --> Slugify
    DBWrapper --> APIClient
    LocalStorage --> APIClient
    APIClient --> JobsPage
    APIClient --> CandidateProfile
    APIClient --> AssessmentBuilder
    JobsPage --> ReactApp
    ReactApp --> Browser

    classDef ui fill:#BBDEFB,stroke:#1E88E5,stroke-width:1px
    classDef service fill:#C8E6C9,stroke:#388E3C,stroke-width:1px
    classDef pers fill:#FFE0B2,stroke:#F57C00,stroke-width:1px
    classDef config fill:#E1BEE7,stroke:#8E24AA,stroke-width:1px
    classDef external fill:#F5F5F5,stroke:#616161,stroke-width:1px,stroke-dasharray:5
    classDef optional fill:#F5F5F5,stroke:#616161,stroke-width:1px,stroke-dasharray:5




Dexie.js Documentation

