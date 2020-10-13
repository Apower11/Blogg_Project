const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    postedAtRough: {
       type: String,
       required: true
    },
    postedAtExact: {
        type: Number,
        required: true
    },
    userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true
    },
    author: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Post", postSchema);

