const mongoose = require("mongoose");
const orderModel = require("../models/orderModel");
const variantsModel = require("../models/variantModel");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const variantModel = require("../models/variantModel");
const brandModel = require("../models/brandModel");
const adminModel = require("../models/adminModel");
const cartModel = require("../models/cartModel");
const { createChat } = require("./chatController");
const crypto = require("crypto");
const { orderMailTo } = require("../utils/sendOrderMail");
const paymentModel = require("../models/paymentModel");
const subScription = require("../models/subScription");
const Razorpay = require("razorpay");
const myEmitter = require('../utils/event')

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

function generateRandomOrderId() {
  const timestamp = Date.now().toString();
  const randomChars = Math.random().toString(36).substr(2, 5);
  const orderId = `${timestamp}-${randomChars}`;

  return orderId;
}

const order = {
  orderCartByAdmin: catchAsyncError(async (req, res, next) => {
    let { _id, fullName, mobile, email, address } = req.user;

    let { adminId } = req.query;

    let orderId = generateRandomOrderId();
    let total = 0;
    let query = [];
    //    Promise.all( variants.map(async(id) => {
    //         let prod = await variantsModel.findById(id)
    //         if(prod) {
    //             total += prod.amount

    //         }

    //     })
    //    )
    let variants = await cartModel.aggregate([
      { $match: { admin: new mongoose.Types.ObjectId(adminId), userId: _id } },
      {
        $lookup: {
          from: "variants",
          foreignField: "_id",
          localField: "variantId",
          as: "variantId",
        },
      },
      { $unwind: "$variantId" },
      {
        $lookup: {
          from: "products",
          foreignField: "_id",
          localField: "variantId.productId",
          as: "variantId.productId",
        },
      },
      { $unwind: "$variantId.productId" },
    ]);
    console.log(variants);
    //find({ admin: adminId, userId: _id }).populate("variantId");

    // let prod = await variantModel.findById(variantId).populate('productId')
    // if(!prod){
    //     return next(new ErrorHandler("Product Id is invalid", 400))
    // }
 
    let nEntries = [];
    for (let i of variants) {
      let total = parseInt(i.variantId.discountPrice) * i.qty;
      let data = {
        fullName,
        mobile,
        userId: _id,
        adminid: adminId,
        orderId,
        qty: i.qty,
        address,
        variantId: i.variantId,
        brand: i.variantId.productId.brand,
        amount: total,
        address,
        email,
      };
      nEntries.push(data);
    }
    let entries = await orderModel.insertMany(nEntries);
    console.log(entries);
    let totalOrders = entries.length;

    let adminData = await adminModel.findByIdAndUpdate(adminId, {
      $inc: { totalOrders: totalOrders },
    });
    let chats = [];
    for (let i of entries) {
      await brandModel.findByIdAndUpdate(i.brand, {
        $inc: { totalOrders: 1 },
      });

      let chat = await createChat({
        user: req.user._id,
        admin: adminId,
        orderId: i._id,
        message: "I want to Buy This Product",
      });
      chats.push(chat);
      myEmitter.emit("new order", {...chat.message, orderId: i})

      await orderMailTo({
        user: req.user,
        totalOrders: entries.length,
        admin: adminData,
      });
    }
    res
      .status(200)
      .send({ success: true, data: { data: entries, chats: chats[0] || [] } });
  }),

  createOrder: catchAsyncError(async (req, res, next) => {
    let { _id, fullName, mobile, email } = req.user;

    let { paymentMethod = "cod", variantId, qty, address } = req.body;

    let orderId = generateRandomOrderId();
    //let total = 0;
    let query = [];
    //    Promise.all( variants.map(async(id) => {
    //         let prod = await variantsModel.findById(id)
    //         if(prod) {
    //             total += prod.amount

    //         }

    //     })
    //    )

    let prod = await variantModel.findById(variantId).populate("productId");
    if (!prod) {
      return next(new ErrorHandler("Product Id is invalid", 400));
    }
    let total = parseInt(prod.discountPrice) * qty;
    // prod.stock -= parseInt(qty)
    // if (prod.stock >= 0) {
    //     await prod.save()

    // } else {
    //     return next(new ErrorHandler("Product stock is not available", 400))
    // }

    let data = await orderModel.create({
      fullName,
      mobile,
      userId: _id,
      adminid: prod.productId.adminId,
      brand: prod.productId.brand,

      orderId,
      address,
      variantId,
      amount: total,
      address,
      email,
    });

    await brandModel.findByIdAndUpdate(prod.productId.brand, {
      $inc: { totalOrders: 1 },
    });
    await adminModel.findByIdAndUpdate(prod.productId.adminId, {
      $inc: { totalOrders: 1 },
    });

    let chat = await createChat({
      user: req.user._id,
      admin: prod.productId.adminId,
      orderId: data._id,
      message: "I want to Buy This Product",
    });

    res.status(200).send({ success: true, data: { data, chat } });
  }),

  orderCart: catchAsyncError(async (req, res, next) => {
    let { _id, fullName, mobile, email } = req.user;
    let { cartId } = req.params;

    let { paymentMethod = "cod", address } = req.body;

    let cart = await cartModel.findById(cartId);

    if (!cartId) {
      return next(new ErrorHandler("CartId is invalid", 400));
    }
    if (cart.cart.length == 0) {
      return res
        .status(200)
        .send({ success: true, data: [], message: "cart is empty" });
    }

    let query = [];
    await Promise.all(
      cart.cart.map(async (vr) => {
        let prod = await variantsModel
          .findById(vr.variantId)
          .populate("productId");
        console.log(prod);
        prod.stock -= parseInt(vr.qty);
        if (prod.stock >= 0) {
          await prod.save();
        } else {
          return;
        }
        let orderId = new mongoose.Types.ObjectId();
        console.log(orderId);
        let total = 0;
        total = parseInt(prod.price) * parseInt(vr.qty);
        //console.log(total)
        if (prod) {
          let data = {
            fullName,
            mobile,
            userId: _id,
            adminId: prod.productId.adminId,
            orderId,
            address,
            variantId: prod._id,
            amount: total,
            address,
            email,
            paymentMethod,
            qty: vr.qty,
          };

          query.push(data);
          console.log(query);
        }
      })
    );
    console.log(query);
    let order = await orderModel.insertMany(query);

    cart.cart = [];
    await cart.save();

    res.status(200).send({ success: true, data: order });
  }),

  getOrderById: catchAsyncError(async (req, res) => {
    let id = req.params.orderId;

    let order = await orderModel
      .find({ orderId: id })
      .populate("userId", "fullName mobileNumber");

    if (!order) {
      return next(new ErrorHandler("Order id is invalid", 400));
    }
    res.status(200).send({ success: true, data: order });
  }),

  updateOrder: catchAsyncError(async (req, res, next) => {
    //let {  } = req.params;
    let { status, orderId, address = "" } = req.body;
    let { _id } = req.admin;
    let order = await orderModel.findById(orderId);

    if (!order) {
      return next(new ErrorHandler("order id is invalid", 400));
    }
    // if(order.userId!=_id){
    //     return next(new ErrorHandler("you are not owner of this order", 400))
    // }

    if (status) {
      order.status = status;
    }
    if (address) {
      order.address = address;
    }
    // if(variants){
    //     order.variants = variants
    // }

    let result = await order.save();
    await createChat({
      admin: _id,
      user: order.userId,
      orderId: order._id,
      message: `Your order request has been ${status} by Seller`,
    });

    res
      .status(200)
      .send({ success: true, data: result, message: "Order Updation Success" });
  }),

  superUpdateOrder: catchAsyncError(async (req, res, next) => {
    //let {  } = req.params;
    let { status, orderId, address = "" } = req.body;
    //let { _id } = req.admin;
    let order = await orderModel.findById(orderId);

    if (!order) {
      return next(new ErrorHandler("order id is invalid", 400));
    }
    // if(order.userId!=_id){
    //     return next(new ErrorHandler("you are not owner of this order", 400))
    // }

    if (status) {
      order.status = status;
    }
    if (address) {
      order.address = address;
    }
    // if(variants){
    //     order.variants = variants
    // }

    let result = await order.save();
    await createChat({
      admin: order.adminId,
      user: order.userId,
      orderId: order._id,
      message: `Your order request has been ${status} by Seller`,
    });

    res
      .status(200)
      .send({ success: true, data: result, message: "Order Updation Success" });
  }),

  deleteAOrder: catchAsyncError(async (req, res, next) => {
    let { orderId } = req.params;
    let order = await orderModel.findById(orderId);

    let id = req.user._id.toString();
    if (req.user.role !== "superAdmin" && order.userId != id) {
      return next(
        new ErrorHandler("only owner and super admin can delete the order")
      );
    }
    await orderModel.findByIdAndDelete(orderId);
    res.status(200).send({ success: true, message: "Order deleted success" });
  }),

  superDeleteAOrder: catchAsyncError(async (req, res, next) => {
    let { orderId } = req.params;
    let order = await orderModel.findById(orderId);
    let id = req.user._id.toString();
    if (req.user.role !== "superAdmin" && order.userId != id) {
      return next(
        new ErrorHandler("only owner and super admin can delete the order")
      );
    }
    await orderModel.findByIdAndDelete(orderId);
    res.status(200).send({ success: true, message: "Order deleted success" });
  }),

  cancelOrder: catchAsyncError(async (req, res, next) => {
    let { orderId } = req.params;
    let order = await orderModel.fidnById(orderId);
    let id = req.user._id.toString();
    if (req.user.role !== "superAdmin" && order.userId != id) {
      return next(
        new ErrorHandler("only owner and super admin can delete the order")
      );
    }

    order.status = "canceled";
    await order.save();
    res.status(200).send({ success: true, message: "Order deleted success" });
  }),

  getAllOrdersByAdmin: catchAsyncError(async (req, res, next) => {
    let { _id } = req.admin;
    let { lastMonth } = req.query;
    let qr = {};
    if (lastMonth && lastMonth!="0") {
   
      let newDate = new Date();
      let date = newDate.getMonth() - lastMonth;
      newDate.setMonth(date);
      qr["createdAt"] = { $gt: newDate };
    }

    let orders = await orderModel
      .find({ adminId: _id, ...qr })
      .populate("userId", "fullName mobileNumber createdAt");
    res.status(200).send({ success: true, data: orders });
  }),

  getAllOrdersBySuperAdmin: catchAsyncError(async (req, res, next) => {
    let { _id } = req.user;
    let { status = "pending" } = req.query;
    let { lastMonth } = req.query;
    let qr = {};
    if (lastMonth) {
      let newDate = new Date();
      let date = newDate.getMonth() - lastMonth;
      newDate.setMonth(date);
      qr["createdAt"] = { $gt: newDate };
    }

    let orders = await orderModel
      .find({ ...qr })
      .populate("userId", "fullName mobileNumber createdAt")
      .limit(100);

    res
      .status(200)
      .send({ success: true, data: orders, message: "Getting Orders List" });
  }),

  //------------------------------------New payment Apis-------------------------------------//

  getApiKey: catchAsyncError(async (req, res, next) => {}),
  sellerCreateOrder: catchAsyncError(async (req, res, next) => {
    let { duration } = req.body;
    if (!duration || duration < 0 || duration > 20) {
      return next(new ErrorHandler("duration is invalid", 400));
    }

    const amount = 400 * 100;

    let date = new Date();
    let nDate = date.setDate(date.getDate() + duration * 30);
    let newAmount = amount * duration;

    const options = {
      amount: newAmount,
      currency: "INR",
    };
    let order = await razorpayInstance.orders.create(options);
    let subscription = await subScription.create({
      amount: newAmount,
      amount_due: newAmount,
      startDate: Date.now(),
      razorpay_order_id: order.id,
      endDate: nDate,
      adminId: req.admin._id,
    });
    res.status(201).send({
      success: true,
      data: subscription,
      key: process.env.RAZORPAY_API_KEY,
      message: `Creating Subscription for ${duration} Months`,
    });
  }),

  verifySellerPayment: catchAsyncError(async (req, res, next) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body.response || {};

    console.log({
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    });

    // const { adminId, duration } = req.body || {};
    //console.log(req.body)
    //let details = {email: "poradi500@gmail.com"}

    let body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      console.log("payment veryfied");

      let payment = await subScription.findOne({ razorpay_order_id });
      if (payment) {
        payment.status = "completed";
        payment.razorpay_payment_id = razorpay_payment_id;
        payment.amount_due = 0;
        payment.amount_paid = payment.amount;
        payment.isActive = true;
        await payment.save();
        await adminModel.findByIdAndUpdate(payment.adminId, {
          lastPaymentId: payment._id,
        });
        return res.status(200).send({
          success: true,
          data: payment,
          message: "Payment veryfication success",
        });
      }
    }
  }),
};

module.exports = order;
