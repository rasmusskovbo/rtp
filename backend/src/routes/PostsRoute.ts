import express, { Request, Response } from 'express';
import { PostMapper } from '../mappers/PostMapper';

const router = express.Router();

router.get('/posts', async (req: Request, res: Response) => {
    const numberToTake = req.query.amount ? parseInt(req.query.amount as string) : undefined;
    const postsDTO = await PostMapper.toDTO(numberToTake);
    res.json(postsDTO);
});

export default router;
