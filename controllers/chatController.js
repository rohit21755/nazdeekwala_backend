const catchAsyncError = require("../middlewares/catchAsyncError")
const chatModel = require("../models/chatModel")
const messageModel = require("../models/messagesModel")
const ErrorHandler = require("../utils/errorHandler");
const mongoose = require('mongoose')


exports.createChat = async(details)=>{
    try {
        let {user, admin, orderId, message} = details
        let data;
          data = await chatModel.findOne({user, admin})
          if(!data){
            data = await chatModel.create({user, admin, lastMessage: message})
          }
        let msg = await messageModel.create({chatId: data._id, from: 'user', message, orderId })
        return {chat:data, message: msg}
    }
    catch(err){
    }
}
exports.sendMessage = async(details)=>{
    try {
        let {message, chatId, _id} = details
        let data = await chatModel.findByIdAndUpdate(chatId, {lastMessage: message}) //.lean()
        let from 
        let qr={};
        if(!data){
          console.log(data)
          return 
        }
        if(data.user==_id.toString()){
            from = 'user'
             data["unSeenCountAdmin"] =  data.unSeenCountAdmin + 1
        }else if(data.admin==_id.toString()){
            from = 'admin'
            data["unSeenCountAdmin"] =  data.unSeenCountUser + 1
        }else{
            throw "Unable to Send Message"
        }
        //data = {...data, ...qr}
        
         data.lastMessageFrom = from
         await data.save()
        let msg = await messageModel.create({chatId: data._id, from, message})
        return { message: msg}
    }
    catch(err){
        console.log(err)
        return {error: err.message}
    }
}

exports.getChatsUser = catchAsyncError(async(req, res)=> {
    let {_id} = req.user
    let chats = await chatModel.find({user: _id}).populate('user').populate('admin')
    // chats.unSeenCount = 0;
    // await chats.save();
    return res.status(200).send({success: true, data: chats})

})

exports.getMessagesUser = catchAsyncError(async (req, res, next) => {
    let { chatId } = req.params;
    let chat = await chatModel.findById(chatId).populate([
      { path: "user", select: "fullName avatar" },
      { path: "admin", select: "fullName avatar" },
    ]);
    if(chat.lastMessageFrom != "user"){
      chat.unSeenCountUser = 0;
      await chat.save()
      await messageModel.updateMany({chatId: chat._id,from: "admin", seen: false}, {seen: true});

    }
   

    if(chat.user._id.toString() != req.user._id.toString()){
        return next(new ErrorHandler("Not valid For this chat", 400))
    }
    let messages = await messageModel.aggregate([
      { $match: { chatId: new mongoose.Types.ObjectId(chatId) } },
      {
        $lookup: {
          from: "orders",
          foreignField: "_id",
          localField: "orderId",
          as: "orderId",
          // pipeline: [{ $project: { variantId: 1 } }],
          pipeline: [
            {
              $lookup: {
                from: "variants",
                foreignField: "_id",
                localField: "variantId",
                as: "variantId",
                // pipeline: [{ $project: { name: 1, images: 1 } }],
              },
            },
            {
              $unwind: "$variantId",
            },
          ],
        },
      },
      // { $unwind: "$orderId" },
      // {
      //   $lookup: {
      //     from: "variants",
      //     foreignField: "_id",
      //     localField: "orderId.variantId",
      //     as: "orderId.variantId",
      //     // pipeline: [{ $project: { name: 1, images: 1 } }],
      //   },
      // },
      // { $unwind: "$orderId" },
    ]);
   
    return res.status(200).send({ success: true, data: { chat, messages } });
  });


  exports.getMessagesAdmin = catchAsyncError(async (req, res, next) => {
    let { chatId } = req.params;
    let chat = await chatModel.findById(chatId).populate([
      { path: "user", select: "fullName avatar" },
      { path: "admin", select: "fullName avatar" },
    ]);
    if(chat.lastMessageFrom != "vendor"){
      chat.unSeenCountAdmin = 0;
      await chat.save();
      await messageModel.updateMany({chatId: chat._id, from: "user", seen: false}, {seen: true});
    }
    // console.log(chat)
    // console.log(chat.admin._id)
    // console.log(req.admin._id)
    if(chat.admin._id.toString() != req.admin._id.toString()){
        return next(new ErrorHandler("Not valid For this chat", 400))
    }
    let messages = await messageModel.aggregate([
      { $match: { chatId: new mongoose.Types.ObjectId(chatId) } },
      {
        $lookup: {
          from: "orders",
          foreignField: "_id",
          localField: "orderId",
          as: "orderId",
          // pipeline: [{ $project: { variantId: 1 } }],
          pipeline: [
            {
              $lookup: {
                from: "variants",
                foreignField: "_id",
                localField: "variantId",
                as: "variantId",
                // pipeline: [{ $project: { name: 1, images: 1 } }],
              },
            },
            {
              $unwind: "$variantId",
            },
            {
              $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "userId",
                as: "userId",
                 pipeline: [{ $project: { fullNname: 1, mobileNumber: 1, avatar:1, address:1 } }],
              },
            },
            {
              $unwind: "$userId",
            },
           
           
          ],
        },
      },
      // {
      //   $lookup: {
      //     from: "users",
      //     foreignField: "_id",
      //     localField: "orderId.userId",
      //     as: "orderId.userId",
      //     pipeline: [
      //       {
      //         $project: {
      //           mobileNumer: 1,
      //           address: 1, 
      //           fullName: 1,
      //         },
      //       },
      //       {
      //         $unwind: "$userId",
      //       },
      //     ],
      //   },
      // },
       //{ $unwind: "$orderId" },
      // {
      //   $lookup: {
      //     from: "variants",
      //     foreignField: "_id",
      //     localField: "orderId.variantId",
      //     as: "orderId.variantId",
      //     // pipeline: [{ $project: { name: 1, images: 1 } }],
      //   },
      // },
      // { $unwind: "$orderId" },
    ]);

   
    return res.status(200).send({ success: true, data: { chat, messages } });
  });




exports.getChatsAdmin = catchAsyncError(async(req, res)=> {
    let {_id} = req.admin
    let chats = await chatModel.find({admin: _id}).populate('user').populate('admin')
    return res.status(200).send({success: true, data: chats})
    
})


