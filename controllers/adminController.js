const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/sendToken");
const { uploadArray } = require("../utils/aws");
const adminModel = require("../models/adminModel");
const variantModel = require("../models/variantModel");
const productModel = require("../models/productModel");
const { Distance, Latitude, Longitude } = require("../config/gobalData");
const { getAddByLocation } = require("../utils/getAddress");

//Admin Login
exports.login = catchAsyncError(async (req, res, next) => {
  const { mobileNumber, password, loginType } = req.body;
  if (!mobileNumber || !password || !loginType)
    return next(new ErrorHandler("All Fields Are Required", 400));

  let admin;

  console.log(loginType);

  if (loginType === "superAdmin") {
    admin = await User.findOne({ mobileNumber }).select("+password");
  } else if (loginType === "admin") {
    admin = await Admin.findOne({ mobileNumber }).select("+password");
  }

  if (!admin)
    return next(new ErrorHandler("Invalid Mobile Number Or Password", 401));
  const isMatch = await admin.comparePassword(password);

  if (!isMatch)
    return next(new ErrorHandler("Invalid Mobile Number Or Password", 401));
  if (admin.isBlocked) {
    return next(new ErrorHandler("This Account has Been Blocked", 401));
  }

  sendToken(
    res,
    admin,
    `Welcome Back, ${admin.fullName}`,
    200,
    (type = "admin")
  );
});

//Get Admin Profile
exports.getProfile = catchAsyncError(async (req, res, next) => {
  const admin = req.admin;
  res.status(200).json({
    success: true,
    admin,
  });
});

//Update Admin Profile
exports.updateProfile = catchAsyncError(async (req, res, next) => {
  const profile = req.admin;

  if (req.body.password)
    return next(
      new ErrorHandler("Not Allowed To Change Password In This Route", 400)
    );

  if (req.body.products)
    return next(new ErrorHandler("Not Allowed To Upate Products", 400));

  let shopLogoUrl;
  let avatarUrl;

  if (req.files && req.files.length > 0) {
    const uploadedImage = await uploadArray(req.files);

    const shopLogoImage = uploadedImage.find(
      (image) => image.fieldName === "shopLogo"
    );

    shopLogoUrl = shopLogoImage && shopLogoImage?.url;

    const avatarImage = uploadedImage.find(
      (image) => image.fieldName === "avatar"
    );

    avatarUrl = avatarImage && avatarImage?.url;
  }

  if ((!req.body.avatar || !req.body.shopLogo) && req.files?.length < 1) {
    const updateFields = {};

    if (!req.body.avatar) {
      updateFields.avatar = 1;
    }

    if (!req.body.shopLogo) {
      updateFields.shopLogo = 1;
    }

    await Admin.findOneAndUpdate(
      { _id: profile._id },
      { $unset: updateFields }
    );
  }

  const admin = await Admin.findByIdAndUpdate(
    profile._id,
    { ...req.body, avatar: avatarUrl, shopLogo: shopLogoUrl },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: "Profile Updated Successfully",
    admin,
  });
});

