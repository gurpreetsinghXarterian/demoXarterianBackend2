<<<<<<< HEAD
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3 = new S3Client({ 
    credentials: { 
        accessKeyId: "AKIAUGO4KPTO6IUHJK5L", 
        secretAccessKey: "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"
    }, 
    signatureVersion: 'v4', 
    region: "us-east-1",
    // requestTimeout: 30000,
    // maxAttempts: 5  
})


exports.uploadFileToS3 = async (file) => {
    const params = {
        Bucket: "xarteriandemo",
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
        ContentLength: file.size
    };

    try {
        const command = new PutObjectCommand(params);
        const response = await s3.send(command);  
=======
const { S3, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3 = new S3({
    region: process.env.AWSREGION,
    endpoint: `https://s3.us-west-1.amazonaws.com`,
    credentials: {
        accessKeyId: process.env.AWSKEY,
        secretAccessKey: process.env.AWSSECRET,
    }
});

exports.uploadFileToS3 = async (file) => {
    const params = {
        Bucket: process.env.AWSBUCKET,
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
    };


    try {
        const command = new PutObjectCommand(params);
        const response = await s3.send(command);  
        
>>>>>>> ca8473b (authdone)
        return response;
    } catch (err) {
        console.error('Error uploading file to S3:', err);
        throw new Error(`Upload failed: ${err.message}`); 
    }
};

exports.deleteFileFromS3 = async (fileKey) => {
    const params = {
        Bucket: process.env.AWSBUCKET,
        Key: fileKey, 
    };

<<<<<<< HEAD
    try {
        const command = new DeleteObjectCommand(params);
        const response = await s3.send(command);
=======
    console.log('Deleting file with params:', params);

    try {
        const command = new DeleteObjectCommand(params);
        const response = await s3.send(command);
        console.log('File deleted successfully:', response);
>>>>>>> ca8473b (authdone)
        return response; 
    } catch (err) {
        console.error('Error deleting file from S3:', err);
        throw new Error(`Delete failed: ${err.message}`); 
    }
};