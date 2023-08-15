const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const Genre = require('../models/genre');

const mongoConnection = process.env.uri;

const collectionsRouter = express.Router();

// Create
collectionsRouter.post('/new', async (req, res) => {
  await mongoose.connect(mongoConnection);

  const newGenre = new Genre({ name: req.body.name });
  await newGenre.save();

  res.redirect('http://localhost:3000/');
});
// Read
// Update
// Delete

module.exports = collectionsRouter;