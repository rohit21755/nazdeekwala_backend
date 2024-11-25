const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} = require("@aws-sdk/client-s3");
// let credentials =  {credentials: {
//     accessKeyId: process.env.ACCESS_KEY,
//     secretAccessKey: process.env.SECRET_ACCESS_KEY
// }
// }
//console.log(credentials)

const client = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});
console.log(process.env.BUCKET_NAME)

exports.uploadFile = async (file, fileKey) => {
  console.log("File", file);
  try {
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ACL: "public-read",
    };

    const command = new PutObjectCommand(params);
    const response = await client.send(command);
    console.log("Upload successful:", response);

    const fileUrl = {
      fieldName: file.fieldname.replace("[]", ""),
      url: `https://${
        process.env.BUCKET_NAME
      }.s3.amazonaws.com/${encodeURIComponent(fileKey)}`,
    };
    return fileUrl;

    // return response;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

exports.uploadArray = async (files) => {
  try {
    let links = [];
    await Promise.all(
      files.map(async (f) => {
        let id = Date.now().toString() + Math.random().toString(36).slice(2, 4);

        let unique = id + f.originalname;

        console.log(unique);
        let data = await exports.uploadFile(f, unique);
        links.push(data);
        console.log(data);
      })
    );

    return links;
  } catch (err) {
    console.log(err.message);
    throw err;
  }
};

exports.getFile = async (req, res, next) => {
  try {
    var fileKey = req.query["fileKey"];

    var bucketParams = {
      Bucket: process.env.BUCKET_NAME,
      Key: fileKey,
    };

    res.attachment(fileKey);
    var fileStream = await client.send(new GetObjectCommand(bucketParams));

    fileStream.Body.pipe(res);
  } catch (err) {
    return res.status(400).send({ status: false, msg: err.message });
  }
};


exports.deleteFile = async(key)=> {
  try {
  const bucketParams = { Bucket: process.env.BUCKET_NAME, Key: key };
  let data = await client.send(new DeleteObjectCommand(bucketParams))
  return data

  }
  catch(err){
    console.log(err)
    throw err

  }


}