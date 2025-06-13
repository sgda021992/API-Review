var aws = require("aws-sdk");
const { S3Client } = require("@aws-sdk/client-s3");
const REGION = "ap-south-1";

// Create an Amazon S3 service client object.
exports.s3Client = new S3Client({ region: REGION });
// AWS sdk s3 object
exports.s3 = new aws.S3({ region: REGION });
