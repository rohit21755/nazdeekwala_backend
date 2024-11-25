const catchAsyncError = require("../middlewares/catchAsyncError");
const orderModel = require("../models/orderModel");
const productModel = require("../models/productModel");
const mongoose = require("mongoose");

const branches = [
  { case: { $eq: ["$_id.month", 1] }, then: "Jan" },
  { case: { $eq: ["$_id.month", 2] }, then: "Feb" },
  { case: { $eq: ["$_id.month", 3] }, then: "Mar" },
  { case: { $eq: ["$_id.month", 4] }, then: "Apr" },
  { case: { $eq: ["$_id.month", 5] }, then: "May" },
  { case: { $eq: ["$_id.month", 6] }, then: "Jun" },
  { case: { $eq: ["$_id.month", 7] }, then: "Jul" },
  { case: { $eq: ["$_id.month", 8] }, then: "Aug" },
  { case: { $eq: ["$_id.month", 9] }, then: "Sep" },
  { case: { $eq: ["$_id.month", 10] }, then: "Oct" },
  { case: { $eq: ["$_id.month", 11] }, then: "Nov" },
  { case: { $eq: ["$_id.month", 12] }, then: "Dec" },
];

exports.getTotalSales = catchAsyncError(async (req, res) => {
  const { _id } = req.admin;

  let data = await orderModel.aggregate([
    {
      $match: { adminId: _id },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
      },
    },
    // {
    //   $unwind: '$totalAmount', // Unwind the "sales" array
    // },
    {
      $project: { _id: 0, totalAmount: 1 },
    },
  ]);

  return res.status(200).send({ success: true, data: data[0] });
});

exports.getTotalProd = catchAsyncError(async (req, res) => {
  const { _id } = req.admin;

  let data = await productModel.find({ adminId: _id });
  return res.status(200).send({ success: true, data });
});

exports.getTotalCustomers = catchAsyncError(async (req, res) => {
  //console.log(req.admin)
  const { _id } = req.admin;
  console.log(req.admin);
  let data = await orderModel.aggregate([
    { $match: { adminId: _id } },
    {
      $group: {
        _id: "$userId",
      },
    },
    {
      $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
      },
    },
  ]);

  return res.status(200).send({ success: true, data: data[0] });
});

exports.getTotalOrders = catchAsyncError(async (req, res) => {
  const { _id } = req.admin;

  let data = await orderModel.find({ adminId: _id }).count();
  return res.status(200).send({ success: true, data });
});

exports.getStatics = catchAsyncError(async (req, res, next) => {
  const { _id } = req.admin;
  console.log("amin stats");

  let totalAdmin = await orderModel.find({ adminId: _id }).count();

  let totalCustomers = await orderModel.aggregate([
    { $match: { adminId: _id } },
    {
      $group: {
        _id: "$userId",
      },
    },
    {
      $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
      },
    },
  ]);

  let totalProducts = await productModel.find({ adminId: _id }).count();

  let totalSales = await orderModel.aggregate([
    {
      $match: { adminId: _id },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
      },
    },
    // {
    //   $unwind: '$totalAmount', // Unwind the "sales" array
    // },
    {
      $project: { _id: 0, totalAmount: 1 },
    },
  ]);
  let totalOrders = await orderModel.find({ adminId: _id }).count();

  console.log("totalCustomers ", totalCustomers);

  return res.status(200).send({
    success: true,
    data: {
      totalAdmin,
      totalCustomers:
        (totalCustomers &&
          totalCustomers.length > 0 &&
          totalCustomers[0].totalCustomers) ||
        0,
      totalSales:
        (totalSales && totalSales.length > 0 && totalSales[0].totalAmount) || 0,
      totalOrders,
      totalProducts,
    },
  });
});

//-------------------------super admin stats-------------------------//

