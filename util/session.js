import express from 'express';
const router = express.Router();

// todo impl auth
router.get("/session", (req, res) => {
    res.send(req.session)
})

export default router