const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const Author = require('./models/author');
const Genre = require('./models/genre');
const Book = require('./models/book');


const collectionRouter = require('./routes/collection');

const app = express();
const port = 3000;
const mongoConnection = process.env.uri;

app.set('view engine', 'pug');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Database Name: 'expressLibrary'
// Collection: 'Fiction'
// Collection: 'NonFiction'
// Collection: 'Autobiography'
// Create 
app.post('/book/new', async (req, res) => {
  await mongoose.connect(mongoConnection);
  try {
    // Find Author instance in database first
    let author, genre;
    if (!Author.find({ fullname: req.body.author }).query) {
      const newAuthor = new Author({
        first_name: req.body.author.split(" ")[0],
        family_name: req.body.author.split(" ")[1]
      });
      author = await newAuthor.save();
    }
    // Find Genre instance in database first
    if (!Genre.find({ name: req.body.genre }).query) {
      const newGenre = new Genre({
        name: req.body.newGenre
      });
      genre = await newGenre.save();
    }

    console.log(req.body);
    const newBook = new Book({
      title: req.body.title,
      author: author._id,
      summary: req.body.summary,
      isbn: req.body.isbn,
      pages: req.body.pages,
      genre: [genre._id]
    });
    await newBook.save();
    // await db.collection('Book').insertOne({ title: req.body.title, author: req.body.author, pages: req.body.pages });
    // title (string)
    // author (string)
    // pages (integer)
    // collection (string)
    res.redirect('/');
  } catch(err) {
    console.log(err);
  } finally {
    // client.close();
  }
});

// Read

// Query All Books
app.get('/', async (req, res) => {
  await mongoose.connect(mongoConnection);
  // Aside will show all genres.
  const allGenres = await Genre.find({});

  const namesOfGenres = allGenres.map((genre) => {
    return genre.name;
  })
  const allBooks = await Book.find({});
  
  const arrayBooks = await Promise.all(allBooks.map(async (book) => {
    const author = await Author.findById(book.author).then((data) => {
      return `${data.first_name} ${data.family_name}`;
    });
    return {
      uuid: book._id.toString(),
      title: book.title,
      author: author,
      pages: book.pages,
    }
  }));
  /*
  // Getting all books in specific collection

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
  */

  // await client.close();
  await res.render('index', { title: 'Library', books: arrayBooks, genres: namesOfGenres, currentCollection: req.query.collection || 'Books' });
});


// Get New Book Form
app.get('/book/new', async (req, res) => {
  /*
  await db.listCollections().toArray().then(data => {
    data.forEach(collection => collectionNames.push(collection.name));
  });
  */

  await res.render('form', { title: 'New Book', formTitle: 'New Book', genres: [] });
});

/*

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

  console.log(bookData);

  try {
    await client.connect();
    const db = await client.db('expressLibrary');
    const result = await db.collection(req.body.collection).updateOne({ _id: new ObjectId(req.params.bookId) }, bookData);
    console.log(result);
  } catch(e) {
    console.log(e);
  }

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

*/
// Listen Port
app.listen(port, () => {
  console.log(`Library App Listening on port ${port}`);
});