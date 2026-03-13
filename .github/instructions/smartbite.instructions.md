# SmartBite – Copilot Development Instructions

## Project Overview

SmartBite is a full-stack mobile application designed to reduce food waste by enabling supermarkets to sell near-expiry grocery products at discounted prices.

The platform connects consumers with nearby supermarkets and allows users to browse, search, reserve, and purchase discounted items before they expire.

The project is developed as part of an Innovation Management course.

---

## Technology Stack

Backend:
- Python
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic (database migrations)
- Docker

Frontend:
- React Native (Expo)
- TypeScript
- Expo Router
- REST API communication with FastAPI backend

---

## Architecture Overview

The repository is structured as a monorepo with two main services: backend and frontend

Backend exposes a REST API used by the mobile application.

The frontend communicates with the backend through service modules located in `frontend/services`.

---

# Backend Guidelines

Backend is implemented using **FastAPI**.

Main structure:
backend/app/
routers/ # FastAPI route definitions
services/ # Business logic
models/ # SQLAlchemy ORM models
schemas/ # Pydantic schemas
core/ # Config, authentication, utilities

### Rules

- Keep **routers thin** (no business logic).
- Business logic belongs in **services**.
- Database access should be separated from route handlers.
- Use **Pydantic schemas** for request/response validation.
- Use **type hints everywhere**.

Example structure:
router -> service -> database/model
---

# Database Model Concepts

Important entities:

- Users
- Supermarkets
- Products
- Categories
- Reservations
- Favorites

Product fields should include:

- id
- name
- category_id
- supermarket_id
- original_price
- discounted_price
- expiration_date
- remaining_stock

---

# Frontend Guidelines

Frontend is built using **React Native with Expo Router**.

Structure:
frontend/
├── app/ # Screens (Expo Router routes)
├── components/ # Reusable UI components
├── hooks/ # Custom hooks
├── services/ # API communication
├── utils/ # Helper functions
├── types/ # TypeScript interfaces
├── constants/ # Global constants
├── assets/ # Images, fonts, icons

### Rules

- Screens should only handle UI logic.
- API calls must be placed inside `services/`.
- Shared UI components must be placed in `components/`.
- Reusable logic should be implemented as hooks in `hooks/`.

---

# Coding Standards

Backend:
- Follow **PEP8**
- Use **type hints**
- Write modular services

Frontend:
- Use **TypeScript types/interfaces**
- Use functional components
- Prefer reusable components
- Keep screens clean and readable

---

# MVP Feature Priorities

The core features for the MVP are:

1. User registration and login
2. Browse nearby supermarkets
3. View discounted near-expiry products
4. Product search
5. Favorites (products & supermarkets)
6. Reservation of products for pickup

---

# Copilot Guidance

When generating code:

- Follow FastAPI best practices
- Use clean architecture patterns
- Avoid putting business logic in route handlers
- Prefer reusable services and hooks
- Ensure API endpoints are consistent with existing patterns
- Keep frontend components small and modular
