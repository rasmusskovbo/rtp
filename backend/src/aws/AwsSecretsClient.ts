import AWS from 'aws-sdk';
import dotenv from "dotenv";

dotenv.config()

const secretsManager = new AWS.SecretsManager({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || undefined,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || undefined,
});

export function getSecretValue(secretName: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
        secretsManager.getSecretValue({ SecretId: secretName }, (err, data) => {
            if (err) {
                console.error(err);
                resolve(null);
            } else {
                resolve(data.SecretString ? data.SecretString : null);
            }
        });
    });
}


