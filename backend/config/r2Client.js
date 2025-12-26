/**
 * Cloudflare R2 Client Configuration
 * 
 * This module configures the AWS S3 client to work with Cloudflare R2 storage.
 * R2 is S3-compatible, so we use the AWS SDK with custom endpoint configuration.
 */

const { S3Client } = require('@aws-sdk/client-s3');

// Validate required environment variables
const requiredEnvVars = [
    'Access_Key_ID',
    'Secret_Access_Key',
    'Endpoints_for_S3_clients',
    'Buket_name',
    'Public_Development_URL'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.warn(`⚠️  Missing R2 environment variables: ${missingVars.join(', ')}`);
    console.warn('Image upload functionality may not work correctly.');
}

// Extract the Default endpoint URL from the multi-line endpoint configuration
// The .env has format: "Endpoints_for_S3_clients - \nDefault - https://..."
const endpointUrl = 'https://22d5f7b3d2213d24ca45e49edd547fc1.r2.cloudflarestorage.com';

// Configure S3 client for Cloudflare R2
const r2Client = new S3Client({
    region: 'auto', // R2 uses 'auto' for region
    endpoint: endpointUrl,
    credentials: {
        accessKeyId: process.env.Access_Key_ID,
        secretAccessKey: process.env.Secret_Access_Key,
    },
});

module.exports = {
    r2Client,
    bucketName: process.env.Buket_name,
    publicUrl: process.env.Public_Development_URL,
};
