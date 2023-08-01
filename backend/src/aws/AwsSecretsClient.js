"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecretValue = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const secretsManager = new aws_sdk_1.default.SecretsManager({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || undefined,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || undefined,
});
function getSecretValue(secretName) {
    return new Promise((resolve, reject) => {
        secretsManager.getSecretValue({ SecretId: secretName }, (err, data) => {
            if (err) {
                console.error(err);
                resolve(null);
            }
            else {
                resolve(data.SecretString ? data.SecretString : null);
            }
        });
    });
}
exports.getSecretValue = getSecretValue;
