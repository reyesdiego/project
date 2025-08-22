# ScoreTeam - Supabase Client Architecture

This project has been migrated from an Express.js backend to a direct Supabase client-side architecture.

## 🏗️ Architecture Overview

- **Frontend**: React + TypeScript + Vite
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (client-side)
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS

## 🚀 Getting Started

### Prerequisites

1. **Supabase Project**: Ensure you have a Supabase project set up
2. **Environment Variables**: Configure your `.env` file with Supabase credentials

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## 📊 Database Schema

The application uses the following Supabase tables:

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'visualizador' CHECK (role IN ('admin', 'evaluador', 'visualizador')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Agents Table
```sql
CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  area VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  hire_date DATE NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Score Types Table
```sql
CREATE TABLE score_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  score_value INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Scores Table
```sql
CREATE TABLE scores (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
  score_type_id INTEGER REFERENCES score_types(id) ON DELETE CASCADE,
  assigned_by INTEGER REFERENCES users(id),
  score_date DATE NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 Authentication

Currently using a simple client-side authentication system:

- **Login**: Username/password stored in localStorage
- **Session**: User data persisted in localStorage
- **Logout**: Clears localStorage and Supabase session

### Default Users

- **Admin**: `admin` / `admin123`
- **Evaluator**: `evaluador` / `eval123`
- **Visualizer**: `visualizador` / `view123`

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── common/         # Shared components
│   └── ...
├── lib/                # Library configurations
│   └── supabase.ts     # Supabase client setup
├── pages/              # Page components
├── services/           # API services
│   └── api.ts          # Supabase API functions
├── store/              # Redux store
│   ├── slices/         # Redux slices
│   └── store.ts        # Store configuration
└── ...
```

## 🔧 API Functions

The `src/services/api.ts` file contains all Supabase API functions:

### Authentication
- `login(username, password)`
- `logout()`
- `getCurrentUser()`
- `updateUserPhone(phone)`

### User Management
- `getUsers()`
- `createUser(userData)`
- `updateUser(id, userData)`
- `deleteUser(id)`

### Agent Management
- `getAgents()`
- `getAgent(id)`
- `createAgent(agentData)`
- `updateAgent(id, agentData)`
- `deleteAgent(id)`

### Score Types
- `getScoreTypes()`
- `createScoreType(scoreTypeData)`
- `updateScoreType(id, scoreTypeData)`
- `deleteScoreType(id)`

### Scores
- `getScores()`
- `createScore(scoreData)`
- `updateScore(id, scoreData)`
- `deleteScore(id)`

### Dashboard
- `getDashboardData()`

## 🛡️ Row Level Security (RLS)

For production, implement Row Level Security policies in Supabase:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Example policy for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);
```

## 🚀 Deployment

### Vercel/Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in your hosting platform

### Supabase
1. Run migrations: `npx supabase db push`
2. Deploy frontend to your preferred hosting service
3. Configure environment variables

## 🔄 Migration from Express

### What Changed
- ❌ Removed Express.js server
- ❌ Removed JWT authentication
- ❌ Removed bcrypt password hashing
- ✅ Added Supabase client SDK
- ✅ Direct database queries from frontend
- ✅ Simplified authentication flow

### Benefits
- **Simplified Architecture**: No backend server to maintain
- **Real-time Features**: Supabase provides real-time subscriptions
- **Built-in Auth**: Supabase Auth can replace custom authentication
- **Automatic API**: Supabase generates REST and GraphQL APIs
- **Database Management**: Built-in database management and migrations

## 🔮 Future Improvements

1. **Supabase Auth**: Replace custom authentication with Supabase Auth
2. **Real-time Updates**: Implement real-time subscriptions for live data
3. **Row Level Security**: Add proper RLS policies for production
4. **Edge Functions**: Use Supabase Edge Functions for complex operations
5. **Storage**: Use Supabase Storage for file uploads

## 🐛 Troubleshooting

### Common Issues

1. **Environment Variables**: Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
2. **CORS**: Supabase handles CORS automatically
3. **Authentication**: Check localStorage for user data
4. **Database Permissions**: Ensure RLS policies allow necessary operations

### Debug Mode

Enable Supabase debug mode in development:

```typescript
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    debug: true
  }
});
``` 