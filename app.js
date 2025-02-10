const express = require("express");
const errorMiddleware = require("./middlewares/error");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const catchAsyncError = require("./middlewares/catchAsyncError");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const cors = require("cors");
const {
  uploadFile,
  getFile,
  uploadArray,
  deleteFile,
} = require("./utils/aws.js");
const crypto = require("crypto");
const multerS3 = require("multer-s3");
const { swaggerServe, swaggerSetup } = require("./config/configSwagger");
const Razorpay = require("razorpay");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Multer for buffer Data
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//Razorpay Instance


// S3 SETUP
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

console.log(bucketName);

// S3 Client SETUP

const client = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

//File upload middleware

const uploadMid = multer({
  storage: multerS3({
    s3: client,
    bucket: process.env.BUCKET_NAME,
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname); // Set the S3 object key (filename)
    },
  }),
});

//-------------//

//app.use(uploadMid.array('files'))

app.use(multer().any());
//----------------

app.use("/api-docs", swaggerServe, swaggerSetup);

//-----------------

app.post(
  "/api/v1/uploadFiles",
  catchAsyncError(async (req, res) => {
    try {
      let len = req.files.length;

      let links = await uploadArray(req.files);

      return res.send({ status: true, data: links });
    } catch (err) {
      return res.status(400).send({ status: false, msg: err.message });
    }
  })
);

//------------------------------

app.post(
  "/uploads3",
  catchAsyncError(async (req, res) => {
    try {
      let len = req.files.length;

      // console.log(file)
      //----------Crypto uniqueId------------//
      //let unique = (Math.random().toString(36).slice(2, 7)) + file.originalname;
      //let id = crypto.randomBytes(16).toString("hex");

      let links = [];
      await Promise.all(
        req.files.map(async (f) => {
          let id =
            Date.now().toString() + Math.random().toString(36).slice(2, 4);

          let unique = id + f.originalname;

          console.log(unique);
          let data = await uploadFile(f, unique);
          links.push(data);
          console.log(data);
        })
      );

      //  let id = Date.now().toString() + (Math.random().toString(36).slice(2, 4))

      //  let unique = id + file.originalname

      //   console.log(unique)
      //   let data = await uploadFile(file, unique)
      //   console.log(data)
      return res.send({ status: true, data: links });
    } catch (err) {
      return res.status(400).send({ status: false, msg: err.message });
    }
  })
);

app.post("/api/v1/getFile", catchAsyncError(getFile));

// Upload Image
app.post(
  "/api/v1/uploadImage",
  upload.array("image"),
  catchAsyncError(async (req, res, next) => {
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: req.file.originalname,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);

    const data = await s3.send(command);

    res.status(200).json({
      success: true,
      data,
    });
  })
);

//Routes Imports
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const superAdmin = require("./routes/superAdminRoute");
const admin = require("./routes/adminRoute");
const category = require("./routes/categoryRoute");
const brand = require("./routes/brandRoute");
const cart = require("./routes/cartRoutes");
const order = require("./routes/orderRoutes");
const dashboard = require("./routes/dashboardAdmin");
const coupon = require("./routes/couponRoute");
const pages = require("./routes/cmsRoute");
const homePage = require("./routes/homePageRoutes");
const demo = require("./routes/demoRoutes.js");
const reviews = require("./routes/reviewsRoutes.js");
const chats = require("./routes/chatRoutes.js");
const { fakeProducts } = require("./controllers/fakeData.js");
const post = require("./routes/postRoutes.js");
app.use("/fake", async () => {
  console.log("fake");
  fakeProducts();
});
app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", superAdmin);
app.use("/api/v1", admin);
app.use("/api/v1", category);
app.use("/api/v1", brand);
app.use("/api/v1", cart);
app.use("/api/v1", order);
app.use("/api/v1", dashboard);
app.use("/api/v1", coupon);
app.use("/api/v1", pages);
app.use("/api/v1", homePage);
app.use("/api/v1", reviews);
app.use("/api/v1", demo);
app.use("/api/v1", chats);
app.use("/api/v1", post);

//fakeProducts()

// Middleware
app.use(errorMiddleware);

module.exports = app;
