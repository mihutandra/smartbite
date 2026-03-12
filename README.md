# SmartBite

SmartBite is a full-stack application built with FastAPI, React Native, and PostgreSQL to reduce food waste by enabling real-time sale of near-expiry supermarket products.

## 🛠️ Framework

We decided to use Python for Backend with FastAPI, React Native for Frontend, PostgreSQL for database, and Docker to containerize the app.

## 💭 Opportunity Statement

Food waste at the retail level remains a significant economic and environmental problem, as supermarkets struggle to efficiently sell near-expiry products before they are discarded. At the same time, consumers face rising food prices and limited visibility into discounted items available in nearby stores.

There is an opportunity to create a digital platform that connects supermarkets and consumers in real time, enabling the efficient sale of near-expiry products at reduced prices. By leveraging modern web technologies (FastAPI, PostgreSQL, React Native), the platform can increase product visibility, improve inventory turnover, reduce waste, and make food more affordable.

Our solution creates value for:

- **Supermarkets**: By reducing financial losses and improving stock management.
- **Consumers**: By providing access to transparent, location-based discounted products.
- **Society**: By contributing to sustainability and reducing food waste.

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (for frontend development)

### Running the Application

1. **Clone the repository** (if not already done).

2. **Backend**:
   - Navigate to `backend/`
   - Run `docker-compose up` to start the FastAPI server and PostgreSQL database.

3. **Frontend**:
   - Navigate to `frontend/`
   - Install dependencies: `npm install`
   - Start the Expo app: `npx expo start`
   - Use Expo Go to run on device.

### Project Structure
- `backend/` - FastAPI application with database models and API endpoints.
- `frontend/` - React Native Expo app for mobile interface.
- `docs/` - Additional documentation (if any).

