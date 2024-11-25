const Product = require("../models/productModel");
const Variant = require("../models/variantModel");
const Category = require("../models/categoryModel");
const Admin = require("../models/adminModel");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const { uploadArray } = require("../utils/aws");
const adminModel = require("../models/adminModel");
const variantModel = require("../models/variantModel");
const productModel = require("../models/productModel");
const brandModel = require("../models/brandModel");
const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const { Distance, Latitude, Longitude } = require("../config/gobalData");
const {
  categoryAll,
  categoryFilters,
  homePageCategoryList,
  mainCategoryBanners,
  filterBanners,
} = require("../config/gobalData");
const orderModel = require("../models/orderModel");
const bannerModel = require("../models/bannerModel");

//Create Product With Variants - Admin
exports.createProduct = catchAsyncError(async (req, res, next) => {
  const {
    nameOfProduct,
    variants,
    mainCategory,
    category,
    subCategory,
    tags,
    brand,
    variantFilterOptions,
    isPublic,
  } = req.body;
  let variantImages = [];

  console.log("req.body   ", req.body.variants[0].images);

  //   mainCat: fashion, category: men, subcat: inner-wear

  // if (req.files.length > 0) {
  //   variantImages = await uploadArray(req.files);
  // }
  // Extract URLs from variantImages
  //const variantImageUrls = variantImages.map((image) => image.url);
  if (variantFilterOptions) {
    filterKeys = Object.keys(variantFilterOptions);
  }
  // Populate each variant with the image URLs
  const populatedVariants = variants.map((variant, index) => ({
    ...variant,
    location: req.admin.location, // Assuming you want to add a single URL to each variant
    adminId: req.admin._id,
  }));

  const createdVariants = await Variant.insertMany(populatedVariants);
  const variantIds = createdVariants.map((item) => item._id);
  const product = await Product.create({
    nameOfProduct,
    variants: variantIds,
    mainCategory,
    category,
    subCategory,
    tags,
    brand,
    isPublic,
    adminId: req.admin._id,
    location: req.admin.location,
    filterKeys,
    variantFilterOptions,
  });

  await Variant.updateMany(
    { _id: { $in: variantIds } },
    { $set: { productId: product._id, category, brand } }
  );

  // Add product id to Admin model
  await Admin.updateOne(
    { _id: req.admin._id },
    { $push: { products: [product._id] } }
  );
  res
    .status(201)
    .json({ success: true, product, message: "Product Created Successfully" });
});

//-----------------------------Super admin------------------------------//

exports.superCreateProduct = catchAsyncError(async (req, res, next) => {
  console.log("super creating product");

  let {
    nameOfProduct,
    adminId,
    variants,
    mainCategory,
    category,
    subCategory,
    tags,
    brand,
    filterKeys,
    variantFilterOptions,
  } = req.body;
  let variantImages = [];

  let admin = await adminModel.findById(adminId);

  if (!admin) {
    return next(new ErrorHandler("AdminId is Not Valid", 400));
  }
  if (!admin.location) {
    return next(new ErrorHandler("AdminId Location is required", 400));
  }
  if (variantFilterOptions) {
    filterKeys = Object.keys(variantFilterOptions);
  }
  if (req.files.length > 0) {
    variantImages = await uploadArray(req.files);
  }
  // Extract URLs from variantImages
  const variantImageUrls = variantImages.map((image) => image.url);

  // Populate each variant with the image URLs
  const populatedVariants = variants.map((variant, index) => ({
    ...variant,
    location: admin.location,
    adminId,
  }));

  const createdVariants = await Variant.insertMany(populatedVariants);

  const variantIds = createdVariants.map((item) => item._id);

  const product = await Product.create({
    nameOfProduct,
    variants: variantIds,
    mainCategory,
    category,
    subCategory,
    tags,
    brand,
    adminId: adminId,
    location: admin.location,
    filterKeys,
    variantFilterOptions,
  });

  await Variant.updateMany(
    { _id: { $in: variantIds } },
    { $set: { productId: product._id, category, brand } }
  );

  // Add product id to Admin model
  await Admin.updateOne(
    { _id: adminId },
    { $push: { products: [product._id] } }
  );

  res
    .status(201)
    .json({ success: true, product, message: "Product Created Successfully" });
});

