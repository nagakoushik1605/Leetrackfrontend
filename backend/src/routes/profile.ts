import { Router, Request, Response, NextFunction } from 'express';
import { fetchProfile, verifyUsername } from '../services/leetcodeApi';

const router = Router();

// GET /api/profile/verify/:username - quick existence check used by the landing page
router.get('/verify/:username', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const exists = await verifyUsername(req.params.username);
    res.json({ exists });
  } catch (err) {
    next(err);
  }
});

// GET /api/profile/:username
router.get('/:username', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await fetchProfile(req.params.username);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

export default router;
