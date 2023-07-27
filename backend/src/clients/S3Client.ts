import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';

aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: 'eu-central-1' // Your AWS region
});

const s3: any = new aws.S3();

const upload: multer.Multer = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME!,
        acl: 'public-read',
        metadata: (req, file, cb) => {
            console.log(`Handling metadata for file: ${file.fieldname}`);
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            console.log(`Handling metadata for file: ${file.originalname}`);
            cb(null, Date.now().toString())
        }
    })
});

export default upload;