exports.getSuperStatics = catchAsyncError(async (req, res, next) => {
  console.log("super static");

  //console.log(req.query.brand)
  let totalAdmin = await orderModel.find().count();

  let totalCustomers = await orderModel.aggregate([
    {
      $group: {
        _id: "$userId",
      },
    },
    {
      $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
      },
    },
  ]);

  let totalProducts = await productModel.find().count();
  let totalOrders = await orderModel.find().count();

  let totalSales = await orderModel.aggregate([
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
      },
    },
    // {
    //   $unwind: '$totalAmount', // Unwind the "sales" array
    //},
    {
      $project: { totalAmount: 1 },
    },
  ]);

  return res.status(200).send({
    success: true,
    data: {
      totalAdmin,
      totalCustomers:
        (totalCustomers &&
          totalCustomers.length > 0 &&
          totalCustomers[0].totalCustomers) ||
        0,
      totalSales:
        (totalSales && totalSales.length > 0 && totalSales[0].totalAmount) || 0,
      totalOrders,
      totalProducts,
    },
  });
});

//-------------------------------

exports.superLastMonthSellsByDay = catchAsyncError(async (req, res) => {
  //const adminId = req.admin._id

  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);

  let data = await orderModel.aggregate([
    {
      $match: {
        // adminId: adminId,
        createdAt: { $gte: oneMonthAgo },
      },
    },
    {
      $project: {
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
        amount: 1,
        createdAt: 1,
      },
    },
    // {
    //   $group: {
    //    _id: { date : {$dateToString: { format: '%Y-%m-%d', date: '$createdAt' }},month: {$month: '$createdAt'},
    //    day: {$dayOfMonth: '$createdAt'}, },
    //     totalSales: { $sum: '$amount' },
    //   },
    // },

    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        totalSales: { $sum: "$amount" },
      },
    },

    { $sort: { _id: 1 } },

    // date to name convert
    {
      $project: {
        date: {
          $switch: {
            branches: branches,
            default: "Unknown",
          },
        },
        day: { $convert: { input: "$_id.day", to: "string" } },
        totalSales: "$totalSales",
      },
    },

    //month name + day
    {
      $project: {
        date: { $concat: ["$date", " ", "$day"] },
        totalSales: "$totalSales",
      },
    },

    //creating array
    {
      $group: {
        _id: null,
        dates: { $push: "$date" },
        totalSales: { $push: "$totalSales" },
      },
    },
  ]);

  res.status(200).send({ success: true, data: data[0] || {} });
});

//----------------------Super sales ----------------------------------//

exports.lastMonthSellsByDay = catchAsyncError(async (req, res) => {
  const adminId = req.admin._id;

  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);

  let data = await orderModel.aggregate([
    {
      $match: {
        adminId: adminId,
        createdAt: { $gte: oneMonthAgo },
      },
    },
    {
      $project: {
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
        amount: 1,
        createdAt: 1,
      },
    },
    // {
    //   $group: {
    //    _id: { date : {$dateToString: { format: '%Y-%m-%d', date: '$createdAt' }},month: {$month: '$createdAt'},
    //    day: {$dayOfMonth: '$createdAt'}, },
    //     totalSales: { $sum: '$amount' },
    //   },
    // },

    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        totalSales: { $sum: "$amount" },
      },
    },

    { $sort: { _id: 1 } },

    // date to name convert
    {
      $project: {
        date: {
          $switch: {
            branches: branches,
            default: "Unknown",
          },
        },
        day: { $convert: { input: "$_id.day", to: "string" } },
        totalSales: "$totalSales",
      },
    },

    //month name + day
    {
      $project: {
        date: { $concat: ["$date", " ", "$day"] },
        totalSales: "$totalSales",
      },
    },

    //creating array
    {
      $group: {
        _id: null,
        dates: { $push: "$date" },
        totalSales: { $push: "$totalSales" },
      },
    },
  ]);

  res.status(200).send({ success: true, data: data[0] || {} });
});

exports.lastMonthTotalSales = catchAsyncError(async (req, res) => {
  let { _id } = req.admin;

  let data = await orderModel.aggregate([
    {
      $match: { adminId: _id },
    },

    {
      $group: {
        _id: null,
        totalSales: { $sum: "$amount" },
      },
    },
    {
      $project: { _id: 0, totalSales: 1 },
    },
  ]);

  res.status(200).send({ success: true, data: data[0] });
});

