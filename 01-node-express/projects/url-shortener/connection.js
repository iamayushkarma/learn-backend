const mongoose = require("mongoose");

async function connectToMongoDb(url) {
  console.log("Mongo db connected");
  return mongoose.connect(url);
}

module.exports = {
  connectToMongoDb,
};
