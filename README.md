# LogiGuard360 – Full Stack (Frontend + Backend)

This ZIP contains a working **Express + MongoDB backend** and the **HTML/CSS/JS frontend**.

## Run (recommended: single command, backend serves frontend)
1) Start MongoDB (local) or use MongoDB Atlas.
2) Go to backend folder:
```bash
cd backend
cp .env.example .env
npm install
npm start
```
3) Open:
- http://localhost:5000

The frontend is served from `backend/public/` and calls the API at:
- http://localhost:5000/api

## Default seed accounts (password: Password123!)
- admin@logiguard360.local  (systemAdministrator)
- manager@logiguard360.local (warehouseManager)
- staff@logiguard360.local  (logisticsStaff)

## If you want to run frontend separately
Open `frontend/login.html` with VS Code **Live Server** and set API Base URL to:
- `http://localhost:5000/api`

## Endpoints implemented (match frontend)
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET  `/api/dashboard`
- GET  `/api/training/content`
- POST `/api/training/assign`
- GET  `/api/training/progress?userId&contentId`
- GET  `/api/warehouses`
- GET  `/api/warehouses/:id/hotspots`
- GET  `/api/warehouses/:id/status`
- POST `/api/feedback`
- POST `/api/reports/generate`
- POST `/api/hotspotDetector/detect`
- POST `/api/hotspotDetector/calibrate`
- GET  `/api/admin/users`
- POST `/api/admin/users/disable`
- GET  `/api/admin/audit`
- POST `/api/manager/warehouse/configure`
