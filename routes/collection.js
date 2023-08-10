const express = require('express');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const mongoConnection = process.env.uri;

const client = new MongoClient(mongoConnection, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

const collectionsRouter = express.Router();

// Create
collectionsRouter.post('/new', async (req, res) => {
  const newCollectionName = req.body.name;

  await client.connect();
  await client.db('expressLibrary').createCollection(newCollectionName);

  res.redirect('http://localhost:3000/');
});
// Read
// Update
// Delete

module.exports = collectionsRouter;