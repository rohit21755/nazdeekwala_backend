
const express = require('express')
const { createProduct, createVariant, getVariant } = require('../controllers/demo')
const router = express.Router()


router.post('/product/demo', createProduct)

router.post('/variant/demo', createVariant)

router.get('/variant/demo/:variantId', getVariant)


module.exports = router