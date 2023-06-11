const { Schema, model } = require("mongoose");

const saranSchema = new Schema({
  jenis: String,
  saran: String,
});

module.exports = {
  saranModel: model("saran", saranSchema),
};
