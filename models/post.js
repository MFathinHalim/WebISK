const { Schema, model } = require("mongoose");

const postSchema = new Schema({
    jenis: String,
    saran: String
})


module.exports = {
    mainModel: model("mains", postSchema)
}
