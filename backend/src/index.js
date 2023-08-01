"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const db_1 = require("./config/db");
const StatsRoute_1 = __importDefault(require("./routes/StatsRoute"));
const UploadRoute_1 = __importDefault(require("./routes/UploadRoute"));
const cors_1 = __importDefault(require("cors"));
const LoginRoute_1 = __importDefault(require("./routes/LoginRoute"));
const PostsRoute_1 = __importDefault(require("./routes/PostsRoute"));
const app = (0, express_1.default)();
dotenv_1.default.config();
(0, db_1.connectToDb)().then(() => {
    app.use((0, cors_1.default)({
        origin: process.env.CORS_ORIGIN // Replace with your actual origin
    }));
    app.use(express_1.default.json());
    app.use('/api', StatsRoute_1.default);
    app.use('/api', UploadRoute_1.default);
    app.use('/api', PostsRoute_1.default);
    app.use('/auth', LoginRoute_1.default);
}).catch(error => console.log(error));
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
