const catchAsyncError = require("../middlewares/catchAsyncError");
const cartModel = require("../models/cartModel");
const variantModel = require("../models/variantModel");
const ErrorHandler = require("../utils/errorHandler");

const cartCnt = {
  updateCart: catchAsyncError(async (req, res, next) => {
    let { cartId } = req.params;
    let { productId, qty } = req.body;
    console.log(req.body);
    let prod = await variantModel.findById(productId);
    if (!prod) {
      return next(new ErrorHandler("ProductId is invalid", 400));
    }

    let cart = await cartModel.findById(cartId);

    if (!cart) {
      return next(new ErrorHandler("CartId is invalid", 400));
    }
    console.log(productId);

    let index = await cart.cart.findIndex((c) => c.variantId == productId);
    //await cart.remove()
    // await cart.cart.splice(0)
    // await cart.save()
    // return
    // console.log(index)

    if (index != -1) {
      cart.totalPrice -= parseInt(cart.cart[index].qty) * parseInt(prod.price);
      cart.totalVariants -= parseInt(cart.cart[index].qty);
      if (cart.totalVariants <= 0) {
        cart.totalVariants = 0;
      }
      if (cart.totalPrice <= 0) {
        cart.totalPrice = 0;
      }

      cart.cart.splice(index, 1);
      console.log(cart);
    }

    if (qty > 0) {
      cart.totalPrice += paresInt(qty) * parseInt(prod.price);
      cart.totalVariants += qty;
      let v = { variantId: productId, qty };
      await cart.cart.push(v);
      console.log(v);
    }
    let newCart = await cart.save();
    res.status(200).send({ success: true, data: newCart });
  }),

  getOldCart: catchAsyncError(async (req, res, next) => {
    let { _id } = req.user;
    let cart;
    cart = await cartModel.findOne({ userId: _id }).populate("cart.variantId");
    if (!cart) {
      let data = await cartModel.create({ userId: _id });
      console.log(data);

      return res.status(200).send({ success: true, data: data });
    }

    return res.status(200).send({ success: true, data: cart });
  }),

  getCart: catchAsyncError(async (req, res, next) => {
    let { _id } = req.user;
    let cart;
    cart = await cartModel.aggregate([
      {
        $match: { userId: _id },
      },
      {
        $lookup: {
          from: "variants",
          localField: "variantId",
          foreignField: "_id",
          as: "variantId",
        },
      },
    { $unwind: "$variantId" },
    {
      $lookup: {
        from: "products",
        localField: "variantId.productId",
        foreignField: "_id",
        as: "variantId.productId",
        pipeline: [{$project: {adminId: 1}}]
      },
    },
    { $unwind: "$variantId.productId" },

    {
      $lookup: {
        from: "admins",
        localField: "variantId.productId.adminId",
        foreignField: "_id",
        as: "variantId.productId.adminId",
        pipeline: [{$project: {fullName: 1, businessName: 1, location: 1, avatar: 1}}]
      },
    },

    { $unwind: "$variantId.productId.adminId" },
   
      {
        $group: {
          _id: {admin: "$variantId.productId.adminId"},
          products: { $addToSet: {variant: '$variantId',qty: '$qty' }},
        },
      },
    ]);
    if (!cart) {
      

      return res.status(200).send({ success: true, data: [], message: "Cart Is Empty"});
    }

    return res.status(200).send({ success: true, data: cart });
  }),

  //-----------Add to cart-----------//

  addToCart : catchAsyncError(async(req, res, next)=> {
    let {_id} = req.user;
    let {qty, variantId} = req.query
    let variant = await variantModel.findById(variantId).populate('productId')
    let exists = await cartModel.findOne({variantId, userId: _id})
    if(!exists){
      let data = await cartModel.create({userId: _id, variantId, qty, admin: variant.productId.adminId})
      return res.status(200).send({success: true, data, message: "Item Added To Cart"})

    }
 
    
    if(qty>0){
      exists.qty = qty
      let data  = await exists.save();
      return res.status(200).send({success: true, data, message: "Item Updated To Cart"})

    }else{
      await cartModel.findOneAndDelete({variantId, userId: _id})
      return res.status(200).send({success: true,message: "Item Removed from cart"})
      
      
    }



   
  }),

  emptyCart: catchAsyncError(async (req, res, next) => {

    let { _id } = req.user;

    let cart = await cartModel.deleteMany({userId: _id});
   

    res.status(200).send({ success: true,  message: "cart is empty now" });
  }),
};

module.exports = cartCnt;
