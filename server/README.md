# ScoreTeam REST API Server

A Node.js Express REST API server that replaces Supabase queries for the ScoreTeam application, using Slonik for PostgreSQL database operations.

## Features

- 🔐 **Authentication & Authorization** - JWT-based authentication with role-based access control
- 📊 **Dashboard Analytics** - Comprehensive dashboard endpoints with aggregated data
- 🛡️ **Security** - Helmet, CORS, rate limiting, and input validation
- 📝 **Logging** - Request logging with Morgan
- 🔄 **Database** - PostgreSQL with Slonik query builder and connection pooling
- ✅ **Validation** - Request validation using Joi
- 🐳 **Docker Ready** - Complete Docker setup with docker-compose
- 📦 **Migrations** - SQL-based migrations with automatic tracking

## Tech Stack

- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **ORM**: Slonik (SQL query builder with connection pooling)
- **Authentication**: JWT
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Containerization**: Docker & Docker Compose

## API Documentation

The API is fully documented using Swagger/OpenAPI 3.0. You can access the interactive documentation at:

- **Development**: http://localhost:3001/api-docs
- **Production**: https://api.scoreteam.com/api-docs

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/phone` - Update user phone (protected)

#### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Agents
- `GET /api/agents` - Get all agents
- `GET /api/agents/:id` - Get specific agent
- `POST /api/agents` - Create new agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

#### Score Types
- `GET /api/score-types` - Get all score types
- `POST /api/score-types` - Create new score type
- `PUT /api/score-types/:id` - Update score type
- `DELETE /api/score-types/:id` - Delete score type

#### Scores
- `GET /api/scores` - Get all scores
- `POST /api/scores` - Create new score
- `PUT /api/scores/:id` - Update score
- `DELETE /api/scores/:id` - Delete score

#### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/monthly-scores?year=2024&month=1` - Get monthly scores by agent
- `GET /api/dashboard/score-types-distribution?year=2024` - Get score types distribution
- `GET /api/dashboard/agent-comparison?year=2024` - Get agent comparison data

## Quick Start

### Using Docker (Recommended)

1. **Clone the repository and navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Deploy using the main deployment script:**
   ```bash
   # From the project root
   ./deploy.sh deploy development
   ```

### Manual Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=scoreteam
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=http://localhost:5173
   ```

3. **Set up PostgreSQL database:**
   - Install PostgreSQL 15+
   - Create a database named `scoreteam`
   - Update the connection details in `.env`

4. **Run migrations:**
   ```bash
   npm run migrate
   ```

5. **Start the server:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Database Migrations

The server uses SQL-based migrations stored in `src/migrations/`. Each migration file follows the naming convention: `001_description.sql`.

### Running Migrations

```bash
# Run all pending migrations
npm run migrate

# Create a new migration (manual)
npm run migrate:create
```

### Migration Files

- `001_create_users_table.sql` - Users table with authentication
- `002_create_agents_table.sql` - Agents management
- `003_create_score_types_table.sql` - Score types configuration
- `004_create_scores_table.sql` - Scores with relationships
- `005_create_migrations_table.sql` - Migration tracking
- `006_seed_initial_data.sql` - Initial seed data

## Docker Deployment

### Development Mode

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f api
```

### Production Mode

```bash
# Start production environment
docker-compose up --build -d

# View logs
docker-compose logs -f api
```

### Using the Deployment Script

```bash
# Deploy in development mode
./deploy.sh deploy development

# Deploy in production mode
./deploy.sh deploy production

# Deploy with clean images
./deploy.sh deploy production --clean

# View logs
./deploy.sh logs api

# Stop services
./deploy.sh stop
```

## Database Schema

The server expects the following PostgreSQL tables:

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Agents Table
```sql
CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Score Types Table
```sql
CREATE TABLE score_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    score_value INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Scores Table
```sql
CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    score_type_id INTEGER NOT NULL REFERENCES score_types(id) ON DELETE CASCADE,
    assigned_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score_date DATE NOT NULL DEFAULT CURRENT_DATE,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - Admin and regular user roles
- **Input Validation** - All inputs validated using Joi schemas
- **Rate Limiting** - Prevents abuse with configurable limits
- **CORS Protection** - Configurable cross-origin resource sharing
- **Security Headers** - Helmet.js for security headers
- **SQL Injection Protection** - Slonik prevents SQL injection
- **Connection Pooling** - Efficient database connection management

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database name | scoreteam |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | JWT expiration | 24h |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:5173 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit max requests | 100 |

## API Response Format

### Success Response
```json
{
  "data": "Response data",
  "message": "Success message (optional)"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": ["Validation errors"]
}
```

## Health Check

The server provides a health check endpoint at `GET /health`:

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

## Default Credentials

After running migrations, you can log in with:

- **Username**: `admin`
- **Password**: `admin123`

## Development

### Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── database.js          # Slonik database configuration
│   │   └── swagger.js           # Swagger/OpenAPI configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── userController.js    # User management
│   │   ├── agentController.js   # Agent management
│   │   ├── scoreTypeController.js # Score types
│   │   ├── scoreController.js   # Scores management
│   │   └── dashboardController.js # Dashboard analytics
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   └── validation.js        # Request validation
│   ├── migrations/
│   │   ├── 001_create_users_table.sql
│   │   ├── 002_create_agents_table.sql
│   │   ├── 003_create_score_types_table.sql
│   │   ├── 004_create_scores_table.sql
│   │   ├── 005_create_migrations_table.sql
│   │   ├── 006_seed_initial_data.sql
│   │   └── run-migrations.js    # Migration runner
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── users.js             # User routes
│   │   ├── agents.js            # Agent routes
│   │   ├── scoreTypes.js        # Score type routes
│   │   ├── scores.js            # Score routes
│   │   └── dashboard.js         # Dashboard routes
│   └── index.js                 # Express app entry point
├── Dockerfile                   # Production Docker image
├── Dockerfile.dev               # Development Docker image
├── package.json                 # Dependencies and scripts
├── env.example                  # Environment variables template
└── README.md                    # This file
```

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run migrate` - Run database migrations
- `npm run migrate:create` - Create new migration file
- `npm test` - Run tests

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check if PostgreSQL is running
   - Verify database credentials in `.env`
   - Ensure database `scoreteam` exists

2. **Migration Errors**
   - Check if migrations table exists
   - Verify SQL syntax in migration files
   - Ensure database user has proper permissions

3. **Docker Issues**
   - Check if Docker is running
   - Verify ports are not in use
   - Check Docker logs: `docker-compose logs api`

### Logs

View logs for debugging:

```bash
# Docker logs
docker-compose logs -f api

# Local development
npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