exports.superCreateProductVariant = catchAsyncError(async (req, res, next) => {
  const { productId } = req.body;

  let variantImages = [];

  if (req.files.length > 0) {
    variantImages = await uploadArray(req.files);
  }

  // Extract URLs from variantImages
  const variantImageUrls = variantImages.map((image) => image.url);

  const product = await Product.findById(productId);
  const admin = await Admin.findById(product.adminId);

  if (!product)
    return next(new ErrorHandler("Invalid Product Id / Not Found", 404));

  const variant = await Variant.create({
    ...req.body,
    productId,
    // images: [...variantImageUrls],
    //images: [...req.body.images],
    category: product.category,
    brand: product.brand,
    location: admin.location,
    adminId: admin._id,
  });

  await Product.updateOne(
    { _id: productId },
    { $push: { variants: variant._id } }
  );
  res
    .status(200)
    .json({ success: true, variant, message: "Variant Created Successfully" });
});

//-------------------------------------- SUPER ADMINS -----------------------------------------//

//Get All Products
exports.getAllProducts = catchAsyncError(async (req, res, next) => {
  const products = await Variant.find()
    .populate("productId", "name category subCategory mainCategory")
    .populate("adminId", "fullName mobileNumber address");
  res.status(200).json({ success: true, products });
});

// Super admin get admin products

exports.superGetAdminProducts = catchAsyncError(async (req, res, next) => {
  // Search for Admin Products
  //return res.status(200).json({ success: true,});

  let adminId = req.params.adminId;
  if (adminId == "undefined") {
    const products = await productModel
      .find()
      .limit(50)
      .populate("variants")
      .populate("brand");
    return res.status(200).json({ success: true, products });
  }

  const allData = await Admin.findById(req.params.adminId)
    .populate([
      {
        path: "products",
        populate: [
          {
            path: "variants",
            select: "-brand -category",
          },
          {
            path: "brand",
          },
        ],
      },
    ])
    .select("products");

  res.status(200).json({ success: true, products: allData.products });
});

// Get all My Products - Admin
exports.myProduct = catchAsyncError(async (req, res, next) => {
  // Search for Admin Products
  const allData = await Admin.findById(req.admin._id)
    .populate([
      {
        path: "products",
        populate: [
          {
            path: "variants",
            select: "-brand -category",
          },
          {
            path: "brand",
          },
        ],
      },
    ])
    .select("products");

  res.status(200).json({ success: true, products: allData.products });
});

//Get Product By Product Id
exports.getProductDetails = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate([
    {
      path: "variants",
      select: "-productId -category -brand",
    },

    {
      path: "brand",
      select: "-_id",
    },
  ]);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));
  res.status(200).json({ success: true, product });
});

//Update Product Details Except Variants
exports.updateProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.variants) {
    return next(new ErrorHandler("You Can Not Update Variants Directly", 422));
  }
  let exist = await Product.findById(id);
  if (req.user && req.user.role !== "superAdmin") {
    return next(new ErrorHandler("Only Owner can update product", 400));
  }
  if (req.admin && req.admin._id.toString() !== exist.adminId.toString()) {
    return next(new ErrorHandler("Only Owner can update product", 400));
  }
  const product = await Product.findByIdAndUpdate(id, req.body, {
    runValidators: true,
  });

  await Variant.updateMany(
    {
      productId: id,
    },
    {
      brand: req.body.brand,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!product) return next(new ErrorHandler("Product Not Found", 404));
  res
    .status(200)
    .json({ success: true, product, message: "Product Updated Successfully" });
});

//Delete Product By Id
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  // if(req.user && req.user.role=="superAdmin"){
  //   return next(new ErrorHandler("Only Owner can Delete product", 400));

  // }
  if (req.admin && req.admin._id.toString() !== product.adminId.toString()) {
    return next(new ErrorHandler("Only Owner can Delete product", 400));
  }
  await Product.findByIdAndDelete(id);
  await Variant.deleteMany({ productId: id });
  res
    .status(200)
    .json({ success: true, message: "Product Deleted Successfully" });
});

