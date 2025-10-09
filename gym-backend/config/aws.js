const { S3Client } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = { s3Client, bucketName: process.env.AWS_BUCKET_NAME };
