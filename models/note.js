var mongoose = require("mongoose");

var noteSchema = new mongoose.Schema({
    text: String,
    checklists: Array,
    checkboxes: Array,
    // isChecked: {
    //     type: Boolean,
    //     default: false
    // },
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});

module.exports = mongoose.model("Note", noteSchema);
