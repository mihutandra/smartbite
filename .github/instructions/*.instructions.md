# SmartBite – Copilot Development Instructions

## 1) Project Purpose

SmartBite is a full-stack mobile app that helps reduce food waste by enabling supermarkets to sell near-expiry products at discounted prices.

Users can discover nearby supermarkets, browse discounted products, save favorites, and reserve items for pickup.

---

## 2) Tech Stack

### Backend
- Python
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- Docker

### Frontend
- React Native (Expo)
- TypeScript
- Expo Router
- REST API integration with FastAPI

---

## 3) High-Level Architecture

SmartBite is a monorepo with two services:
- `backend` (REST API)
- `frontend` (mobile app)

Backend exposes API endpoints consumed by frontend service modules.

Preferred flow:

`route/screen -> service -> repository/API client -> data source`

---

## 4) Backend Specifications

Backend follows FastAPI clean architecture principles.

Expected structure:

```
backend/app/
├── routers/       # HTTP endpoints
├── services/      # Business logic
├── repositories/  # Data access abstraction (if present)
├── models/        # SQLAlchemy ORM models
├── schemas/       # Pydantic request/response schemas
├── core/          # Config, auth, utilities
└── exceptions/    # Custom exception types
```

### Backend rules

- Keep routers thin: no business logic in route handlers.
- Put domain/business logic in `services/`.
- Keep database access out of routers.
- Use Pydantic schemas for all request/response contracts.
- Add type hints everywhere.
- Use dependency injection for DB session and auth contexts.
- Keep endpoint naming and HTTP methods REST-consistent.

### Backend quality guidelines

- Follow PEP8.
- Prefer small, testable functions.
- Raise meaningful domain exceptions and map them to proper HTTP responses.
- Keep DTO/schema naming explicit (`Create`, `Update`, `Response`, etc.).

---

## 5) Database Domain Concepts

Core entities:
- Users
- Supermarkets
- Products
- Categories
- Reservations
- Favorites

Minimum `Product` fields:
- `id`
- `name`
- `category_id`
- `supermarket_id`
- `original_price`
- `discounted_price`
- `expiration_date`
- `remaining_stock`

---

## 6) Frontend Specifications

Frontend is built with React Native + Expo Router + TypeScript.

Expected structure:

```
frontend/
├── app/          # Expo Router screens/routes
├── components/   # Reusable presentational components
├── hooks/        # Reusable stateful logic
├── services/     # API clients and request modules
├── utils/        # Pure helper functions
├── types/        # Shared TypeScript types/interfaces
├── constants/    # Global constants (colors, routes, config)
└── assets/       # Images, icons, fonts
```

### Frontend rules

- Screens/routes should focus on composition and UI state only.
- Place all API calls in `services/` (never inline fetch calls in screens/components).
- Keep components reusable and presentation-focused.
- Put reusable logic in custom hooks.
- Use strict TypeScript types for API responses, navigation params, and component props.

### Frontend coding standards

- Use functional components only.
- Define explicit prop interfaces for components.
- Keep components small and single-responsibility.
- Avoid duplicated UI patterns; extract shared components.
- Avoid business logic in UI components when it can live in hooks/services.

### Frontend API integration standards

- Centralize base URL and common request config.
- Use typed request/response models in `types/`.
- Normalize and handle API errors in service layer.
- Return consistent data shapes to screens.

### Frontend UX standards

- Handle loading, empty, error, and success states explicitly.
- Show user-friendly error messages.
- Keep navigation flow predictable and minimal.
- Prefer accessible touch targets and readable typography.

---

## 7) MVP Feature Priorities

1. User registration and login
2. Browse nearby supermarkets
3. View discounted near-expiry products
4. Product search
5. Favorites (products and supermarkets)
6. Product reservation for pickup

---

## 8) Copilot Generation Rules

When generating code:

- Follow existing project structure and naming conventions.
- Keep backend routers thin and move logic to services.
- Keep frontend screens clean and delegate API + reusable logic to services/hooks.
- Prefer reusable, modular components and functions.
- Preserve consistency with existing patterns before introducing new ones.
- Generate minimal, focused changes; avoid unrelated refactors.
