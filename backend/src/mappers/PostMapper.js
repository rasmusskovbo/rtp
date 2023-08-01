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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostMapper = void 0;
const PostEntity_1 = require("../database/entities/PostEntity");
const typeorm_1 = require("typeorm");
class PostMapper {
    static toDTO(amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const postRepository = (0, typeorm_1.getRepository)(PostEntity_1.PostsEntity);
            const takeAmount = amount !== undefined ? amount : 500;
            const posts = yield postRepository.find({
                order: {
                    createdAt: 'DESC'
                },
                take: takeAmount
            });
            return posts.map((post) => ({
                id: post.id,
                author: post.author,
                title: post.title,
                type: post.type,
                content: post.content,
                contentLink: post.contentLink,
                createdAt: post.createdAt,
            }));
        });
    }
}
exports.PostMapper = PostMapper;
