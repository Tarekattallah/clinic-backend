# MediCare — Backend API

Node.js + Express + MongoDB REST API for the MediCare clinic management system.

## Quick Start

```bash
npm install
cp .env.example .env      # Fill in your values
npm run dev               # Development (nodemon)
npm start                 # Production
```

## Environment Variables

| Variable       | Description                              | Required |
|----------------|------------------------------------------|----------|
| `PORT`         | Server port (default: 5000)              | No       |
| `NODE_ENV`     | `development` or `production`            | No       |
| `MONGO_URI`    | MongoDB connection string                | ✅ Yes   |
| `JWT_SECRET`   | Secret key (32+ chars)                   | ✅ Yes   |
| `FRONTEND_URL` | Frontend URL for CORS (no trailing /)    | ✅ Yes   |
| `BACKEND_URL`  | Backend public URL (for avatar URLs)     | ✅ Yes   |

## API Endpoints

### Auth
- `POST /api/auth/register` — Register (patient/doctor/admin)
- `POST /api/auth/login` — Login

### Doctors
- `GET  /api/doctors` — List all doctors
- `GET  /api/doctors/:id` — Get doctor by ID
- `GET  /api/doctors/profile/me` — My profile (doctor)
- `PUT  /api/doctors/profile/me` — Update my profile (doctor)
- `POST /api/doctors/profile/avatar` — Upload avatar (doctor)
- `DELETE /api/doctors/profile/avatar` — Remove avatar (doctor)

### Appointments
- `GET  /api/appointments` — My appointments
- `POST /api/appointments` — Book appointment (patient)
- `GET  /api/appointments/doctor/:id/available` — Available slots
- `PATCH /api/appointments/:id/status` — Update status (doctor)
- `DELETE /api/appointments/:id` — Cancel

### Medical Records
- `POST /api/medical-records/appointment/:id` — Add record (doctor)
- `GET  /api/medical-records/appointment/:id` — Get record

### Admin (admin only)
- `GET    /api/admin/users` — All users
- `POST   /api/admin/users` — Create user
- `PUT    /api/admin/users/:id` — Update user
- `DELETE /api/admin/users/:id` — Delete user
- `GET    /api/admin/appointments` — All appointments
- `GET    /api/admin/reports` — Statistics

## Deployment (Render)

1. Create a new Web Service on [render.com](https://render.com)
2. Connect your GitHub repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables in Render dashboard
