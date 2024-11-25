
const express = require('express')
const orderCnt = require('../controllers/orderController')
const {
    isAuthenticated,
    isSuperAdmin,
    isAdminAuth,
  } = require("../middlewares/auth");
const router = express.Router();




router.route('/order/create-order')
.post(isAuthenticated, orderCnt.createOrder)

router.route('/order/cart-order')
.get(isAuthenticated, orderCnt.orderCartByAdmin)

// router.route('/order/cart/:cartId')
// .post(isAuthenticated, orderCnt.orderCart)

router.route('/order/cancelorder/:orderId')
.delete(isAuthenticated, orderCnt.cancelOrder)

router.route('/order/update-order/:orderId')
.put( isAdminAuth, orderCnt.updateOrder)


router.route('/super/order/:orderId')
.put( isSuperAdmin ,orderCnt.superUpdateOrder)
.delete(isSuperAdmin, orderCnt.superDeleteAOrder)


router.route('/order/get-orders')
.get( isAdminAuth, orderCnt.getAllOrdersByAdmin)

router.route('/order/:orderId')
.get(isAuthenticated, orderCnt.getOrderById)
.delete(isAuthenticated, orderCnt.deleteAOrder)


router.get("/super/orders/get-all", isSuperAdmin,orderCnt.getAllOrdersBySuperAdmin )

// router.route('/admin/order/all')
// .get(isAdminAuth, orderCnt.getOrderById)

router.route('/admin/order/orderId')
.delete(isAdminAuth, orderCnt.deleteAOrder)



module.exports = router





//router.post('/order/createorder', isAuthenticated, orderCnt.createOrder)

//router.post('/order/cart/:cartId', isAuthenticated, orderCnt.orderCart)

//router.get('/order/:id', isAuthenticated, orderCnt.getOrderById)

//router.post('/order/cancelorder/:orderId', isAuthenticated, orderCnt.cancelOrder)

//router.post('/order/updateorder/:orderId', isAdminAuth, orderCnt.updateOrder)

//router.delete('/order/deleteorder/:orderId', isAdminAuth, orderCnt.deleteAOrder)



module.exports = router