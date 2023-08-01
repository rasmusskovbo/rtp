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
const S3Client_1 = __importDefault(require("../aws/S3Client"));
const PostEntity_1 = require("../database/entities/PostEntity");
const typeorm_1 = require("typeorm");
const uploadRouter = express_1.default.Router();
uploadRouter.post('/upload', S3Client_1.default.single('file'), // This should run first
(req, res, next) => {
    console.log(req.body);
    next();
}, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Received upload request");
    const file = req.file; // bypass TypeScript compiler checks
    const { title, author, type, content } = req.body;
    const postsRepository = (0, typeorm_1.getRepository)(PostEntity_1.PostsEntity);
    const newPost = new PostEntity_1.PostsEntity();
    newPost.title = title;
    newPost.author = author;
    newPost.type = type;
    if (newPost.type === PostEntity_1.ContentType.TEXT || newPost.type == PostEntity_1.ContentType.PDF) {
        newPost.content = content;
    }
    if (file) {
        newPost.contentLink = file.location;
    }
    try {
        yield postsRepository.save(newPost);
        return res.status(201).json({
            message: 'Post created successfully',
            post: newPost
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while saving the post.' });
    }
}));
exports.default = uploadRouter;
