const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "google",
  apiKey: process.env.GOOGLE_MAP_API_KEY,
  formatter: null,
};
const geocoder = NodeGeocoder(options);
console.log(process.env.GOOGLE_MAP_API_KEY);

// const getLocationByAdd = async (address) => {
//   try {
//     const result = await geocoder.geocode(address);
//     console.log(result);
//     return [result[0].latitude, result[0].longitude];
//   } catch (error) {
//     console.log(error);
//     return [0, 0];
//   }
// };

exports.getAddByLocation = async (lat, lng) => {
  try {
    const result = await geocoder.reverse({ lat, lon: lng });

    console.log("location 2323  ", result);

    if (result && result.length > 0) {
      const address = result[0];
      console.log("Address:", address);
      return address;
    } else {
      console.error("No address found for the given coordinates.");
      return null;
    }
  } catch (error) {
    console.error("Error during geocoding:", error);
    return null;
  }
};
