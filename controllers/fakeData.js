const { faker } = require('@faker-js/faker');
const fs = require('fs');
const variantModel = require('../models/variantModel.js')
// Function to generate fake product data
function generateFakeProduct() {
  const product = {
    slug: faker.lorem.slug(),
    productId: "657b15e7f5c1fbaf88cc64ee",
    name: faker.commerce.productName(),
    price: faker.number.int({ min: 500, max: 5000, precision: 100 }),
    discountPercentage: faker.number.int({ min: 5, max: 20 }),
    discountPrice: 0,
    "globalFilterOptions" : {
      "color": faker.helpers.arrayElement(['red', 'pink', 'black', 'white']),
      "size": faker.helpers.arrayElement(['s', 'm', 'l', 'xl']),
      "type":faker.helpers.arrayElement(['regular', 'fit', 'classic', 'extra']),
},
   
    adminid: "648a9b8269a39ac8436e1715",
    description: faker.lorem.sentence(),
    stock: faker.number.int({ min: 1, max: 100 }),
    // globalFilterOptions: {
    //   'front-camera': `${faker.number.int(10)}mp`,
    //   'internal-storage': `${faker.number.int(128)}gb`,
    //   'dimention-diagonal': `${faker.number.int(20)}cm`,
    // },
    options: {
      color: faker.color.human(),
      size: faker.helpers.arrayElement(['S', 'M', 'L', 'XL']),
      type: faker.helpers.arrayElement(['basic', 'pro', 'premium']),
    },
  };

  // Calculate discountPrice based on discountPercentage
  product.discountPrice = Math.round(product.price - (product.price * product.discountPercentage) / 100);

  return product;
}

// Function to generate an array of fake products
function generateFakeData(count) {
  const fakeData = [];
  for (let i = 0; i < count; i++) {
    fakeData.push(generateFakeProduct());
  }
  return fakeData;
}

// Generate 1000 fake products
exports.fakeProducts = async()=>{
  let data =  await generateFakeData(10000);
  console.log("fake2")
  await variantModel.insertMany(data)

}





