const mongoose = require("mongoose");



const profileSchema = new mongoose.Schema({
    profile: {
        type: String,
    },
    title: {
        type: String,
    },
    type: {
        type: String,
    }
});
const userProfile = mongoose.model("profile", profileSchema)

module.exports = userProfile