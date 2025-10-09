require('dotenv').config();
const { S3Client, PutBucketPolicyCommand, PutBucketCorsCommand, PutPublicAccessBlockCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.AWS_BUCKET_NAME;

async function configureS3Bucket() {
  try {
    console.log(`Configuring S3 bucket: ${bucketName}...`);

    // 1. Disable Block Public Access (required for public bucket policy)
    console.log('\n1. Disabling Block Public Access...');
    await s3Client.send(new PutPublicAccessBlockCommand({
      Bucket: bucketName,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        IgnorePublicAcls: false,
        BlockPublicPolicy: false,
        RestrictPublicBuckets: false,
      },
    }));
    console.log('✓ Public access block disabled');

    // 2. Set Bucket Policy to allow public read access
    console.log('\n2. Setting bucket policy for public read access...');
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${bucketName}/*`,
        },
      ],
    };

    await s3Client.send(new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(bucketPolicy),
    }));
    console.log('✓ Bucket policy set');

    // 3. Set CORS Configuration
    console.log('\n3. Setting CORS configuration...');
    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'HEAD'],
          AllowedOrigins: ['*'],
          ExposeHeaders: [],
          MaxAgeSeconds: 3000,
        },
      ],
    };

    await s3Client.send(new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: corsConfiguration,
    }));
    console.log('✓ CORS configuration set');

    console.log('\n✅ S3 bucket configured successfully!');
    console.log('\nYour bucket is now configured to:');
    console.log('- Allow public read access to all objects');
    console.log('- Accept requests from any origin (CORS enabled)');
    console.log('\nYou can now upload and display images from this bucket.');

  } catch (error) {
    console.error('\n❌ Error configuring S3 bucket:', error.message);
    console.error('\nMake sure:');
    console.error('1. Your AWS credentials have the necessary permissions');
    console.error('2. The bucket name is correct');
    console.error('3. You have admin/full access to the S3 bucket');
    process.exit(1);
  }
}

configureS3Bucket();