//Create New Variant In Product By ID
exports.createProductVariant = catchAsyncError(async (req, res, next) => {
  const { productId } = req.params;

  let variantImages = [{ url: "sdd.jpg" }];

  // if (req.files.length > 0) {
  //   variantImages = await uploadArray(req.files);
  // }

  // Extract URLs from variantImages
  const variantImageUrls = variantImages.map((image) => image.url);

  const product = await Product.findById(productId);

  if (!product)
    return next(new ErrorHandler("Invalid Product Id / Not Found", 404));

  const variant = await Variant.create({
    ...req.body,
    productId,
    // images: [...variantImageUrls],
    //images: [...req.body.images],
    category: product.category,
    brand: product.brand,
    location: req.admin?.location,
    adminId: req.admin?._id,
  });

  await Product.updateOne(
    { _id: productId },
    { $push: { variants: variant._id } }
  );
  res
    .status(200)
    .json({ success: true, variant, message: "Variant Created Successfully" });
});

//Upload Variant Images (DynImageField)
exports.uploadVariantImages = catchAsyncError(async (req, res, next) => {
  let variantImages = [];
  console.log("uploadVariantImages Files ", req.files);
  console.log("uploadVariantImages Body ", req.body);
  if (!req.files.length > 0) {
    return next(new ErrorHandler("Images Is Required", 400));
  }
  variantImages = await uploadArray(req.files);
  const variantImageUrls = variantImages.map((image) => image.url);
  console.log("variantImageUrls", variantImageUrls);
  res.status(201).json({
    message: "Image Uploaded Successfully",
    images: [...(req.body.images ?? []), ...variantImageUrls],
  });
});

//Update Product Variant By ID
exports.updateProductVariant = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.category)
    return next(new ErrorHandler("You Can Not Update Category Directly"));
  if (req.body.brand)
    return next(new ErrorHandler("You Can Not Update Brand Directly"));

  let variantImages = [];

  console.log("ReqBody ", req.body);
  console.log("ReqFiles ", req.files);

  // if (req.files.length > 0) {
  //   variantImages = await uploadArray(req.files);
  // }

  // Extract URLs from variantImages
  const variantImageUrls = variantImages.map((image) => image.url);

  let exist = await Variant.findById(id).populate("productId");
  if (
    exist &&
    exist.productId.adminId.toString() !== req.admin._id.toString()
  ) {
    return next(new ErrorHandler("Only Owner can Update Products"));
  }

  const variant = await Variant.findOneAndUpdate(
    { _id: id },
    { ...req.body, images: [...(req.body.images ?? []), ...variantImageUrls] },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!variant) return next(new ErrorHandler("Variant Not Found", 404));
  res.status(200).json({ success: true, variant, message: "Variant Updated" });
});

exports.superUpdateProductVariant = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.category)
    return next(new ErrorHandler("You Can Not Update Category Directly"));
  if (req.body.brand)
    return next(new ErrorHandler("You Can Not Update Brand Directly"));

  let variantImages = [];

  console.log("ReqBody ", req.body);
  console.log("ReqFiles ", req.files);

  if (req.files.length > 0) {
    variantImages = await uploadArray(req.files);
  }
  let exist = await Variant.findById(id).populate("productId");
  if (!exist || req.user.role != "superAdmin") {
    return next(new ErrorHandler("Invalid Request From User", 400));
  }
  // Extract URLs from variantImages
  const variantImageUrls = variantImages.map((image) => image.url);

  const variant = await Variant.findOneAndUpdate(
    { _id: id },
    { ...req.body, images: [...(req.body.images ?? []), ...variantImageUrls] },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!variant) return next(new ErrorHandler("Variant Not Found", 404));
  res.status(200).json({ success: true, variant, message: "Variant Updated" });
});

//Delete Product Variant By ID
exports.superDeleteProductVariant = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const variant = await Variant.findById(id).populate("productId");
  if (req.user._id.toString() != variant?.productId?.adminId.toString())
    if (!variant) return next(new ErrorHandler("Variant Not Found", 404));
  await Variant.deleteOne({ _id: id });
  await Product.updateMany({ variants: id }, { $pull: { variants: id } });
  res
    .status(200)
    .json({ success: true, message: "Variant Deleted Successfully" });
});

exports.deleteProductVariant = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const variant = await Variant.findById(id).populate("productId");

  if (!variant) return next(new ErrorHandler("Variant Not Found", 404));
  await Variant.deleteOne({ _id: id });
  await Product.updateMany({ variants: id }, { $pull: { variants: id } });
  res
    .status(200)
    .json({ success: true, message: "Variant Deleted Successfully" });
});

