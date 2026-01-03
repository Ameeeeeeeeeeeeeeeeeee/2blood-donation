# Blood Donation Website

A full-stack blood donation platform built with Django REST Framework and React (Vite). This application allows donors to schedule blood donations, track their donation history, and see the impact of their contributions. Admins can manage donation schedules and track hospital statistics.

## Features

### For Donors:
- User registration and authentication
- Profile management with image upload
- Schedule blood donations (come to station or home visit)
- View donation statistics (total donations, lives saved)
- View hospital statistics
- Dashboard with personal stats

### For Admins:
- Manage donation schedules (mark as done/canceled)
- Update lives saved when blood is used
- Add and manage hospitals
- View all donation schedules

## Tech Stack

### Backend:
- Django 4.2.7
- Django REST Framework 3.14.0
- Django REST Framework Simple JWT 5.3.0
- SQLite3 (development database)
- Pillow (for image handling)

### Frontend:
- React 18.2.0
- Vite 5.0.8
- React Router DOM 6.20.0
- Axios 1.6.2
- React Hook Form 7.48.2

## Project Structure

```
blood-v2/
├── backend/                 # Django project
│   ├── blood_donation/      # Main Django app
│   │   ├── models.py        # Database models
│   │   ├── serializers.py   # DRF serializers
│   │   ├── views.py         # API views
│   │   ├── urls.py          # API routes
│   │   └── admin.py         # Admin configuration
│   ├── config/              # Django settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── manage.py
│   └── requirements.txt
├── frontend/                # React + Vite
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── context/         # Auth context
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- On Windows:
```bash
venv\Scripts\activate
```
- On macOS/Linux:
```bash
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Create a superuser (for admin access):
```bash
python manage.py createsuperuser
```

7. Run the development server:
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/token/refresh/` - Refresh JWT token

### Donor Endpoints
- `GET /api/donor/profile/` - Get donor profile
- `PATCH /api/donor/profile/update/` - Update donor profile
- `GET /api/donor/dashboard/` - Get dashboard stats

### Donation Endpoints
- `POST /api/donations/schedule/` - Schedule a donation
- `GET /api/donations/schedules/` - List all schedules

### Hospital Endpoints
- `GET /api/hospitals/` - List all hospitals
- `GET /api/hospitals/<id>/` - Get hospital details

### Admin Endpoints
- `PATCH /api/admin/schedules/<id>/done/` - Mark schedule as done
- `PATCH /api/admin/schedules/<id>/cancel/` - Mark schedule as canceled
- `PATCH /api/admin/records/<id>/update-lives/` - Update lives saved
- `POST /api/admin/hospitals/add/` - Add a new hospital

## Usage

1. Start both backend and frontend servers
2. Visit `http://localhost:5173` in your browser
3. Register as a donor or admin
4. For admin access, use the superuser account created during setup
5. Donors can schedule donations, update profiles, and view statistics
6. Admins can manage schedules and hospitals

## Initial Setup

After running migrations, you may want to:

1. Add hospitals via the admin dashboard or Django admin panel
2. Create test donor accounts
3. Test the donation scheduling flow

## Notes

- The application uses SQLite3 for development. For production, consider using PostgreSQL or MySQL.
- JWT tokens are used for authentication. Tokens expire after 24 hours (access) and 7 days (refresh).
- Profile images are stored in `backend/media/donor_profiles/`
- CORS is configured to allow requests from `http://localhost:5173`

## Development

- Backend API documentation available at `http://localhost:8000/api/` (if DRF browsable API is enabled)
- Frontend hot-reloads automatically when files change
- Backend requires server restart for code changes

## License

This project is open source and available for educational purposes.

