import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import auditRoutes from './routes/auditRoutes';
import paymentRoutes from './routes/paymentRoutes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Stripe webhook needs raw body - must be before express.json()
app.use('/api/webhook/stripe', express.raw({ type: 'application/json' }));

// JSON parsing for all other routes
app.use(express.json());
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api', paymentRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 StackAudit API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