//Filter Product By Category Brand And Price
exports.productFilter = catchAsyncError(async (req, res, next) => {
  const { category, brand, price } = req.body;
  let args = {};
  if (category && category.length > 0) args.category = category;
  if (brand && brand.length > 0) args.brand = brand;
  if (price && price.length > 0)
    args.price = { $gte: price[0], $lte: price[1] };
  const products = await Variant.find(args);
  res.status(200).send({
    success: true,
    totalCount: products.length,
    products,
  });
});

exports.getAllFiterDetails = catchAsyncError(async (req, res, next) => {
  let {
    inputSearch,
    mainCategory,
    category,
    subCategory,
    lat = Latitude,
    lng = Longitude,
    distance = Distance,
    sellerId,
    brands = [],
    brandId,
  } = req.query;

  let categories;
  if (!inputSearch && mainCategory) {
    categories = categoryAll[mainCategory];
  } else if (inputSearch || sellerId) {
    categories = categoryAll;
  }
  let union;
  let search = [
    {
      $geoNear: {
        includeLocs: "location",
        distanceField: "distance",
        near: { type: "Point", coordinates: [+lat, +lng] },
        maxDistance: +distance * 1000,
        spherical: true,
      },
    },
    { $limit: 10 },

    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "productId",
        pipeline: [
          { $match: { isPublic: true } },
          {
            $project: {
              category: 1,
              mainCategory: 1,
              subCategory: 1,
              brand: 1,
              adminId: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$productId" },

    {
      $lookup: {
        from: "brands",
        localField: "productId.brand",
        foreignField: "_id",
        as: "productId.brand",
        pipeline: [{ $project: { brandName: 1, image: 1 } }],
      },
    },
    { $unwind: "$productId.brand" },
  ];

  let query = {};

  if (sellerId)
    query["productId.adminId"] = new mongoose.Types.ObjectId(sellerId);
  if (mainCategory) query["productId.mainCategory"] = mainCategory;
  if (category) query["productId.category"] = category;
  if (subCategory) query["productId.subCategory"] = subCategory;

  if (brands && brands.length) {
    query["productId.brand._id"] = {
      $in: brands.map((x) => new mongoose.Types.ObjectId(x)),
    };
  }
  if (brandId) {
    query["productId.brand._id"] = new mongoose.Types.ObjectId(brandId);
  }
  search.push({ $match: query });
  console.log(search);

  let filterOptions = categoryFilters[subCategory] || [];
  console.log(filterOptions);
  let group = { _id: null };
  let project = { _id: 0 };
  if (brandId || sellerId) {
    group["mainCategories"] = { $addToSet: `$productId.mainCategory` };
    project["mainCategories"] = 1;
  } else {
    group["brand"] = { $addToSet: `$productId.brand` };
    project["brand"] = 1;
  }

  if (filterOptions.length) {
    for (let i of filterOptions) {
      group[i] = { $addToSet: `$globalFilterOptions.${i}` };
      project[i] = 1;
    }
  }
  console.log(group);
  union = await variantModel.aggregate([
    ...search,
    {
      $group: { ...group },
    },
    {
      $project: {
        ...project,
      },
    },
  ]); //.explain();

  // let admin;
  // if (sellerId) {
  //   admin = await adminModel
  //     .findById(sellerId)
  //     .select({ fullName: 1, images: 1 });
  // }

  // let brandDetails;
  // if (brandId) {
  //   brandDetails = await brandModel.findById(brandId);
  // }
  let query2 = {};
  if (sellerId) {
    query2["adminId"] = new mongoose.Types.ObjectId(sellerId);
    let cats = (union[0] && union[0].mainCategories) || [];
    if (cats.length > 0) {
      categories = {};
      cats.map((ct) => (categories[ct] = categoryAll[ct]));
    }
  }

  if (mainCategory) {
    query2["mainCategory"] = mainCategory;
  }
  if (category) {
    query2["category"] = category;
  }

  let topBrands;
  if (!brandId) {
    topBrands = await productModel.aggregate([
      { $match: { ...query2 } },
      { $group: { _id: "$brand" } },
      {
        $lookup: {
          from: "brands",
          localField: "_id",
          foreignField: "_id",
          as: "_id",
          //pipeline: [{ $project: { totalOrders: 1 } }],
        },
      },
      { $unwind: "$_id" },

      { $sort: { "_id.totalOrders": -1 } },
    ]);
  }

  //console.log(mainCategoryBanners.mainCategory);
  //let brand = union[0].globalFilterOptions.brand
  let { brand = [], ...globalFilterOptionss } = union[0] || { brand: [] };
  //let {brand, ...rest} = globalFilterOptionss

  let extra = {};
  if (!brandId && topBrands) {
    extra["topBrands"] = topBrands;
  }
  //if (admin) extra["admin"] = admin;
  //if (brandId) {
  //extra["brandDetails"] = brandDetails;
  // extra["categories"] = globalFilterOptionss["categories"];
  // delete globalFilterOptionss.categories;
  //  }
  let banners = await bannerModel.find({
    $or: [{ whereToShow: "filter" }, { whereToShow: "both" }],
    isVisible: true,
  });
  return res.status(200).send({
    success: true,
    data: {
      banners,
      globalFilterOptions: globalFilterOptionss,
      brands: brand,
      categories,
      ...extra,
      union: union[0],
    },
  });
});

exports.productFilters = catchAsyncError(async (req, res, next) => {
  let {
    page = 0,
    distance = Distance,
    mainCategory,
    category,
    subCategory,
    brands = [],
    categories = [],
    limit = 10,
    inputSearch,
    lPrice,
    hPrice,
    sort, //sort=l
    sortP = -1,
    lat = Latitude,
    lng = Longitude,
    sellerId,
    brandId,
    ...globalFilterOptions
  } = req.query;
  console.log(globalFilterOptions);
  let union;
  console.log(brands);
  let search = [
    {
      $geoNear: {
        includeLocs: "location",
        distanceField: "distance",
        near: { type: "Point", coordinates: [+lng, +lat] },
        maxDistance: +distance * 1000,
        spherical: true,
      },
    },
    { $limit: 1000 },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "productId",
        pipeline: [
          { $match: { isPublic: true } },
          {
            $project: {
              category: 1,
              mainCategory: 1,
              subCategory: 1,
              tags: 1,
              brand: 1,
              adminId: 1,
              rating: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$productId" },
    {
      $lookup: {
        from: "admins",
        localField: "productId.adminId",
        foreignField: "_id",
        as: "productId.adminId",
        pipeline: [
          // { $match: { isBlocked: false } },
          { $project: { fullName: 1, businessName: 1 } },
        ],
      },
    },
    { $unwind: "$productId.adminId" },
  ];

  if (inputSearch) {
    search.push({
      $match: {
        $or: [
          //{$text: {$search: inputSearch}}
          { name: new RegExp(inputSearch, "i") },
          { "productId.name": new RegExp(inputSearch, "i") },
          { "productId.mainCategory": new RegExp(inputSearch, "i") },
          { "productId.category": new RegExp(inputSearch, "i") },
          { "productId.subCategory": new RegExp(inputSearch, "i") },
          {
            "productId.adminId._id": mongoose.Types.ObjectId.isValid(
              inputSearch
            )
              ? new mongoose.Types.ObjectId(inputSearch)
              : inputSearch,
          },
          { "productId.adminId.fullName": new RegExp(inputSearch, "i") },
          { "productId.adminId.businessName": new RegExp(inputSearch, "i") },
        ],
      },
    });
  }

  //---------Brand Lookup----------//

  let query = { isPublic: true };
  if (mainCategory) query["productId.mainCategory"] = mainCategory;

  if (brands.length) {
    query["productId.brand"] = {
      $in: brands.map((x) => new mongoose.Types.ObjectId(x)),
    };
  } else if (brandId) {
    if (brandId)
      query["productId.brand"] = new mongoose.Types.ObjectId(brandId);
  }
  if (sellerId)
    query["productId.adminId._id"] = new mongoose.Types.ObjectId(sellerId);
  if (categories && categories.length) {
    query["productId.category"] = { $in: categories };
  }

  if (category) query["productId.category"] = category;
  if (subCategory) query["productId.subCategory"] = subCategory;

  if (Object.keys(globalFilterOptions).length) {
    Object.entries(globalFilterOptions).map(([k, v]) => {
      query[`globalFilterOptions.${k}`] = { $in: v };
    });
    //query = { ...query, []: {...globalFilterOptions} };
    //query[`priductId.globalFitersOptions.${key}`]
  }
  //---------- Price sort ----------//
  let priceSort = {};
  if (lPrice) {
    priceSort["$gt"] = lPrice;
  }
  if (hPrice) {
    priceSort["$lt"] = hPrice;
  }

  // if (Object.keys(priceSort).length) {
  //query.price =  priceSort
  // }

  if (query) search.push({ $match: query });
  console.log(search);
  //search.push({$sort: {price: "-1"}})
  //let categories = categoryAll[mainCategory] || [];
  //let subCategories = categoryAll[mainCategory]['category']["subCats"] || [];

  let filterOptions = categoryFilters[subCategory] || [];

  if (page != undefined) {
    let xx = page * limit;
    console.log(xx);
    //search.push({ $skip: +xx });
  }
  //search.push({ $limit: +limit });
  if (sort && sort == "r") {
    search.push({ $sort: { "productId.rating": -1 } });
  } else if (sortP) {
    search.push({ $sort: { price: +sortP } });
  }
  let extra = {};
  let seller;
  let brandDetail;

  if (sellerId) {
    seller = await adminModel.findById(sellerId).select({
      fullName: 1,
      businessName: 1,
      address: 1,
      shopLogo: 1,
      avatar: 1,
      location: 1,
      storeCity: 1,
      currentAdd: 1,
      mobileNumber: 1,
    });
  }
  if (brandId) {
    brandDetail = await brandModel.findById(brandId);
  }
  if (seller) {
    extra["seller"] = seller;
  }

  if (brandDetail) {
    extra["brandDetail"] = brandDetail;
  }
  search.push(
    {
      $lookup: {
        from: "brands",
        localField: "productId.brand",
        foreignField: "_id",
        as: "productId.brand",
        pipeline: [{ $project: { brandName: 1, image: 1 } }],
      },
    },
    { $unwind: "$productId.brand" }
  );

  //Seller Info populate

  // search.push(
  //   {
  //     $lookup: {
  //       from: "admins",
  //       localField: "productId.adminId",
  //       foreignField: "_id",
  //       as: "productId.adminId",
  //       pipeline: [
  //         // { $match: { isBlocked: false } },
  //         { $project: { fullName: 1, businessName: 1 } },
  //       ],
  //     },
  //   },
  //   { $unwind: "$productId.adminId" }
  // );

  let data = await variantModel.aggregate(search); //.explain();
  let totalRecords = data.length;
  let ndata = (data.length && data.splice(page * limit, limit)) || [];

  res.send({ success: true, data: { totalRecords, data: ndata, ...extra } });
});

//---------Old Filter-------//
exports.getFilterProducts = catchAsyncError(async (req, res, next) => {
  let {
    page,
    distance = Distance,
    subCat,
    lPrice,
    hPrice,
    sortP = 1,
    lat = "22",
    lng = "87",
    category,
    subCategory,
    brand,
    inputSearch,
  } = req.query;
  //console.log(req)
  console.log(sortP);
  // let {inputSearch, brand} = req.body

  let search = [
    {
      $geoNear: {
        includeLocs: "location",
        distanceField: "distance",
        near: { type: "Point", coordinates: [+lat, +lng] },
        maxDistance: distance * 1000,
        spherical: true,
      },
    },
  ];

  if (inputSearch) {
    search.push({
      $match: {
        $text: { $search: +inputSearch },
      },
    });
  }
  //category filter
  if (category.length > 1 && !subCat) {
    search.push({
      $lookup: {
        from: "variant",
        localField: "$category",
        foreginField: "$_id",
        as: "category",
      },
    });
    search.push({ $unwind: "$category" });
    search.push({
      $match: {
        "category.categoryName": category,
      },
    });
  } else if (subCat) {
    search.push({
      $lookup: {
        from: "subcategories",
        localField: "$subCategory",
        foreginField: "$_id",
        as: "subCategory",
      },
    });
    search.push({ $unwind: "$subCategory" });
    search.push({
      $match: {
        "subCategory.title": +subCat,
      },
    });
  }
  //Brand filter
  if (brand.length > 1) {
    search.push({
      $lookup: {
        from: "brand",
        localField: "$brand",
        foreginField: "$_id",
        as: brand,
      },
    });
    search.push({
      $match: {
        "brand.name": { $in: +brand },
      },
    });
  }
  let priceSort = {};
  if (lPrice) {
    priceSort["$gt"] = hPrice;
  }
  if (hPrice) {
    priceSort["$lt"] = hPrice;
  }
  if (priceSort) {
    search.push({
      $match: {
        price: +priceSort,
      },
    });
  }
  console.log(search.near);
  if (lPrice > 0) {
    search.push({ price: { $gte: +minP } });
  }

  if (hPrice > 0) {
    search.push({ price: { $lte: +maxP } });
  }

  let data = await Variant.aggregate([
    ...search,
    {
      $sort: { price: parseInt(sortP) },
    },
  ]);
  res.status(200).send({ success: true, data });

  console.log(category);
});

exports.getNearByProducts = catchAsyncError(async (req, res) => {
  let { lat = Latitude, lng = Longitude, distance = 1000000 } = req.query;
  //return res.send(await Product.find())

  let data = await Variant.aggregate([
    {
      $geoNear: {
        includeLocs: "location",
        distanceField: "distance",
        near: { type: "Point", coordinates: [+lat, +lng] },
        maxDistance: +distance * 1000,
        spherical: true,
      },
    },
    { $limit: 50 },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "productId",
        pipeline: [
          {
            $project: {
              adminId: 1,
              address: 1,
              businessName: 1,
              brand: 1,
              location: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$productId" },
    {
      $lookup: {
        from: "brands",
        localField: "productId.brand",
        foreignField: "_id",
        as: "productId.brand",
        pipeline: [
          {
            $project: { brandName: 1 },
          },
        ],
      },
    },
    {
      $unwind: "$productId.brand",
    },
    {
      $lookup: {
        from: "admins",
        localField: "productId.adminId",
        foreignField: "_id",
        as: "productId.adminId",
        pipeline: [
          {
            $project: { fullName: 1, businessName: 1 },
          },
        ],
      },
    },
    {
      $unwind: "$productId.adminId",
    },
  ]);

  return res.status(200).send({ success: true, data });
});

exports.getNearBySameProducts = catchAsyncError(async (req, res) => {
  let {
    lat = Latitude,
    lng = Longitude,
    distance = Distance,
    variantId,
  } = req.query;
  //return res.send(await Product.find())
  let product = await Variant.findById(variantId).populate("productId");

  let data = await Variant.aggregate([
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
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "productId",
        pipeline: [{ $project: { brand: 1, subCategory: 1, adminId: 1 } }],
      },
    },
    { $unwind: "$productId" },
    { $match: { "productId.subCategory": product.productId.subCategory } },
    { $limit: 15 },

    {
      $lookup: {
        from: "brand",
        localField: "productId.brand",
        foreignField: "_id",
        as: "productId.brand",
      },
    },

    // {
    //   $unwind: "$productId.brand",
    // },
    // {
    //   $lookup: {
    //     from: "admin",
    //     localField: "productId.adminId",
    //     foreignField: "_id",
    //     as: 'productId.adminId',
    //     pipeline: [{$project: {fullName: 1, address: 1}}]
    //   },
    // },
    // {
    //   $unwind: "$productId.adminId"
    // },

    // {
    //   $project: {fullName: 1, address: 1, businessName: 1, distance: 1, location: 1}
    // }
    { $limit: 15 },
  ]);

  return res.status(200).send({ success: true, data });
});

//Search Product Variants By Name And Tags
exports.searchProduct = catchAsyncError(async (req, res, next) => {
  const { keyword } = req.params;

  const variant = await Variant.find({
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { tags: { $regex: keyword, $options: "i" } },
    ],
  }).select("-brand -category");

  res.status(200).json({ success: true, totalCount: variant.length, variant });
});

//-------------wishlist----------------//

exports.getWishList = catchAsyncError(async (req, res, next) => {
  let { _id } = req.user;
  let wishList = await userModel.aggregate([
    { $match: { _id: _id } },
    {
      $lookup: {
        from: "variants",
        localField: "wishList",
        foreignField: "_id",
        as: "wishList",
      },
    },
    { $unwind: "$wishList" },
    {
      $lookup: {
        from: "products",
        localField: "wishList.productId",
        foreignField: "_id",
        as: "wishList.productId",
        pipeline: [{ $project: { brand: 1, adminId: 1 } }],
      },
    },
    { $unwind: "$wishList.productId" },
    {
      $lookup: {
        from: "admins",
        localField: "wishList.productId.adminId",
        foreignField: "_id",
        as: "wishList.productId.adminId",
        pipeline: [{ $project: { fullName: 1, busineesName: 1 } }],
      },
    },
    { $unwind: "$wishList.productId.adminId" },
    {
      $lookup: {
        from: "brands",
        localField: "wishList.productId.brand",
        foreignField: "_id",
        as: "wishList.productId.brand",
      },
    },
    { $unwind: "$wishList.productId.brand" },
    { $group: { _id: null, wishList: { $push: "$wishList" } } },
  ]); //findById(_id).populate("wishList");
  return res
    .status(200)
    .send({ success: true, data: wishList[0] || { wishList: [] } });
});

exports.addToWishList = catchAsyncError(async (req, res, next) => {
  let { variantId } = req.params;
  let variant = await variantModel.findById(variantId);
  if (!variant) {
    return next(new ErrorHandler("variantis not availabe", 400));
  }
  let exist = await userModel.findById(req.user._id);
  if (exist.wishList.includes(variantId)) {
    let newData = exist.wishList.filter((x) => x != variantId);
    exist.wishList = newData;
    let data = await exist.save();

    return res
      .status(200)
      .send({ success: true, data, message: "Product Removed From wishlist" });
  }
  let list = await userModel.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishList: variantId } },
    { new: true }
  );

  res
    .status(200)
    .send({ success: true, data: list, message: "Product added to wishlist" });
});

exports.removeFromWishList = catchAsyncError(async (req, res, next) => {
  let { variantId } = req.params;
  let variant = await variantModel.findById(variantId);
  if (!variant) {
    return next(new ErrorHandler("variantis not availabe", 400));
  }
  let list = await userModel.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishList: variantId } },
    { new: true }
  );

  res
    .status(200)
    .send({ success: true, data: list, message: "Product added to wishlist" });
});

