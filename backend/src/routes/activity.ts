import { Router, Request, Response, NextFunction } from 'express';
import { fetchActivity } from '../services/leetcodeApi';

const router = Router();

router.get('/:username', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await fetchActivity(req.params.username);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
