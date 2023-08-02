import express, { Request, Response } from 'express';
import { AuthService } from '../services/AuthService'; // assuming AuthService is in the same directory

const router = express.Router();
const authService = new AuthService();

router.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    console.log("Received login request: " + username +", "+password)

    try {
        const user = await authService.validateUser(username, password);
        if (user) {
            // login successful
            // depending on your setup, you might want to create a JWT and send it here
            console.log("Login was successful")
            return res.json({ success: true, username: user.username });
        } else {
            // login failed
            console.log("Login was unsuccessful")
            return res.status(401).json({ success: false });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false });
    }
});

export default router;
