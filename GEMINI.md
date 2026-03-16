# GEMINI.md - NXTGENAI Project Overview

Welcome to the NXTGENAI codebase. This document provides a high-level overview of the project, its architecture, and how to get started.

## Project Overview

NXTGENAI is a full-stack platform providing AI-powered content generation tools. Users can generate social media captions, hashtags, blog SEO content, email replies, and more. The platform features a subscription-based access model, user authentication, and an administrative interface.

### Main Technologies

- **Backend:** Python, FastAPI, SQLAlchemy, Alembic, Pydantic, OpenAI API, Stripe API.
- **Frontend:** React (v19), Vite, Tailwind CSS, Lucide React, React Router, Stripe React.
- **Database:** SQLite (local) / PostgreSQL (production support), managed via SQLAlchemy and Alembic.

## Directory Structure

- `NXTGENAI-main/`: Backend FastAPI application.
  - `app/`: Core application logic.
    - `core/`: Configuration and external service setups (LLM, Stripe).
    - `models/`: SQLAlchemy database models.
    - `routes/`: API endpoints organized by feature.
    - `services/`: Business logic layer.
    - `schemas/`: Pydantic models for request/response validation.
    - `utils/`: Helper functions (security, rate limiting).
  - `alembic/`: Database migration scripts.
- `NXTGENAI-Tools-main/frontend/`: React frontend application.
  - `src/`: Source code.
    - `api/`: API client configurations.
    - `components/`: Reusable UI components.
    - `pages/`: Page-level components (Dashboard, Login, Signup, etc.).
    - `tools/`: Specific AI tool components.

## Building and Running

### Backend (`NXTGENAI-main`)

1. **Environment Setup:**
   - Create a virtual environment: `python -m venv venv`
   - Activate it: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Unix)
   - Install dependencies: `pip install -r requirements.txt`

2. **Configuration:**
   - Configure `.env` with `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `DATABASE_URL`, etc.

3. **Database Migrations:**
   - Initialize/Upgrade database: `alembic upgrade head`

4. **Running the Server:**
   - Start FastAPI: `uvicorn app.main:app --reload`
   - The API will be available at `http://localhost:8000`.
   - Interactive docs: `http://localhost:8000/docs`.

### Frontend (`NXTGENAI-Tools-main/frontend`)

1. **Environment Setup:**
   - Navigate to the frontend directory: `cd NXTGENAI-Tools-main/frontend`
   - Install dependencies: `npm install`

2. **Running the Development Server:**
   - Start Vite: `npm run dev`
   - The application will be available at `http://localhost:5173`.

3. **Building for Production:**
   - Run: `npm run build`

## Development Conventions

### Backend
- **Modular Routes:** Each feature (e.g., `caption`, `auth`) has its own router in `app/routes/`.
- **Service Layer:** Business logic should reside in `app/services/` rather than directly in routes.
- **Async DB:** Use `AsyncSession` for database operations.
- **Security:** JWT authentication is used, with tokens stored in HttpOnly cookies.

### Frontend
- **Component Structure:** Reusable UI elements in `components/`, page layouts in `pages/`.
- **Protected Routes:** Use `ProtectedRoute` and `AdminProtectedRoute` to manage access.
- **Styling:** Utility-first CSS using Tailwind CSS.
- **State Management:** Local React state and hooks are used for data flow.

## Key Features
- **AI Tools:** Caption Generator, Hashtag Generator, Content Ideas, Blog SEO, Email Reply.
- **Paid Features:** Social Calendar, Product Description, Competitor Analysis.
- **Subscriptions:** Managed via Stripe (Free and Paid tiers).
- **Admin Dashboard:** For platform management and oversight.
