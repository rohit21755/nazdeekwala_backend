const catchAsyncError = require("../middlewares/catchAsyncError");
const demoModel = require("../models/demoModel");
const demoVariant = require("../models/demoVariant");

const product = {
  _id: 1,
  name: "iphone 13",
  brand: "iphone",
  filtersOptions: ["color", "size", "storage"],
  variantFilters: {
    color: {
      component: 0,
      values: ["black", "white", "purple", "red"],
    },
    size: {
      component: 0,
      values: ["s", "m", "l"],
    },
    storage: {
      component: 0,
      values: ["64gb", "128gb", "512gb"],
    },
  },
};

const variants = [
  {
    productId: 1,
    name: "iphone 13 64gb black s size",
    slug: "iphone_13_64gb_black_s_size",
    filterValues: {
      color: "black",
      size: "s",
      storage: "64gb",
    },
  },
  {
    productId: 1,
    name: "iphone 13 128gb red m size",
    slug: "iphone_13_128gb_red_m_size",
    filterValues: {
      color: "red",
      size: "m",
      storage: "128gb",
    },
  },
  {
    productId: 1,
    name: "iphone 13 64gb white s size",
    slug: "iphone_13_64gb_white_s_size",
    filterValues: {
      color: "white",
      size: "s",
      storage: "64gb",
    },
  },
  {
    productId: 1,
    name: "iphone 13 512gb black l size",
    slug: "iphone_13_512gb_black_l_size",
    filterValues: {
      color: "black",
      size: "l",
      storage: "512gb",
    },
  },
];

exports.getVariant = catchAsyncError(async (req, res) => {
  let { slug } = req.params;
  let { pid } = req.query;

  let variant = {
    productId: 1,
    name: "iphone 13 512gb black l size",
    slug: "iphone_13_512gb_black_l_size",
    filterValues: {
      color: "black",
      size: "l",
      storage: "512gb",
    },
  };
  let filters = product.filtersOptions;
  let colors = [
    { color: "black", slug: "" },
    { color: "red", slug: "" },
  ];

  let sizes = [
    { size: "s", slug: "" },
    { size: "m", slug: "" },
    { size: "l", slug: "" },
  ];
  let storage = [
    { storage: "64gb", size: "l", color: "black", slug: "" },
    { storage: "128gb", color: "black", size: "l", slug: "" },
    { color: "black", size: "l", storage: "512gb", slug: "" },
  ];
});

exports.createProduct = catchAsyncError(async (req, res, next) => {
  let data = await demoModel.create({ ...req.body });
  res.send({ data });
});

exports.createVariant = catchAsyncError(async (req, res, next) => {
  let data = await demoVariant.create({ ...req.body });
  res.send({ data });
});

exports.getVariant = catchAsyncError(async (req, res, next) => {
  let { variantId } = req.params;

  let data = await demoVariant.findById(variantId);
  let product = await demoModel.findById(data.productId);

  let result = {};
  let filters = product.filterOptions.color.values;
  //console.log(filters)
  let x = filters[0];

  //----------------------//

  let filterValues = product.filterKeys;
  let query = {};
  console.log(filterValues);
  let final = {};

  for (const i of filterValues) {
    let values = product.filterOptions[i];
    //console.log(values)
    let datas = {};

    //-----
    //console.log(query)
    async function z() {
      for (const mp of values) {
        let key = mp.value;
        let qr = `options.${i}`;
        let nquery = { ...query };
        //console.log(qr)
        nquery[qr] = key;
        console.log(nquery);
        let filterData = await demoVariant.findOne(nquery);
        console.log(filterData);
        datas[key] = filterData;
        //console.log(x)
      }
    }

    //  values.map(async(mp)=> {
    //   let key = mp.value
    //   let qr = `options.${i}`;
    //   let nquery = {...query}
    //   //console.log(qr)
    //   nquery[qr] = key
    //   console.log(nquery)
    //   let filterData =  await demoVariant.findOne(nquery);
    //   console.log(filterData)
    //   datas[key] = filterData
    //   //console.log(x)

    // })
    await z();

    console.log(i);

    // if(x==0){
    //   query =  {};
    // }

    let nqr = `options.${i}`;
    query[nqr] = data.options[i];
    console.log(query);
    //console.log(datas)
    final[i] = datas;
  }

  //--------------------//

  //let allVariant = await demoVariant.find({productId: data.productId}).distinct(`options.color`)

  //  await Promise.all(filters.map(async(mp)=> {
  //   console.log(mp)
  //   let color = await demoVariant.findOne({'options.color': mp})
  //   console.log(color)
  //   result[mp] = color
  //  }))

  //  let ram = {}
  //  let ramfilter = product.filterOptions.ram.values
  //  await Promise.all(ramfilter.map(async(mp)=> {
  //   console.log(mp)
  //   let color = await demoVariant.findOne({'options.color': data.options.color, 'options.ram': mp })
  //   console.log(color)
  //   ram[mp] = color
  //  }))

  res.send({ variant: data, final, product });
});
