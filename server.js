const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const Author = require('./models/author');
const Genre = require('./models/genre');
const Book = require('./models/book');


const genresRouter = require('./routes/genres');

const app = express();
const port = 3000;
const mongoConnection = process.env.uri;

app.set('view engine', 'pug');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Database Name: 'expressLibrary'
// Create 
app.post('/book/new', async (req, res) => {
  await mongoose.connect(mongoConnection);
  console.log(req.body);
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
    genre = await Genre.findOne({ name: req.body.genre })
      .then((data) => {
        if (!data) {
          const newGenre = new Genre({
            name: req.body.newGenre
          });
          return newGenre.save();
        } else {
          return data;
        }
      });
    
    const newBook = new Book({
      title: req.body.title,
      author: author._id,
      summary: req.body.summary,
      isbn: req.body.isbn,
      pages: req.body.pages,
      genre: [genre._id]
    });
    await newBook.save();
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
  const namesOfGenres = allGenres.map(genre => genre.name);

  // Getting all books in specific collection
  let arrayBooks;

  if (req.query.genre) {
    const genre = await Genre.findOne({ name: req.query.genre });
    const allBooksByGenre = await Book.find({ genre: [genre._id] })
    arrayBooks = await Promise.all(allBooksByGenre.map(async (book) => {
      const author = await Author.findById(book.author)
        .then((data) => {
          return `${data.first_name} ${data.family_name}`;
        });
      return {
        uuid: book._id.toString(),
        title: book.title,
        author,
        pages: book.pages
      }
    }));
  } else {
    const allBooks = await Book.find({});
    arrayBooks = await Promise.all(allBooks.map(async (book) => {
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
  }
  res.render('index', { title: 'Library', books: arrayBooks, genres: namesOfGenres, currentGenre: req.query.genre || 'Books' });
});


// Get New Book Form
app.get('/book/new', async (req, res) => {
  await mongoose.connect(mongoConnection);
  const genres = await Genre.find({}).then((data) => {
    return data.map(genre => {
      return genre.name;
    });
  });

  res.render('form', { title: 'New Book', formTitle: 'New Book', genres });
});

// Get book update Form
app.get('/books/:bookId/update', async (req, res) => {
  await mongoose.connect(mongoConnection);
  
  const genres = await Genre.find({}).then((data) => {
    return data.map(genre => {
      return genre.name;
    });
  });

  const bookToUpdate = await Book.findOne({ _id: req.params.bookId }).then(async (data) => {
    const author = await Author.findById(data.author).then((response) => {
      return `${response.first_name} ${response.family_name}`;
    });
    const genre = await Genre.findById(data.genre[0]).then((response) => response.name);

    return {
      id: data._id.toString(),
      title: data.title,
      author,
      summary: data.summary,
      isbn: data.isbn,
      pages: data.pages,
      genre: [genre]
    };
  });
  res.render('form', { title: 'Update Book', formTitle: 'Update Book', book: bookToUpdate, genres });
});

// Update
app.post('/books/:bookId/update', async (req, res) => {
  await mongoose.connect(mongoConnection);

  const author = await Author.findOne({
    first_name: req.body.author.split(" ")[0],
    family_name: req.body.author.split(" ")[1]
  });

  const listOfGenres = await Genre.find({});
  const updatedGenresList = [];

  listOfGenres.map((itemGenre) => {
    if (req.body[itemGenre.name]) {
      updatedGenresList.push(itemGenre._id.toString());
    }
  });

  if (req.body.newGenre) {
    updatedGenresList.push(req.body.newGenre);
  }

  if (req.body.genre) {
    updatedGenresList.push(req.body.genre);
  }

  const bookData = {
    title: req.body.title,
    author: author._id.toString(),
    pages: req.body.pages,
    isbn: req.body.isbn,
    genre: updatedGenresList,
    summary: req.body.summary,
  };

  await Book.findOneAndUpdate({ _id: req.params.bookId }, bookData);
  res.redirect('/');
});

// Current: Deleting one book causes the book to be deleted, but if the author doesn't have a book, shouldnt the author be deleted as well. (yes)
// Current: Deleting one book causes the book to be deleted, but if the genre only has one book, shouldnt the genre be deleted as well. (no)
// Delete
app.delete('/books/:bookId', async (req, res) => {
  await mongoose.connect(mongoConnection);

  const bookToDelete = await Book.findById(req.params.bookId);
  /* 
  {
    _id: new ObjectId("64db91ece385753a1682a0df"),
    title: 'And Then There Were None',
    author: new ObjectId("64db91ece385753a1682a0db"),
    summary: 'This is updated summary.',
    isbn: 'B000FC0109',
    pages: 240,
    genre: [ new ObjectId("64db91ece385753a1682a0dd") ],
    __v: 0
  }
  */
  const author = await Author.findById(bookToDelete.author);
  const booksOfAuthor = await Book.where({ author: author._id }).countDocuments();

  // If there are more books of the author in the library, then do not delete author from database
  if (booksOfAuthor > 1) {
    await Book.deleteOne({ _id: req.params.bookId });
  } else {
    await Book.deleteOne({ _id: req.params.bookId });
    await Author.deleteOne({ _id: author._id });
  }

  res.json({ message: 'success' });
});

app.use('/genres', genresRouter);

// Listen Port
app.listen(port, () => {
  console.log(`Library App Listening on port ${port}`);
});