# ScoreTeam - Supabase Configuration

This guide explains how to configure ScoreTeam to work with Supabase as the database backend.

## 🚀 Quick Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Wait for the project to be ready (usually 1-2 minutes)

### 2. Get Your Credentials

From your Supabase project dashboard:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`)

3. Go to **Settings** → **Database**
4. Copy the **Connection string** (URI format)

### 3. Configure Environment Variables

Update your `server/.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRES_IN=24h
PORT=3001
```

### 4. Initialize the Database

The server will automatically create the required tables and insert sample data when it starts for the first time.

## 📊 Database Schema

The following tables will be created automatically:

### Tables:
- **users** - System users with roles (admin, evaluador, visualizador)
- **agents** - Agents to be evaluated
- **score_types** - Configurable score types with values
- **scores** - Assigned scores linking agents and score types

### Sample Data:
- **Admin user**: `admin` / `admin123`
- **Evaluator user**: `evaluador` / `eval123`
- **Viewer user**: `visualizador` / `view123`
- **6 sample agents** with different areas and positions
- **8 score types** including positive and negative scores
- **Sample scores** for current and previous months

## 🔧 Development Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Start the Server

```bash
npm run dev
```

The server will:
1. Test the database connection
2. Initialize tables and sample data (if needed)
3. Start on port 3001

### 3. Verify Setup

- **API Health**: http://localhost:3001/api/health
- **Test Login**: POST to http://localhost:3001/api/auth/login
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```

## 🌐 Frontend Configuration

Update your frontend `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔒 Security Notes

### Row Level Security (RLS)
The application uses server-side authentication with JWT tokens. RLS is not enabled by default since the backend handles all authorization.

### API Keys
- **anon key**: Used by the frontend for public operations
- **service_role key**: Used by the backend for administrative operations
- Never expose the service_role key in frontend code

## 🛠️ Troubleshooting

### Connection Issues
```bash
# Test connection manually
psql "postgresql://postgres:[PASSWORD]@db.your-project.supabase.co:5432/postgres"
```

### Common Errors

**"relation does not exist"**
- The tables haven't been created yet
- Restart the server to trigger initialization

**"password authentication failed"**
- Check your DATABASE_URL password
- Verify credentials in Supabase dashboard

**"SSL connection required"**
- Make sure SSL is enabled in production
- Check the database.ts configuration

### Reset Database
To start fresh:
1. Go to Supabase Dashboard → SQL Editor
2. Run: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
3. Restart your server to reinitialize

## 📈 Monitoring

### Supabase Dashboard
- **Database**: View tables, run queries
- **Auth**: Manage authentication (if using Supabase auth)
- **API**: Monitor API usage
- **Logs**: View real-time logs

### Server Logs
```bash
# View server logs
npm run dev

# Look for:
✅ Database connection successful
✅ Database initialized successfully!
🚀 Server running on port 3001
```

## 🚀 Production Deployment

### Environment Variables
Set these in your production environment:
- `NODE_ENV=production`
- `DATABASE_URL` (with production credentials)
- `JWT_SECRET` (strong, unique secret)
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

### SSL Configuration
Production connections automatically use SSL. For development, SSL is disabled to work with local setups.