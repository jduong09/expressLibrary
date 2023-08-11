const express = require('express');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const collectionRouter = require('./routes/collection');

const app = express();
const port = 3000;
const mongoConnection = process.env.uri;

const client = new MongoClient(mongoConnection, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

app.set('view engine', 'pug');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Database Name: 'expressLibrary'
// Collection: 'Fiction'
// Collection: 'NonFiction'
// Collection: 'Autobiography'
// Create 
app.post('/book/new', async (req, res) => {
  await client.connect();
  const db = client.db('expressLibrary');

  try {
    if (req.body.collection) {
      await db.collection(req.body.collection).insertOne({ title: req.body.title, author: req.body.author, pages: req.body.pages });
    } else {
      await db.collection('Fiction').insertOne({ title: req.body.title, author: req.body.author, pages: req.body.pages });
    }
    // title (string)
    // author (string)
    // pages (integer)
    // collection (string)
    res.redirect('/');
  } catch(err) {
    console.log(err);
  } finally {
    client.close();
  }
});


// Read

// Query All Books
app.get('/', async (req, res) => {
  const collection = req.query.collection || 'Fiction';
  await client.connect();

  const db = await client.db('expressLibrary');

  // Getting all collection names
  const collectionNames = [];
  await db.listCollections().toArray().then(data => {
    data.forEach(collection => collectionNames.push(collection.name));
  });

  // Getting all books in specific collection
  const libraryCursor = db.collection(collection).find();

  const books = [];
  if (req.query.collection) {
    for await (const book of libraryCursor) {
      books.push({
        uuid: book._id.toString(),
        title: book.title,
        author: book.author,
        pages: book.pages,
      });
    }
  } else {
    // Getting all books in database
    const libraryCollections = db.listCollections();
    for await (const collectionCursor of libraryCollections) {
      const listCollectionCursor = db.collection(collectionCursor.name).find();
      for await (const book of listCollectionCursor) {
        books.push({
          uuid: book._id.toString(),
          title: book.title,
          author: book.author,
          pages: book.pages
        });
      }
    }
  }

  await client.close();
  await res.render('index', { title: 'Library', books: books, collections: collectionNames, currentCollection: req.query.collection || 'Books' });
});

// Get New Book Form
app.get('/book/new', async (req, res) => {
  await client.connect();

  const db = await client.db('expressLibrary');

  const collectionNames = [];
  await db.listCollections().toArray().then(data => {
    data.forEach(collection => collectionNames.push(collection.name));
  });

  await res.render('form', { title: 'New Book', formTitle: 'New Book', collections: collectionNames });
});

// Get book update Form
app.get('/books/:bookId/update', async (req, res) => {
  await client.connect();

  const db = await client.db('expressLibrary');
  const collectionNames = [];
  await db.listCollections().toArray().then(data => {
    data.forEach(collection => {
      collectionNames.push(collection.name);
    });

  });

  let bookResult;
  for (let i = 0; i < collectionNames.length; i++) {
    const result = await db.collection(collectionNames[i]).findOne({ _id: new ObjectId(req.params.bookId )});
    if (result) {
      bookResult = {
        id: result._id.toString(),
        title: result.title,
        author: result.author,
        pages: result.pages,
        collection: collectionNames[i]
      };
    }
  }

  res.render('form', { title: 'Update Book', formTitle: 'Update Book', book: bookResult, collections: collectionNames });
});

// Update
app.post('/books/:bookId/update', async (req, res) => {
  const bookData = {
    $set: {
      title: req.body.title,
      author: req.body.author,
      pages: req.body.pages,
    }
  };

  await client.connect();
  const db = await client.db('expressLibrary');
  await db.collection(req.body.collection).updateOne({ _id: new ObjectId(req.params.bookId) }, bookData);

  res.redirect('/');
});
// Delete
app.delete('/books/:bookId', async (req, res) => {
  await client.connect();
  const db = await client.db('expressLibrary');
  await db.deleteOne({ _id: new ObjectId(req.params.bookId) });

  res.json({ message: 'success' });
});

app.use('/collections', collectionRouter);

// Listen Port
app.listen(port, () => {
  console.log(`Library App Listening on port ${port}`);
});