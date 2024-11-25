const categories = {
  fashion: {
    subCats: ["men", "women", "kids"],
  },

  groceries: {
    subCats: [
      "fruits-&-vegitables",
      "home-care",
      "personal-care",
      "dairy-&-bakery",
      "mom-&-baby-care",
    ],
  },
  beauty: {
    subCats: ["make-up", "hair", "skin-care"],
  },

  electronics: {
    subCats: ["mobiles", "fridge", "tv-&-speakers"],
  },
};

const productCategories = {
  "fress-fruits": {
    ref: "grocery",
    options: [
      {
        label: "",
        values: ["s", "m", "l", "xl"],
      },
    ],
  },
  "t-shirt": {
    ref: "men",
    options: [
      {
        label: "sizes",
        values: ["s", "m", "l", "xl"],
      },

      {
        label: "feet",
        values: ["full", "half"],
      },
    ],
  },

  pants: {
    ref: "men",
    options: [
      {
        label: "sizes",
        values: ["s", "m", "l", "xl"],
      },

      {
        label: "feet",
        values: ["full", "half"],
      },
    ],
  },

  jeans: {
    ref: "men",
    options: [
      {
        label: "sizes",
        values: ["s", "m", "l", "xl"],
      },

      {
        label: "feet",
        values: ["full", "half"],
      },
    ],
  },
  mobiles: {
    options: [
      {
        key: "network-type",
        label: "Network Type",
        values: ["2g", "3g", "4g", "5g"],
      },
      {
        key: "sim type",
        label: "Sim type",
        values: ["single", "dual"],
      },
    ],
  },

  "tv-&-speakers": {
    options: [
      {
        key: "voltages",
        label: "voltage",
        values: ["2g", "3g", "4g", "5g"],
      },
    ],
  },

  fridge: {
    options: [
      {
        key: "voltages",
        label: "voltage",
        values: ["2g", "3g", "4g", "5g"],
      },
    ],
  },

  lights: {
    options: [
      {
        key: "voltages",
        label: "voltage",
        values: ["2g", "3g", "4g", "5g"],
      },
    ],
    label: "Light",
  },

  //-----------------------//

  camera: {
    label: "Camera",
    options: [
      {
        key: "disk",
        label: "Disk capacity",
        values: ["16gb", "32gb", "64gb", "512gb"],
      },
      {
        key: "android",
        label: "Android support",
        values: ["yes", "no"],
      },
    ],
  },
};

const subCategories = {
  men: {
    ref: "fashion",
    image: "",
    prodCategories: {
      "t-shirt": { image: "", values: productCategories["t-shirt"] },
      pants: { image: "", values: productCategories.pants },
      jeans: { image: "", values: productCategories.jeans },
    },
  },

  "fruits-&-vegitables": {
    ref: "groceries",
    image: "",
    prodCategories: {
      "fress-fruits": { image: "", values: productCategories["t-shirt"] },
      vegitables: { image: "", values: productCategories.pants },
      "premium-fruits": { image: "", values: productCategories.jeans },
    },
  },

  men: {
    ref: "fashion",
    image: "",
    prodCategories: {
      "t-shirt": { image: "", values: productCategories["t-shirt"] },
      pants: { image: "", values: productCategories.pants },
      jeans: { image: "", values: productCategories.jeans },
    },
  },
};

/////---------------------------------------New one starts here ------------------------//

const categoryAll = {
  fashion: {
    men: {
      image: "",
      subCats: [
        "inner-wear",
        "night-wear",
        "winter-wear",
        "suits-&-blaser",
        "shoes",
        "swimwear",
        "accessories",
        "watches",
      ],
    },
    women: {
      image: "",
      subCats: [
        "inner-wear",
        "night-wear",
        "winter-wear",
        "suits-&-blaser",
        "shoes",
        "swimwear",
        "accessories",
        "watches",
      ],
    },
    kids: {
      image: "",
      subCats: [
        "inner-wear",
        "night-wear",
        "winter-wear",
        "suits-&-blaser",
        "shoes",
        "swimwear",
        "accessories",
        "watches",
      ],
    },
  },

  //-------------------------------------//

  electronics: {
    "mobile-&-tablets": {
      image: "",
      subCats: ["mobiles", "tablets"],
    },

    "tv-&-speakers": {
      image: "",
      subCats: ["speakers", "tv"],
    },
  },

  "construction-&-renovations": {
    "plumbing-&-sanitarywares": {
      image: "",
      subCats: [
        "pipes-&-fittings",
        "faucets-&-taps",
        "toilets-&-bidets",
        "showers-&-bathtubs",
      ],
    },
  },

  //--------------------------------//

  "home-&-kitchen": {
    "kitchen-wear": {
      image: "",
      subCats: ["speakers", "tv"],
    },
    "home-decore": {
      image: "",
      subCats: ["wall- papers", "painting"],
    },
    furniture: {
      image: "",
      subCats: ["table", "chair", "sofa", "bed"],
    },
  },

  //-------Grocery products-----//
  grocery: {
    "fruits-&-vagetables": {
      image: "",
      subCats: [],
    },
    books: {
      image: "",
      subCats: ["competetive", "motivational", "sceince", "story"],
    },
  },

  //---------------Beauty Products------------//

  beauty: {
    makeup: {
      image: "",
      subCats: ["makeup-tools", "lips", "nails", "eye"],
    },
    hair: {
      image: "",
      subCats: ["hair-color", "hair-styling"],
    },
    "beauty-tools": {
      image: "",
      subCats: ["brushes", "mirrors"],
    },
    fragrances: {
      image: "",
      subCats: ["perfumes", "cologness"],
    },
  },

  //-----------------------------------------//
  "sports-&-toys": {
    "toys-&-games": {
      image: "",
      subCats: ["action-&-toys-figure", "dolls-&-accessoies"],
    },
  },
  //-------------------------------//
  "travel-gears": {
    luggage: {
      image: "",
      subCats: ["suitcase", "carryons", "duffel-bags"],
    },
    backpacks: {},
  },
};

