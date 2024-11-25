
const express = require('express');
const catchAsyncError = require('../middlewares/catchAsyncError');
const { isAdminAuth } = require('../middlewares/auth');
const { getTotalSales, getTotalCustomers, getTotalProd, getTotalOrders, lastFourMonthOrders, lastMonthSales, lastMonthOrdersByDay, topTenSellers, lastFourMonthSells, lastMonthTotalSales, lastOneMonthOrders, lastMonthSellsByDay, topTenProducts, getStatics } = require('../controllers/dashAdminCnt');
const router = express.Router();


router.get('/dashboard/total-customers', isAdminAuth,  getTotalCustomers)

router.get('/dashboard/total-products', isAdminAuth,  getTotalProd)

router.get('/dashboard/total-orders', isAdminAuth,  getTotalOrders)

router.get('/dashboard/total-sales', isAdminAuth,  getTotalSales)

//get 5 statics
router.get('/dashboard/statics', isAdminAuth, getStatics)

//---Last one month orders by date-----//
router.get('/dashboard/orders/last-month', isAdminAuth,  lastOneMonthOrders)

router.get('/dashboard/sales/last-month', isAdminAuth,  lastMonthSellsByDay)

router.get('/dashboard/sales/last-four', isAdminAuth,  lastFourMonthSells)

router.get('/dashboard/orders/last-four', isAdminAuth,  lastFourMonthOrders)

router.get('/dashboard/top-sellers', topTenSellers)

router.get('/dashboard/products/top-ten', topTenProducts)

module.exports = router
