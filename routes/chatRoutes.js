const express = require('express')
const { isAuthenticated, isAdminAuth } = require('../middlewares/auth')
const { getChatsAdmin, getChatsUser, getMessagesUser, getMessagesAdmin } = require('../controllers/chatController')

const router = express.Router()

//------------Admin Get Chats-----------//
router.get('/admin/get-chats', isAdminAuth, getChatsAdmin)
router.get('/admin/get-messages/:chatId',isAdminAuth, getMessagesAdmin)

//------------User Get Chats-------------//
router.get('/chat/get-chats', isAuthenticated, getChatsUser)
router.get('/get-messages/:chatId', isAuthenticated, getMessagesUser)   //same for user and admin



module.exports = router