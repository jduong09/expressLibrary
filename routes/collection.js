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
// Read all Books from collections
collectionsRouter.get('/:collectionName', async (req, res) => {
  const collectionName = req.params.collectionName;

  await client.connect();

  const db = await client.db('expressLibrary');

  const collectionNames = [];
  await db.listCollections().toArray().then(data => {
    data.forEach(collection => collectionNames.push(collection.name));
  });

  const booksCursor = await db.collection(collectionName).find();
  const responseBooks = [];

  for await (const book of booksCursor) {
    responseBooks.push({
      uuid: book._id.toString(),
      title: book.title,
      author: book.author,
      pages: book.pages
    });
  }

  console.log(responseBooks);

  res.render('index', { title: 'Index', books: responseBooks, collections: collectionNames, currentCollection: collectionName});
});

// Update
// Delete

module.exports = collectionsRouter;