exports.lastFourMonthSells = catchAsyncError(async (req, res) => {
  const adminId = req.admin._id;

  const currentDate = new Date();
  const fourMonthAgo = new Date();
  fourMonthAgo.setMonth(currentDate.getMonth() - 4);

  let data = await orderModel.aggregate([
    {
      $match: {
        adminId: adminId,
        createdAt: { $gte: fourMonthAgo },
      },
    },
    {
      $project: {
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
        amount: 1,
        createdAt: 1,
      },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        totalSales: { $sum: "$amount" },
      },
    },

    { $sort: { _id: 1 } },

    //
    {
      $project: {
        date: {
          $switch: {
            branches: branches,
            default: "Unknown",
          },
        },
        totalSales: "$totalSales",
      },
    },

    {
      $group: {
        _id: null,
        dates: { $push: "$date" },
        totalSales: { $push: "$totalSales" },
      },
    },
  ]);

  res.status(200).send({ success: true, data: data[0] || {} });
});

//------------------super admin 4months sells---------------------------//

exports.superLastFourMonthSells = catchAsyncError(async (req, res) => {
  const currentDate = new Date();
  const fourMonthAgo = new Date();
  fourMonthAgo.setMonth(currentDate.getMonth() - 4);

  let data = await orderModel.aggregate([
    {
      $match: {
        createdAt: { $gte: fourMonthAgo },
      },
    },
    {
      $project: {
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
        amount: 1,
        createdAt: 1,
      },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        totalSales: { $sum: "$amount" },
      },
    },

    { $sort: { _id: 1 } },

    {
      $project: {
        date: {
          $switch: {
            branches: branches,
            default: "Unknown",
          },
        },
        totalSales: "$totalSales",
      },
    },

    {
      $group: {
        _id: null,
        dates: { $push: "$date" },
        totalSales: { $push: "$totalSales" },
      },
    },
  ]);

  res.status(200).send({ success: true, data: data[0] || {} });
});

//-----------------------------------------------
exports.lastOneMonthOrders = catchAsyncError(async (req, res) => {
  let { _id } = req.admin;
  let currentDate = new Date();
  let lastOne = new Date();
  lastOne.setMonth(currentDate.getMonth() - 1);

  let data = await orderModel.aggregate([
    {
      $match: { adminId: _id, createdAt: { $gte: lastOne } },
    },
    {
      $project: {
        // month:  { $dateToString: { format: '%B', date: '$createdAt' } },                  //{$month: '$createdAt'},
        day: { $dayOfMonth: "$createdAt" },
        amount: 1,
        qty: 1,
        createdAt: 1,
      },
    },
    //'%Y-%m-%d

    // $dateToString: {
    //   format: '%B',
    //   date: {
    //     $dateFromParts: {
    //       year: '$_id.year',
    //       month: '$_id.month',
    //       day: '$_id.day',
    //     },
    //   },
    // },

    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        totalOrders: { $sum: 1 },
        totalQuntity: { $sum: "$qty" },
      },
    },

    //-------------------//
    {
      $project: {
        date: {
          $switch: {
            branches: branches,
            default: "Unknown",
          },
        },
        day: { $convert: { input: "$_id.day", to: "string" } },
        totalOrders: "$totalOrders",
        totalQuntity: "$totalQuntity",
      },
    },

    //month name + day
    {
      $project: {
        date: { $concat: ["$date", " ", "$day"] },
        totalOrders: "$totalOrders",
        totalQuntity: "$totalQuntity",
      },
    },

    {
      $group: {
        _id: null,
        dates: { $push: "$date" },
        totalOrders: { $push: "$totalOrders" },
        totalQuntity: { $push: "$totalQuntity" },
      },
    },
  ]);
  res.status(200).send({ success: true, data: data[0] || {}});
});

//-----------------super admin one month orders-------------------//

