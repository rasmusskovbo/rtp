import express from 'express';
import { PostMapper } from '../mappers/PostMapper';

const router = express.Router();

// add query with number to take
router.get('/posts', async (req, res) => {
    const postsDTO = await PostMapper.toDTO();
    res.json(postsDTO);
});

export default router;
