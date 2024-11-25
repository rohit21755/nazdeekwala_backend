const { isAuthenticated } = require('../middlewares/auth');
const cartModel = require('../models/cartModel')
const cartCnt = require('../controllers/cartController')
const router = require('express').Router();

//router.get('/cart/getcart', isAuthenticated, cartCnt.getCart)
//router.post('/cart/update/:cartId', isAuthenticated, cartCnt.updateCart)
//--------let{productId, qty} = req.body -----////

router.route('/cart/getcart')
.get(isAuthenticated, cartCnt.getCart)

router.route('/cart/add')
.post( isAuthenticated, cartCnt.addToCart)
.delete(isAuthenticated, cartCnt.emptyCart)



module.exports = router