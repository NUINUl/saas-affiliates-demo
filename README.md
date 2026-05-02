# Freelancer Affiliate SaaS — Proof of Concept (PoC)

Technical documentation intended for **client-facing presentation**. This repository describes a working baseline for validating scope, user experience, and the affiliate programme data model **before** committing to full production investment.

---

## Overview

This project is a **proof of concept** for a SaaS aimed at **freelancer affiliates**. Its purpose is to demonstrate, in a controlled and locally runnable environment, the flow between **link-driven acquisition**, **user registration**, and **metrics visualisation** in an affiliate dashboard.

### Core referral link logic

The solution implements a clear attribution model:

1. **Unique code per affiliate**  
   Each user has an affiliate profile with a unique **`referral_code`** stored in the database.

2. **Public URL with `ref` parameter**  
   Campaigns use URLs such as  
   `https://<site>/?ref=<CODE>`  
   The visitor lands on the frontend with that parameter visible in the address bar.

3. **Click tracking**  
   The frontend calls a public API endpoint (`POST /api/track/click`) with the code. The backend verifies that the code exists, **persists the click event** (dedicated clicks table), and may set a supporting **HttpOnly cookie** (`affiliate_ref`) for consistency across subsequent requests to the configured origin.

4. **New user signup with attribution**  
   During signup (`POST /api/register`), the referrer can be resolved from the **code sent in the request body** (`referral_code` / `ref`) or from the cookie above. If the code is valid and does not refer to the registering user themselves, a **`referrals`** record links the affiliate to the newly registered user, with commission status aligned to the PoC model (`pending` / `paid`, subject to future business rules).

5. **Metrics dashboard**  
   The authenticated affiliate retrieves an aggregated summary protected by **JWT**, including metrics such as **total clicks**, **attributed registrations**, and **commissions recognised as paid**, consistent with the relational schema defined for this PoC.

This design deliberately separates **click traceability**, **affiliate identity**, and **commercial outcomes (referrals and commissions)**, making it straightforward to evolve toward production without redoing the product’s core idea.

---

## Technology stack

| Layer | Primary technologies |
|-------|----------------------|
| **API** | PHP, **Laravel 11**, **API-first** architecture |
| **Authentication** | **JWT** (`php-open-source-saver/jwt-auth`) |
| **Data** | **SQLite** (well suited to prototypes and local setups without a dedicated database server) |
| **Frontend** | **Next.js** (App Router), **React**, **TypeScript** |
| **Styling** | **Tailwind CSS** (clean, productivity-oriented UI) |

These choices reflect **ecosystem maturity**, **maintainability**, and a **clear separation of concerns** between presentation and business logic.

---

## Local installation

Ensure **PHP 8.2+**, **Composer**, **Node.js 20+**, and **npm** are installed and available in your terminal (`php -v`, `composer --version`, `node -v`).

---

### Backend (Laravel / API)

1. **Obtain the codebase**  
   Clone the repository (or extract the delivered package) and work from the monorepo root.

2. **Install PHP dependencies**  
   ```bash
   cd backend
   composer install
   ```

3. **Configure environment**  
   Copy the example environment file for your OS:  
   - Windows (PowerShell or CMD): `copy .env.example .env`  
   - macOS / Linux: `cp .env.example .env`  

   Review `.env`, including:
   - `APP_URL` (e.g. `http://localhost:8000`)
   - `DB_CONNECTION=sqlite` and `DB_DATABASE=database/database.sqlite`
   - `FRONTEND_URL` matching the frontend origin (e.g. `http://localhost:3000`) for **CORS** and credential-bearing cookies in development.

4. **Application and JWT secrets**  
   ```bash
   php artisan key:generate
   php artisan jwt:secret
   ```

5. **SQLite database file**  
   Create an empty file at the path given by `DB_DATABASE` (default: `backend/database/database.sqlite`).  
   PowerShell example:  
   `New-Item -ItemType File -Force database/database.sqlite`

6. **Database schema**  
   ```bash
   php artisan migrate
   ```

7. **Development server**  
   ```bash
   php artisan serve
   ```  
   By default the API is available at **`http://localhost:8000`** (if you change the port, update `NEXT_PUBLIC_API_URL` in the frontend accordingly).

---

### Frontend (Next.js)

1. **Install dependencies**  
   ```bash
   cd frontend
   npm install
   ```

2. **Environment variables**  
   Copy the example and point it at your API base URL:  
   - Windows: `copy .env.example .env.local`  
   - macOS / Linux: `cp .env.example .env.local`  

   In `.env.local`, for example:  
   `NEXT_PUBLIC_API_URL=http://localhost:8000`

3. **Development server**  
   ```bash
   npm run dev
   ```  
   Open **`http://localhost:3000`**. To exercise referrals:  
   `http://localhost:3000/?ref=<AFFILIATE_CODE>`.

---

## Repository structure

The project is organised as a **monorepo** with two primary directories:

| Directory | Role |
|-----------|------|
| **`/backend`** | **Laravel** application exposed as a **REST API**: models, SQLite migrations, JWT authentication, click tracking, user registration with attribution, and aggregated affiliate dashboard endpoints. |
| **`/frontend`** | **Next.js** application: marketing landing, sign-in and sign-up flows, `ref` parameter capture, API consumption, and a modular **metrics dashboard**. |

This split allows **each layer to evolve independently** (for example, changing frontend hosting without rewriting backend business rules) and supports clearer code ownership and reviews within a team.

---

## PoC scope and next phase

This delivery targets **functional and UX validation**, not a closed production system. Typical production concerns—session policies, rate limiting, advanced click deduplication, payment gateways, administrative roles, legal audit trails, and security hardening—can be planned in subsequent phases on top of this foundation.

For deployment questions, data-model extensions, or a roadmap toward production, the development team can provide estimates and dependencies anchored to this technical baseline.
