// Amazon S3 SDK and configuration
const { s3Client, s3 } = require(rootPath + "/components/s3-config.js");
const {
  PutObjectCommand,
  CreateBucketCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { logErrorOccurred } = require(rootPath + "/helpers/general"); // Error logging helper

/**
 * Uploads a file to Amazon S3 bucket
 * @param {String} key - The file path/key in the S3 bucket
 * @param {Buffer} buffer - The file content as buffer
 * @returns {Object|Boolean} - Upload result from S3 or false on error
 */
exports.uploadToS3 = async (key, buffer) => {
  try {
    const params = {
      Bucket: "santoshuploads", // S3 bucket name
      Key: key,                // File name (path) in the bucket
      Body: buffer,            // File data as a buffer
    };
    const file = new PutObjectCommand(params);

    // Upload the file to S3
    const results = await s3Client.send(file);
    return results;
  } catch (err) {
    console.log("Error while uploading to S3 ********", err.message);
    return false;
  }
};

/**
 * Converts a readable stream (from S3) to a string
 * @param {Stream} stream - Readable stream (S3 object body)
 * @returns {Promise<String>} - Stream data converted to UTF-8 string
 */
const streamToString = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
};

/**
 * Fetches a single file from S3 and returns its content as string
 * @param {String} key - File key/path in the bucket
 * @returns {String|Boolean} - File content or false on error
 */
exports.fetchSingleFileS3 = async (key) => {
  try {
    const params = {
      Bucket: "santoshuploads", // S3 bucket name
      Key: key,                 // File key
    };
    const file = new GetObjectCommand(params);

    // Get file from S3
    const results = await s3Client.send(file);

    // Convert stream body to string
    const string = await streamToString(results.Body);
    return string;
  } catch (err) {
    console.log("Error while fetching from S3 ********", err.message);
    return false;
  }
};

/**
 * Generates a signed URL for accessing a file from S3
 * @param {Object} params - S3 getObject params (Bucket, Key, Expires, etc.)
 * @returns {String|Boolean} - Signed URL or false on error
 */
exports.getSignedURL = async (params) => {
  try {
    const url = s3.getSignedUrl("getObject", params); // V2 SDK (legacy)
    return url;
  } catch (err) {
    logErrorOccurred(__filename, err);
    console.log("Error while generating signed URL ********", err.message);
    return false;
  }
};

/**
 * Deletes a file from S3 bucket
 * @param {Object} params - S3 deleteObject params (Bucket, Key)
 * @returns {Promise} - Promise from S3 deleteObject
 */
exports.deleteFileS3 = async (params) => {
  return await s3.deleteObject(params).promise(); // V2 SDK (legacy)
};
