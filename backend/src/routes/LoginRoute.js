"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthService_1 = require("../services/AuthService"); // assuming AuthService is in the same directory
const router = express_1.default.Router();
const authService = new AuthService_1.AuthService();
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    console.log("Received login request: " + username + ", " + password);
    try {
        const user = yield authService.validateUser(username, password);
        if (user) {
            // login successful
            // depending on your setup, you might want to create a JWT and send it here
            console.log("Login was successful");
            return res.json({ success: true });
        }
        else {
            // login failed
            console.log("Login was unsuccessful");
            return res.status(401).json({ success: false });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false });
    }
}));
exports.default = router;