exports.updateLocation = catchAsyncError(async (req, res, next) => {
  const { _id } = req.admin;
  let { latitude, longitude, currentAdd } = req.body;

  if (!latitude || !longitude) {
    next(new ErrorHandler("Please provide lat and long", 400));
  }

  let address = (await getAddByLocation(latitude, longitude)) || {};
  console.log(address);
  //let location = {coordinates : [latitude, longitude]}
  const location = {
    type: "Point",
    coordinates: [latitude, longitude],
  };

  let data = await Admin.findByIdAndUpdate(
    _id,
    {
      location,
      storeCity: address?.city,
      currentAdd: address?.formattedAddress || "No Address Found",
    },
    { new: true }
  ).select("location currentAdd storeCity");

  await variantModel.updateMany({ adminId: req.admin._id }, { location });
  await productModel.updateMany({ adminId: req.admin._id }, { location });
  return res
    .status(200)
    .send({ success: true, data, msg: "Location updation success" });
});
const dummySellers = [
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Haldiram's",
    businessName: "Haldiram's",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    avatar: "https://i.postimg.cc/qBwc12xm/maxresdefault.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 3,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Bikanervala",
    businessName: "Bikanervala",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    avatar:
      "https://i.postimg.cc/7Yp59Lds/bikanervala-gomti-nagar-lucknow-sw-eet-shops-lb5mu1e5r1.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 4.5,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Gulab Sweets",
    businessName: "Gulab Sweets",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    avatar:
      "https://i.postimg.cc/2ShVKDfz/gulab-sw-eets-and-restaurant-munshi-bagh-srinagar-sw-eet-shops-v6bv1jwgln.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 4,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Puma",
    businessName: "Puma",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    avatar:
      "https://i.postimg.cc/8CGj801L/tyumen-russia-august-new-puma-shoes-white-sneakers-trainers-showing-logo-sport-casual-footwear-conce.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 5,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Adidas",
    businessName: "Adidas",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    avatar: "https://i.postimg.cc/G3KNv88R/adidas-company-profile.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 7,
  },
];
exports.getNearByAdmins = catchAsyncError(async (req, res) => {
  let {
    lat = Latitude,
    lng = Longitude,
    distance = Distance,
    limited = true,
  } = req.query;
  let limit = limited ? 10 : 50;

  let data = await Admin.aggregate([
    {
      $geoNear: {
        includeLocs: "location",
        distanceField: "distance",
        near: { type: "Point", coordinates: [+lat, +lng] },
        maxDistance: +distance * 1000,
        spherical: true,
      },
    },
    {
      $project: {
        fullName: 1,
        address: 1,
        businessName: 1,
        distance: 1,
        avatar: 1,
        location: 1,
        shopLogo: 1,
        _id: 1,
      },
    },
    { $limit: +limit },
  ]);

  return res.status(200).send({ success: true, data });
});
const dummyTopSellers = [
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Nike",
    businessName: "Nike",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/8s8r7PV0/run-nike-running-shoes-646cdd1a19c41.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 3,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Bikanervala",
    businessName: "Bikanervala",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/7Yp59Lds/bikanervala-gomti-nagar-lucknow-sw-eet-shops-lb5mu1e5r1.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 4.5,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Zara",
    businessName: "Zara",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/4Nz1pjF9/zaras-flagship-store-at-phoenix-palladium-reopened-its-doors-today.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 4,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Levi's",
    businessName: "Levi's",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar: "https://i.postimg.cc/852h6bR4/960x0.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 5,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Calvin Klein",
    businessName: "Calvin Klein",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/T1xKxNjz/calvin-klein-mall-lucknow-calvin-klein-cu4umvop0t.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 7,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Calvin Klein",
    businessName: "Calvin Klein",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/T1xKxNjz/calvin-klein-mall-lucknow-calvin-klein-cu4umvop0t.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 7,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Calvin Klein",
    businessName: "Calvin Klein",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/T1xKxNjz/calvin-klein-mall-lucknow-calvin-klein-cu4umvop0t.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 7,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Calvin Klein",
    businessName: "Calvin Klein",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/T1xKxNjz/calvin-klein-mall-lucknow-calvin-klein-cu4umvop0t.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 7,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Calvin Klein",
    businessName: "Calvin Klein",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/T1xKxNjz/calvin-klein-mall-lucknow-calvin-klein-cu4umvop0t.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 7,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Calvin Klein",
    businessName: "Calvin Klein",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/T1xKxNjz/calvin-klein-mall-lucknow-calvin-klein-cu4umvop0t.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 7,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Calvin Klein",
    businessName: "Calvin Klein",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/T1xKxNjz/calvin-klein-mall-lucknow-calvin-klein-cu4umvop0t.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 7,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Calvin Klein",
    businessName: "Calvin Klein",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/T1xKxNjz/calvin-klein-mall-lucknow-calvin-klein-cu4umvop0t.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 7,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Calvin Klein",
    businessName: "Calvin Klein",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/T1xKxNjz/calvin-klein-mall-lucknow-calvin-klein-cu4umvop0t.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 7,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Calvin Klein",
    businessName: "Calvin Klein",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/T1xKxNjz/calvin-klein-mall-lucknow-calvin-klein-cu4umvop0t.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 7,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Calvin Klein",
    businessName: "Calvin Klein",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/T1xKxNjz/calvin-klein-mall-lucknow-calvin-klein-cu4umvop0t.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 7,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Calvin Klein",
    businessName: "Calvin Klein",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/T1xKxNjz/calvin-klein-mall-lucknow-calvin-klein-cu4umvop0t.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 7,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Calvin Klein",
    businessName: "Calvin Klein",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/T1xKxNjz/calvin-klein-mall-lucknow-calvin-klein-cu4umvop0t.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 7,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Calvin Klein",
    businessName: "Calvin Klein",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/T1xKxNjz/calvin-klein-mall-lucknow-calvin-klein-cu4umvop0t.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 7,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Calvin Klein",
    businessName: "Calvin Klein",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/T1xKxNjz/calvin-klein-mall-lucknow-calvin-klein-cu4umvop0t.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 7,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Calvin Klein",
    businessName: "Calvin Klein",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/T1xKxNjz/calvin-klein-mall-lucknow-calvin-klein-cu4umvop0t.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 7,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Calvin Klein",
    businessName: "Calvin Klein",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/T1xKxNjz/calvin-klein-mall-lucknow-calvin-klein-cu4umvop0t.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 7,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Calvin Klein",
    businessName: "Calvin Klein",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/T1xKxNjz/calvin-klein-mall-lucknow-calvin-klein-cu4umvop0t.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 7,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Calvin Klein",
    businessName: "Calvin Klein",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/T1xKxNjz/calvin-klein-mall-lucknow-calvin-klein-cu4umvop0t.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 7,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Calvin Klein",
    businessName: "Calvin Klein",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/T1xKxNjz/calvin-klein-mall-lucknow-calvin-klein-cu4umvop0t.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 7,
  },
  {
    _id: "648a9b8269a39ac8436e1715",
    fullName: "Calvin Klein",
    businessName: "Calvin Klein",
    address: {
      state: "Rajasthan",
      city: "Pilani",
      pinCode: "333031",
      addressLine1: "Address 1",
      addressLine2: "Address 2",
    },
    shopLogo: "https://picsum.photos/1280/720",
    avatar:
      "https://i.postimg.cc/T1xKxNjz/calvin-klein-mall-lucknow-calvin-klein-cu4umvop0t.jpg",
    location: {
      coordinates: [-1, 1],
      type: "Point",
    },
    distance: 7,
  },
];
exports.getTopAdmins = catchAsyncError(async (req, res) => {
  let {
    lat = "28.6862738",
    lng = "77.2217831",
    distance = Distance,
    limited = true,
  } = req.query;
  let limit = limited ? 10 : 50;

  let data = await Admin.find()
    .sort({ totalOrders: -1 })
    .select({
      fullName: 1,
      address: 1,
      businessName: 1,
      distance: 1,
      avatar: 1,
      location: 1,
      shopLogo: 1,
      _id: 1,
    })
    .limit(limit);

  console.log("limited ", typeof limited);

  const dummySellers =
    limited == "true" ? dummyTopSellers.slice(0, 10) : dummyTopSellers;

  return res.status(200).send({ success: true, data });
});