exports.superLastOneMonthOrders = catchAsyncError(async (req, res) => {
  let currentDate = new Date();
  let lastOne = new Date();
  lastOne.setMonth(currentDate.getMonth() - 1);

  let data = await orderModel.aggregate([
    {
      $match: { createdAt: { $gte: lastOne } },
    },
    {
      $project: {
        // month: {$month: '$createdAt'},
        // day: {$dayOfMonth: '$createdAt'},
        amount: 1,
        qty: 1,
        createdAt: 1,
      },
    },

    //-----------------------------------//

    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        totalOrders: { $sum: 1 },
        totalQuntity: { $sum: "$qty" },
      },
    },

    //------------------------------------------------//
    {
      $project: {
        date: {
          $switch: {
            branches: branches,
            default: "Unknown",
          },
        },
        day: { $convert: { input: "$_id.day", to: "string" } },
        totalOrders: "$totalOrders",
        totalQuntity: "$totalQuntity",
      },
    },

    //month name + day
    {
      $project: {
        date: { $concat: ["$date", " ", "$day"] },
        totalOrders: "$totalOrders",
        totalQuntity: "$totalQuntity",
      },
    },

    {
      $group: {
        _id: null,
        dates: { $push: "$date" },
        totalOrders: { $push: "$totalOrders" },
        totalQuntity: { $push: "$totalQuntity" },
      },
    },
  ]);
  res.status(200).send({ success: true, data: data[0] || {} });
});

//-------------------------------------------//

exports.superLastFourMonthOrders = catchAsyncError(async (req, res) => {
  let currentDate = new Date();
  let lastFour = new Date();
  lastFour.setMonth(currentDate.getMonth() - 4);

  let data = await orderModel.aggregate([
    {
      $match: { createdAt: { $gte: lastFour } },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        totalOrders: { $sum: 1 },
      },
    },

    //----date sring//
    {
      $project: {
        date: {
          $switch: {
            branches: branches,
            default: "Unknown",
          },
        },

        totalOrders: "$totalOrders",
      },
    },

    {
      $group: {
        _id: null,
        dates: { $push: "$date" },
        totalOrders: { $push: "$totalOrders" },
      },
    },
  ]);
  res.status(200).send({ success: true, data: data[0] });
});

//-------Super four month orders-------------//

exports.lastFourMonthOrders = catchAsyncError(async (req, res) => {
  let { _id } = req.admin;
  let currentDate = new Date();
  let lastFour = new Date();
  lastFour.setMonth(currentDate.getMonth() - 4);

  let data = await orderModel.aggregate([
    {
      $match: { adminId: _id, createdAt: { $gte: lastFour } },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        totalOrders: { $sum: 1 },
      },
    },

    //----date sring//
    {
      $project: {
        date: {
          $switch: {
            branches: branches,
            default: "Unknown",
          },
        },

        totalOrders: "$totalOrders",
      },
    },

    {
      $group: {
        _id: null,
        dates: { $push: "$date" },
        totalOrders: { $push: "$totalOrders" },
      },
    },
  ]);
  res.status(200).send({ success: true, data: data[0] });
});

exports.topTenSellers = catchAsyncError(async (req, res) => {
  let data = await orderModel.aggregate([
    {
      $group: {
        _id: "$adminId",
        totalSales: { $sum: "$amount" },
      },
    },
    {
      $lookup: {
        from: "admins",
        localField: "_id",
        foreignField: "_id",
        as: "user",
        pipeline: [{ $project: { fullName: 1 } }],
      },
    },
    { $unwind: "$user" },
    { $sort: { totalSales: -1 } },
    { $limit: 10 },
    {
      $group: {
        _id: null,
        totalsales: { $push: "$totalSales" },
        names: { $push: "$user.fullName" },
      },
    },
  ]);
  res.status(200).send({ success: true, data: data[0] || {} });
});

exports.topTenProducts = catchAsyncError(async (req, res) => {
  let data = await orderModel.aggregate([
    {
      $group: {
        _id: "$variantId",
        totalSales: { $sum: "$qty" },
      },
    },
    { $sort: { totalSales: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "variants",
        localField: "_id",
        foreignField: "_id",
        as: "variant",
        pipeline: [{ $project: { name: 1, productId: 1 } }],
      },
    },
    { $unwind: "$variant" },
    // {$lookup: { from: 'products', localField: 'variant.productId', foreignField: '_id', as: 'product', } },
    // {$unwind: '$product'},
    {
      $group: {
        _id: null,
        products: { $push: "$variant.name" },
        totalSales: { $push: "$totalSales" },
      },
    },
  ]);
  res.status(200).send({ success: true, data: data[0] || {} });
});
