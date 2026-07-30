import { Router, Request, Response, NextFunction } from 'express';
import { fetchContestStats } from '../services/leetcodeApi';

const router = Router();

router.get('/:username', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await fetchContestStats(req.params.username);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
