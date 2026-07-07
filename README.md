# Nyayakosha - Indian Penal & Legal Full-Stack Platform

A production-grade, highly-optimized full-stack application designed to query, manage, and visualize legal documents across 8 distinct Indian law acts (`ipc`, `crpc`, `cpc`, `hma`, `iea`, `nia`, `ida`, `mva`) from the `indian_law_db` MongoDB Atlas database.

---

## Table of Contents
- [Introduction](#introduction)
- [Quick Links](#quick-links)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [System Architecture](#system-architecture)
- [Comprehensive Feature List](#comprehensive-feature-list)
  - [Frontend Features](#frontend-features)
  - [Backend Features](#backend-features)
- [Frontend Deep Dive](#frontend-deep-dive)
  - [Brutalist Design System](#brutalist-design-system)
  - [Redux State Caching](#redux-state-caching)
  - [Component Hierarchy](#component-hierarchy)
  - [Data Visualization](#data-visualization)
- [Backend Deep Dive](#backend-deep-dive)
  - [MVC Architecture](#mvc-architecture)
  - [Authentication & JWT Flow](#authentication--jwt-flow)
  - [MongoDB Aggregation Pipelines](#mongodb-aggregation-pipelines)
  - [Database Schema Design](#database-schema-design)
- [Extensive API Documentation](#extensive-api-documentation)
  - [Auth Routes](#auth-routes)
- [Installation & Setup Guide](#installation--setup-guide)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Deployment Guide](#deployment-guide)
- [Security Best Practices](#security-best-practices)
- [Project Roadmap & Future Enhancements](#project-roadmap--future-enhancements)
- [Contributing](#contributing)
- [FAQ](#faq)
- [License](#license)
- [Author](#author)

---

## Introduction
Nyayakosha is a comprehensive full-stack legal intelligence platform that normalizes and visualizes complex Indian penal codes and laws. It provides blazing-fast search capabilities, dynamic statistical dashboards, and robust role-based authentication to manage legal repositories securely.

## Quick Links
- [Live Backend API](https://indian-law-penal-code-himmat-mundhe.onrender.com)
- [Postman Collection](./backend/Indian_Law_API_Postman_Collection.json)

---

## Tech Stack
**Frontend:**
* **Framework:** React 19 (via Vite)
* **State Management:** Redux Toolkit
* **Styling:** TailwindCSS, Material UI (MUI), Custom CSS Variables
* **Data Visualization:** Recharts
* **Routing:** React Router v7

**Backend:**
* **Runtime:** Node.js (v16+)
* **Framework:** Express.js 
* **Database:** MongoDB Atlas & Mongoose ODM
* **Security:** JWT, bcryptjs, express-rate-limit, cors, express-validator
* **Email:** Nodemailer

---

## Folder Structure
```text
indian_law_penal_code_himmat_mundhe/
├── backend/
│   ├── config/            # DB connection wrappers
│   ├── controllers/       # MVC request handlers
│   ├── middlewares/       # Auth guards, validators, rate limiters
│   ├── models/            # Mongoose schemas (User, Law)
│   ├── routes/            # Express routers
│   ├── services/          # Business logic & Mongo Aggregations
│   ├── utils/             # Helper utilities & Nodemailer
│   ├── app.js             # Express application entry
│   └── package.json       # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── features/      # Feature-based modules (laws, auth, analytics, dashboard)
│   │   ├── routes/        # App routing
│   │   ├── services/      # Axios API wrappers
│   │   ├── store/         # Redux store and slices
│   │   ├── theme/         # MUI Theme configuration
│   │   ├── App.jsx        # React root component
│   │   └── index.css      # Tailwind & CSS Variables
│   └── vite.config.js     # Vite configuration
└── README.md              # Documentation
```

---

## System Architecture
The application follows a decoupled client-server architecture. The **React/Vite Frontend** communicates with the **Express.js Backend** exclusively via RESTful APIs. The backend dynamically connects to an advanced MongoDB Atlas Replica Set, abstracting the multi-collection Indian law database into unified API responses.

---

## Comprehensive Feature List

### Frontend Features
* **Role-Based Access Control:** Protected routes utilizing React Router and Redux state.
* **Dark/Light Mode:** Seamless theme switching with custom CSS variables overriding MUI defaults.
* **Complex Filtering:** Multi-faceted UI controls to filter laws by Act, Chapter, State, Court, Category, and Bailable/Cognizable status.
* **Interactive Dashboards:** Rich, interactive charts and statistics using Recharts.

### Backend Features
* **Dynamic Collection Routing:** Automatically routes to the correct MongoDB collection at runtime using the `?act=ipc` query parameter.
* **Heterogeneous Schema Normalization:** Maps diverse collection schemas into a standardized JSON response.
* **Admin Controls:** Endpoints for user banning, role elevation, cache flushing, and system health checks.

---

## Frontend Deep Dive

### Brutalist Design System
The frontend utilizes a highly opinionated Brutalist-inspired design system. It heavily relies on stark contrasts, raw typography (mixing EB Garamond, Courier Prime, and DM Sans), and a striking dual-theme environment (Parchment Light Mode vs. Onyx Dark Mode). 

### Redux State Caching
The `store/` manages global application state using `@reduxjs/toolkit`. It caches user sessions, UI theme preferences, and complex filter states across page navigations, significantly reducing redundant API calls and preventing layout shifts.

### Component Hierarchy
Organized by a feature-driven architecture:
* `features/auth/` - Handles Login, Register, Profile, and password recovery flows.
* `features/laws/` - Houses the main Law Directory, infinite scrolling, and Law Detail pages.
* `features/dashboard/` - Contains the primary statistical overview and top-level aggregates.
* `features/analytics/` - Dedicated complex data visualizations and deep metric breakdowns.

### Data Visualization
Built tightly with `recharts`, the dashboard components implement custom `tickFormatter` logic to dynamically truncate extremely long Indian law category names (e.g., "Offences relating to coin and government stamps") to ensure pristine SVG rendering without overlapping labels.

---

## Backend Deep Dive

### MVC Architecture
The backend strictly adheres to the Model-View-Controller pattern (acting as a JSON View). Routes delegate to Controllers, which handle HTTP parsing and delegate heavy data operations to specialized Services.

### Authentication & JWT Flow
Implements a highly secure, stateless JWT authentication system. Tokens are signed with custom expiration windows. OTPs for email verification and password resets are managed via Nodemailer and short-lived database fields.

### MongoDB Aggregation Pipelines
Heavily relies on MongoDB's `$match`, `$group`, `$sort`, and `$project` pipelines within the `services/` layer to compute real-time analytical metrics, top trending laws, and category distributions directly at the database level.

### Database Schema Design
Utilizes strict Mongoose schemas with indexing on high-query fields like `section`, `chapter`, and `category`. Dynamic population is used where references span across the `User` and `Law` boundaries.

---

## Extensive API Documentation

All functional law endpoints support the `?act=<actName>` parameter. Allowed: `ipc`, `crpc`, `cpc`, `hma`, `iea`, `nia`, `ida`, `mva`.

### Auth Routes
* `POST /api/v1/auth/register` - Create account
* `POST /api/v1/auth/login` - Authenticate user
* `GET /api/v1/auth/profile` - Get current user profile
* `POST /api/v1/auth/forgot-password` - Request OTP for reset
* `POST /api/v1/auth/verify-otp` - Verify email OTP
* `POST /api/v1/jwt/refresh-token` - Refresh session JWT

*(For the complete list of 80+ endpoints including `/laws`, `/search`, `/stats`, and `/admin`, import the provided Postman collection).*

---

## Installation & Setup Guide

### Prerequisites
* Node.js v16+
* MongoDB Atlas Account (or Local MongoDB)
* Git

### Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://<credentials>@cluster.mongodb.net/indian_law_db
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## Deployment Guide
* **Backend:** Ready for deployment on Render, Heroku, or AWS EC2. Make sure to supply the exact `.env` variables to your cloud provider.
* **Frontend:** Optimized for Vercel or Netlify. The build command is `npm run build` using Vite. Make sure to map the `VITE_API_URL` to your live backend domain.

---

## Security Best Practices
* **Rate Limiting:** Protects `/auth` endpoints from brute-force dictionary attacks.
* **Password Hashing:** `bcryptjs` is utilized with high salt rounds.
* **Sanitization:** `express-validator` rigorously sanitizes all incoming payloads against NoSQL injection.
* **CORS Policy:** Strict Cross-Origin policies restrict unauthorized client domains.

---

## Project Roadmap & Future Enhancements
- [ ] Implement AI-assisted semantic search using Vector Embeddings.
- [ ] Introduce real-time collaborative bookmarking and law-notes sharing.
- [ ] Expand the database to encompass regional state-level specific amendments.
- [ ] Develop native iOS & Android applications.

---

## Contributing
1. Fork the repository
2. Create a Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## FAQ
**Q: Why does the dashboard chart crash on load?**  
A: This was a known issue with empty initial data rendering overlapping chart axes. It has been patched via strict string coercion in the Recharts `tickFormatter`.

**Q: Where can I find the raw legal dataset?**  
A: The dataset is privately securely managed inside the MongoDB Atlas cluster and accessed purely via the backend APIs.

---

## License
Distributed under the MIT License. See `LICENSE` for more information.

---

## Author
**Himmat Mundhe**  
*Full-Stack Engineer*