//-------------------   Global Filters  --------------------//
const categoryFilters = {
  "inner-wear": ["color", "size", "type"],
  "winter-wear": ["type", "size"],
  mobiles: ["internal-storage", "front-camera", "dimention-diagonal"],

  //-------//
  "action-&-toys-figure": [],
};

const homePageCategoryListOld = [
  { mainCategory: "electronics", image: "" },
  { mainCategory: "fashion", image: "" },
  { mainCategory: "grocery", image: "" },
  { mainCategory: "home-&-kitchen", image: "" },
  { mainCategory: "sports-&-toys", image: "" },
  { mainCategory: "beauty", image: "" },
  // {mainCategory: 'sports-&-toys', image: ""},
];

const homePageCategoryList = [
  {
    name: "Fashion",
    image: "https://rb.gy/gysz0u",
    link: "/category/fashion",
  },
  {
    name: "Grocery",
    image: "https://rb.gy/fsb1ws",
    link: "/category/grocery",
  },
  {
    name: "Electronics",
    image:
      "https://i.pinimg.com/564x/5a/bd/9e/5abd9e90488ab0a183fe42f144599c1f.jpg",
    link: "/category/electronics",
  },
  {
    name: "Bath & Fittings",
    image: "https://shorturl.at/eilFO",
    link: "/category/bath-&-fittings",
  },
  {
    name: "Sanitaryware",
    image: "https://shorturl.at/hzDY8",
    link: "/category/sanitaryware",
  },
  {
    name: "Tiles",
    image: "https://shorturl.at/qCOS3",
    link: "/category/tiles",
  },
  {
    name: "Lighting",
    image: "https://shorturl.at/koCH9",
    link: "/category/lighting",
  },
  {
    name: "Home & Kitchen",
    image: "https://rb.gy/r4kknd",
    link: "/category/home-&-kitchen",
  },
  {
    name: "Hardware & Tools",
    image: "https://rb.gy/lpiihf",
    link: "/category/hardware-&-tools",
  },
  {
    name: "Mobile",
    image: "https://rb.gy/y7gtqf",
    link: "/category/mobile",
  },
  {
    name: "Appliances",
    image:
      "https://bsmedia.business-standard.com/_media/bs/img/article/2021-04/23/full/1619199245-5793.jpg",
    link: "/category/appliances",
  },
  {
    name: "Beauty, Toys, & More",
    image:
      "https://m.media-amazon.com/images/I/71ML2TRKAUL.AC_UF1000,1000_QL80.jpg",
    link: "/category/beauty-toys-&-more",
  },
];

// const mainCategoryBanners = {
//   'electronics' : "",
//   fashion : "dddddd",
//   'grocery': "",
//   "home-&-kitchen" : "",
//   'sports-&-toys' : "",
//   'beauty' :""
// }

//--------------------Filter page Banners----------------//
const filterBanners = [
  {
    link: "#",
    banner: "https://i.ibb.co/nR6wsRT/Hero-Slider-Banner-1.webp",
    isVisible: true,
    name: "Banner 1",
  },
  {
    link: "#",
    banner: "https://i.ibb.co/Vtr4vLG/Hero-Slider-Banner-3.webp",
    isVisible: true,
    name: "Banner 3",
  },
  {
    link: "#",
    banner: "https://i.ibb.co/CwB6G8S/Hero-Slider-Banner-2.webp",
    isVisible: true,
    name: "Banner 2",
  },
];

