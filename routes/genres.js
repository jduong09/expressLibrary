const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const Genre = require('../models/genre');

const mongoConnection = process.env.uri;

const genresRouter = express.Router();

// Create
genresRouter.post('/new', async (req, res) => {
  await mongoose.connect(mongoConnection);

  const newGenre = new Genre({ name: req.body.name });
  await newGenre.save();

  res.redirect('http://localhost:3000/');
});
// Update
// Delete

module.exports = genresRouter;