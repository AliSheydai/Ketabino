# Ketabino

A book reading and writing platform built with Next.js and ASP.NET Core.

## Prerequisites

- **.NET 8 SDK** - For running the backend
- **Node.js 18+** - For running the frontend
- **SQLite** - Database (automatically created on first run)

---

## Running Without Docker

### 1. Run the Backend

```bash
# Navigate to the project root
cd ketabino

# Restore dependencies
dotnet restore

# Run the backend (starts on http://localhost:5000)
dotnet run
```

The backend will:
- Create the SQLite database automatically on first run
- Initialize the database schema
- Start listening on `http://localhost:5000`

### 2. Run the Frontend

Open a new terminal window:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server (starts on http://localhost:3000)
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Swagger API Docs**: http://localhost:5000/swagger (development only)

---

## Project Structure

```
ketabino/
├── backend/              # ASP.NET Core Web API
│   ├── Controllers/      # API endpoints
│   ├── Database/         # Database connection and schema
│   ├── Models/           # Data models
│   ├── Services/         # Business logic services
│   └── Program.cs        # Application entry point
├── frontend/             # Next.js application
│   ├── app/              # App router pages
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   └── types/            # TypeScript types
├── Controllers/          # Root-level controllers (if any)
├── Models/               # Root-level models (if any)
└── Database/             # Root-level database files
```

---

## Environment Variables

### Backend (appsettings.Development.json)
The backend uses default values, but you can customize:

```json
{
  "Jwt": {
    "SecretKey": "YourSecretKey1234567890!@#$",
    "Issuer": "KetabinoApi",
    "Audience": "KetabinoClient"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=ketabino.db"
  }
}
```

### Frontend (.env.local)
Create `frontend/.env.local` if needed:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Database

SQLite is used by default. The database file (`ketabino.db`) is created automatically in the backend directory on first run.

### Database Schema
The schema is initialized automatically via `SchemaInitializer` on application startup.

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Books
- `GET /api/books` - List all books
- `GET /api/books/{id}` - Get book details
- `POST /api/books` - Create a new book (authenticated)
- `PUT /api/books/{id}` - Update a book (authenticated)
- `DELETE /api/books/{id}` - Delete a book (authenticated)

### Chapters
- `GET /api/chapters/book/{bookId}` - List chapters for a book
- `GET /api/chapters/{id}` - Get chapter details
- `POST /api/chapters` - Create a chapter (authenticated)
- `PUT /api/chapters/{id}` - Update a chapter (authenticated)

### Genres
- `GET /api/genres` - List all genres

### Subscriptions
- `GET /api/subscriptions` - List subscription plans
- `POST /api/subscriptions/subscribe` - Subscribe to a plan (authenticated)

### Wallet
- `GET /api/wallet/balance` - Get user balance (authenticated)
- `POST /api/wallet/deposit` - Deposit funds (authenticated)

### Reading Progress
- `GET /api/reading-progress/{bookId}` - Get reading progress (authenticated)
- `POST /api/reading-progress` - Update reading progress (authenticated)

### Notifications
- `GET /api/notifications` - Get user notifications (authenticated)

### Reports
- `POST /api/reports` - Submit a report (authenticated)

### Admin
- `GET /api/admin/stats` - Get admin statistics (admin only)
- `GET /api/admin/users` - List all users (admin only)

---

## Running with Docker (Alternative)

If you prefer Docker, see [DOCKER.md](./DOCKER.md) for instructions.

---

## Troubleshooting

### CORS Errors
Make sure the backend is running on port 5000 and the frontend on port 3000.

### Database Issues
Delete `ketabino.db` and restart the backend to recreate the database.

### Port Already in Use
- Backend: Change the port in `Properties/launchSettings.json`
- Frontend: Set `PORT=3001` environment variable