//---------Brands Data-----------------------//

const brandsData = [
  {
    image:
      "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/kohler.jpg",
    url: "#",
  },
  {
    image:
      "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/kajaria.png",
    url: "#",
  },
  {
    image:
      "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/hettich.jpg",
    url: "#",
  },
  {
    image:
      "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/century-ply.png",
    url: "#",
  },
  {
    image:
      "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/philips.png",
    url: "#",
  },
  {
    image: "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/ipsa.png",
    url: "#",
  },
  {
    image:
      "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/simero.png",
    url: "#",
  },
  {
    image:
      "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/somany-tiles.webp",
    url: "#",
  },
  {
    image:
      "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/havells.png",
    url: "#",
  },
  {
    image:
      "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/hafele.png",
    url: "#",
  },
  {
    image:
      "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/merino.png",
    url: "#",
  },
  {
    image:
      "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/bhutan-tuff.jpg",
    url: "#",
  },
  {
    image:
      "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/hindware.png",
    url: "#",
  },
  {
    image:
      "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/anchor-by-panasonic.png",
    url: "#",
  },
  {
    image:
      "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/action-tesa.jpg",
    url: "#",
  },
  {
    image:
      "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/mercato.png",
    url: "#",
  },
  {
    image:
      "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/tamron.png",
    url: "#",
  },
  {
    image: "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/wipro.jpg",
    url: "#",
  },
  {
    image:
      "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/schneider-electric.png",
    url: "#",
  },
  {
    image: "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/elica.png",
    url: "#",
  },
  {
    image:
      "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/dorset.jpg",
    url: "#",
  },
  {
    image: "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/grohe.png",
    url: "#",
  },
  {
    image: "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/quba.jpg",
    url: "#",
  },
  {
    image:
      "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/greenlam.png",
    url: "#",
  },
  {
    image: "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/virgo.jpg",
    url: "#",
  },
  {
    image: "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/ebco.jpg",
    url: "#",
  },
  {
    image:
      "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/orient-bell.jpg",
    url: "#",
  },
  {
    image: "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/yale.png",
    url: "#",
  },
  {
    image:
      "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/godrej.png",
    url: "#",
  },
  {
    image: "https://nazdikwala-v3.s3.ap-south-1.amazonaws.com/brands/sirca.png",
    url: "#",
  },
];

//------------Home Page Banners------------------------//
const homeBanners = [
  {
    link: "#",
    banner: "https://i.ibb.co/nR6wsRT/Hero-Slider-Banner-1.webp",
    isVisible: true,
    name: "Banner 1",
  },
  {
    link: "#",
    banner: "https://i.ibb.co/Vtr4vLG/Hero-Slider-Banner-3.webp",
    isVisible: true,
    name: "Banner 3",
  },
  {
    link: "#",
    banner: "https://i.ibb.co/CwB6G8S/Hero-Slider-Banner-2.webp",
    isVisible: true,
    name: "Banner 2",
  },
];

//--------------------------------------------View all Brand data---------------------------------//

