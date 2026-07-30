import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import profileRouter from './routes/profile';
import problemsRouter from './routes/problems';
import contestsRouter from './routes/contests';
import activityRouter from './routes/activity';
import submissionsRouter from './routes/submissions';
import { LeetCodeApiError } from './services/leetcodeApi';

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// Basic protection against hammering the LeetCode public API through us.
const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'leetcode-tracker-backend' });
});

app.use('/api/profile', profileRouter);
app.use('/api/problems', problemsRouter);
app.use('/api/contests', contestsRouter);
app.use('/api/activity', activityRouter);
app.use('/api/submissions', submissionsRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'NotFound', message: 'Route not found' });
});

// Central error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof LeetCodeApiError) {
    res.status(err.status).json({ error: err.name, message: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'InternalError', message: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`LeetCode Tracker API listening on port ${PORT}`);
});
