import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import agentsRoutes from './routes/agents';
import scoreTypesRoutes from './routes/scoreTypes';
import scoresRoutes from './routes/scores';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/score-types', scoreTypesRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('🔄 Starting server initialization...');
    
    // Add timeout for database initialization
    // const initPromise = initializeDatabase();
    // const timeoutPromise = new Promise((_, reject) => {
    //   setTimeout(() => reject(new Error('Database initialization timeout')), 30000);
    // });
    
    // // Initialize database
    // await Promise.race([initPromise, timeoutPromise]);
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`🔗 Database connected and initialized`);
    });
  } catch (error: any) {
    console.error('❌ Failed to start server:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
};

startServer();