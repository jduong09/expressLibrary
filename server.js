const express = require('express');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
    await db.collection('books').insertOne({ title: req.body.title, author: req.body.author, pages: req.body.pages });

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
  await client.connect();

  const db = await client.db('expressLibrary');
  const libraryCursor = db.collection('books').find();

  const books = [];

  for await (const book of libraryCursor) {
    books.push({
      uuid: book._id.toString(),
      title: book.title,
      author: book.author,
      pages: book.pages
    });
  }

  await client.close();
  await res.render('index', { title: 'Index', books: books });
});

// Get New Book Form
app.get('/book/new', async (req, res) => {
  await res.render('form', { title: 'New Book', formTitle: 'New Book' });
});

// Get book update Form
app.get('/books/:bookId/update', async (req, res) => {
  await client.connect();
  const db = await client.db('expressLibrary');
  const book = await db.collection('books').findOne({ _id: new ObjectId(req.params.bookId) });

  const bookData = {
    id: req.params.bookId,
    title: book.title,
    author: book.author,
    pages: book.pages
  };

  res.render('form', { title: 'Update Book', formTitle: 'Update Book', book: bookData });
});

// Update
app.post('/books/:bookId/update', async (req, res) => {
  const bookData = {
    $set: {
      title: req.body.title,
      author: req.body.author,
      pages: req.body.pages
    }
  };

  await client.connect();
  const db = await client.db('expressLibrary');
  await db.collection('books').updateOne({ _id: new ObjectId(req.params.bookId) }, bookData);

  res.redirect('/');
});
// Delete
app.delete('/books/:bookId', async (req, res) => {
  await client.connect();
  const db = await client.db('expressLibrary');
  await db.collection('books').deleteOne({ _id: new ObjectId(req.params.bookId) });

  res.json({ message: 'success' });
});

// Listen Port
app.listen(port, () => {
  console.log(`Library App Listening on port ${port}`);
});