//------------FOLLOWING FEATURES---------------//

exports.followSeller = catchAsyncError(async (req, res, next) => {
  let { adminId } = req.params;
  await Admin.findByIdAndUpdate(adminId, {
    $addToSet: { followers: req.user._id },
  });
  await userModel.findByIdAndUpdate(req.user._id, {
    $addToSet: { following: adminId },
  });
});

exports.unFollowSeller = catchAsyncError(async (req, res, next) => {
  let { adminId } = req.params;
  await Admin.findByIdAndUpdate(adminId, {
    $pull: { followers: req.user._id },
  });
  await userModel.findByIdAndUpdate(req.user._id, {
    $pull: { following: adminId },
  });
});

//------------variant-----------------//

exports.getVariant = catchAsyncError(async (req, res, next) => {
  let { slug } = req.params;
  let { variantId } = req.query;
  let data = await Variant.findById(variantId)
    .populate("brand")
    .populate("productId")
    .populate("adminId", "businessName")
    .lean();
  let product = await Product.findById(data.productId._id)
    .populate("brand")
    .populate("adminId", "businessName");

  let result = {};
  //let filters = product.variantFilterOptions.color.values;
  //console.log(filters)
  //let x = filters[0];

  //----------------------//

  let filterValues = product.filterKeys;
  let query = {};
  console.log(filterValues);
  let final = {};

  for (const i of filterValues) {
    let values = product.variantFilterOptions[i];

    let datas = {};

    async function z() {
      for (const mp of values) {
        let key = mp.value;
        let qr = `options.${i}`;
        let nquery = { ...query };

        nquery[qr] = key;
        console.log(nquery);
        let filterData = await Variant.findOne(nquery);
        console.log(filterData);
        datas[key] = filterData;
      }
    }

    await z();

    console.log(i);

    let nqr = `options.${i}`;
    query[nqr] = data.options[i];
    console.log(query);
    //console.log(datas)
    final[i] = datas;
  }

  //--------------------//

  res.send({
    variant: { ...data, productId: product },
    filterdVariants: final,
  });
});
