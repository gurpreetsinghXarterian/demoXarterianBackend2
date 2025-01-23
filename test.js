const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3')
const axios = require('axios')
const config = require('../../../config')
const sizeOf = require('image-size')

const s3 = new S3Client({ 
    credentials: { 
        accessKeyId: config.AWS_ACCESSKEYID, 
        secretAccessKey: config.AWS_SECRETKEY 
    }, 
        signatureVersion: 'v4', 
        region: config.AWS_REGION 
    })

const services = {}

services.s3 = s3

services.UploadFromUrlToS3 = (url, destPath) => {
  return new Promise((resolve, reject) => {
    try {
      axios.get(url, { responseType: 'arraybuffer', responseEncoding: 'binary' }).then(async (res) => {
        const objectParams = {
            Bucket: config.AWS_S3_BUCKET_NAME,
            Key: destPath,
            Body: res.data,
            ContentType: res.headers['content-type'],
            ContentLength: res.headers['content-length'],
        }

        const command = new PutObjectCommand(objectParams)

        await s3.send(command).then(res => {
          console.log('uploaded to S3', res)
          resolve('Success')
        }).catch((error) => {
          console.log(`Printing error 3: ${error}`)
          reject(error)
        })
      }).catch(function (err) {
        console.log(`Printing error 1: ${err}`)
        reject(err)
      })
    } catch (error) {
      console.log(`Printing error 2: ${error}`)
      reject(error)
    }
  })
}





























// const { S3, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
// require('dotenv').config();

// const s3 = new S3({
//     region: process.env.AWSREGION,
//     endpoint: `https://s3.us-east-1.amazonaws.com`,
//     credentials: {
//         accessKeyId: process.env.AWSKEY,
//         secretAccessKey: process.env.AWSSECRET,
//     }
// });

// exports.uploadFileToS3 = async (file) => {
//     const params = {
//         Bucket: process.env.AWSBUCKET,
//         Key: file.originalname,
//         Body: file.buffer,
//         ContentType: file.mimetype,
//         ACL: 'public-read',
//         ContentLength: file.size
//     };


//     try {
//         const command = new PutObjectCommand(params);
//         const response = await s3.send(command);  
        
//         return response;
//     } catch (err) {
//         console.error('Error uploading file to S3:', err);
//         throw new Error(`Upload failed: ${err.message}`); 
//     }
// };

// exports.deleteFileFromS3 = async (fileKey) => {
//     const params = {
//         Bucket: process.env.AWSBUCKET,
//         Key: fileKey, 
//     };

//     console.log('Deleting file with params:', params);

//     try {
//         const command = new DeleteObjectCommand(params);
//         const response = await s3.send(command);
//         console.log('File deleted successfully:', response);
//         return response; 
//     } catch (err) {
//         console.error('Error deleting file from S3:', err);
//         throw new Error(`Delete failed: ${err.message}`); 
//     }
// };