const viewAllbrands = [
  {
    category: "Electronics",
    brands: [
      {
        id: 1,
        name: "Brand 1",
        logo: "https://vtlogo.com/wp-content/uploads/2021/10/sirca-spa-vector-logo.png",
      },
      {
        id: 2,
        name: "Brand 2",
        logo: "https://vtlogo.com/wp-content/uploads/2021/10/sirca-spa-vector-logo.png",
      },
      {
        id: 3,
        name: "Brand 3",
        logo: "https://vtlogo.com/wp-content/uploads/2021/10/sirca-spa-vector-logo.png",
      },
      {
        id: 4,
        name: "Brand 4",
        logo: "https://vtlogo.com/wp-content/uploads/2021/10/sirca-spa-vector-logo.png",
      },
      { id: 5, name: "Brand 5", logo: "/images/brands/brand5.jpg" },
      { id: 6, name: "Brand 6", logo: "/images/brands/brand6.jpg" },
      { id: 7, name: "Brand 7", logo: "/images/brands/brand7.jpg" },
      { id: 8, name: "Brand 8", logo: "/images/brands/brand8.jpg" },
      { id: 9, name: "Brand 9", logo: "/images/brands/brand9.jpg" },
      { id: 10, name: "Brand 10", logo: "/images/brands/brand10.jpg" },
      { id: 11, name: "Brand 11", logo: "/images/brands/brand11.jpg" },
      { id: 12, name: "Brand 12", logo: "/images/brands/brand12.jpg" },
      { id: 13, name: "Brand 13", logo: "/images/brands/brand13.jpg" },
      { id: 14, name: "Brand 14", logo: "/images/brands/brand14.jpg" },
      { id: 15, name: "Brand 15", logo: "/images/brands/brand15.jpg" },
      { id: 16, name: "Brand 16", logo: "/images/brands/brand16.jpg" },
      { id: 17, name: "Brand 17", logo: "/images/brands/brand17.jpg" },
      { id: 18, name: "Brand 18", logo: "/images/brands/brand18.jpg" },
      { id: 19, name: "Brand 19", logo: "/images/brands/brand19.jpg" },
      { id: 20, name: "Brand 20", logo: "/images/brands/brand20.jpg" },
    ],
  },
  {
    category: "Clothing",
    brands: [
      { id: 21, name: "Brand 21", logo: "/images/brands/brand21.jpg" },
      { id: 22, name: "Brand 22", logo: "/images/brands/brand22.jpg" },
      { id: 23, name: "Brand 23", logo: "/images/brands/brand23.jpg" },
      { id: 24, name: "Brand 24", logo: "/images/brands/brand24.jpg" },
      { id: 25, name: "Brand 25", logo: "/images/brands/brand25.jpg" },
      { id: 26, name: "Brand 26", logo: "/images/brands/brand26.jpg" },
      { id: 27, name: "Brand 27", logo: "/images/brands/brand27.jpg" },
      { id: 28, name: "Brand 28", logo: "/images/brands/brand28.jpg" },
      { id: 29, name: "Brand 29", logo: "/images/brands/brand29.jpg" },
      { id: 30, name: "Brand 30", logo: "/images/brands/brand30.jpg" },
      { id: 31, name: "Brand 31", logo: "/images/brands/brand31.jpg" },
      { id: 32, name: "Brand 32", logo: "/images/brands/brand32.jpg" },
      { id: 33, name: "Brand 33", logo: "/images/brands/brand33.jpg" },
      { id: 34, name: "Brand 34", logo: "/images/brands/brand34.jpg" },
      { id: 35, name: "Brand 35", logo: "/images/brands/brand35.jpg" },
      { id: 36, name: "Brand 36", logo: "/images/brands/brand36.jpg" },
      { id: 37, name: "Brand 37", logo: "/images/brands/brand37.jpg" },
      { id: 38, name: "Brand 38", logo: "/images/brands/brand38.jpg" },
      { id: 39, name: "Brand 39", logo: "/images/brands/brand39.jpg" },
      { id: 40, name: "Brand 40", logo: "/images/brands/brand40.jpg" },
    ],
  },
  {
    category: "Shoes",
    brands: [
      { id: 41, name: "Brand 41", logo: "/images/brands/brand41.jpg" },
      { id: 42, name: "Brand 42", logo: "/images/brands/brand42.jpg" },
      { id: 43, name: "Brand 43", logo: "/images/brands/brand43.jpg" },
      { id: 44, name: "Brand 44", logo: "/images/brands/brand44.jpg" },
      { id: 45, name: "Brand 45", logo: "/images/brands/brand45.jpg" },
      { id: 46, name: "Brand 46", logo: "/images/brands/brand46.jpg" },
      { id: 47, name: "Brand 47", logo: "/images/brands/brand47.jpg" },
      { id: 48, name: "Brand 48", logo: "/images/brands/brand48.jpg" },
      { id: 49, name: "Brand 49", logo: "/images/brands/brand49.jpg" },
      { id: 50, name: "Brand 50", logo: "/images/brands/brand50.jpg" },
      { id: 51, name: "Brand 51", logo: "/images/brands/brand51.jpg" },
      { id: 52, name: "Brand 52", logo: "/images/brands/brand52.jpg" },
      { id: 53, name: "Brand 53", logo: "/images/brands/brand53.jpg" },
      { id: 54, name: "Brand 54", logo: "/images/brands/brand54.jpg" },
      { id: 55, name: "Brand 55", logo: "/images/brands/brand55.jpg" },
      { id: 56, name: "Brand 56", logo: "/images/brands/brand56.jpg" },
      { id: 57, name: "Brand 57", logo: "/images/brands/brand57.jpg" },
      { id: 58, name: "Brand 58", logo: "/images/brands/brand58.jpg" },
      { id: 59, name: "Brand 59", logo: "/images/brands/brand59.jpg" },
      { id: 60, name: "Brand 60", logo: "/images/brands/brand60.jpg" },
    ],
  },
];

//------------------------------------------------------------------------------------------------------------------------------//

const Distance = "100000";
const Latitude = "28.6862738";
const Longitude = "77.2217831";

module.exports = {
  brandsData,
  viewAllbrands,
  categoryAll,
  Distance,
  categoryFilters,
  homePageCategoryList,
  Latitude,
  Longitude,
  filterBanners,
  homeBanners,
};
