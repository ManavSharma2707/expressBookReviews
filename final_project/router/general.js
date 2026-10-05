const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// Wraps the book data in a Promise so the route handlers can use async/await
const fetchBooks = () => new Promise((resolve) => resolve(books));

// Sends an object as pretty-printed JSON
const sendPretty = (res, status, data) =>
    res.status(status).type('application/json').send(JSON.stringify(data, null, 4));

// Task 7: Register a new user
public_users.post("/register", (req,res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({message: "Username and password are required"});
    }
    if (!isValid(username)) {
        return res.status(409).json({message: "User already exists"});
    }

    users.push({ username, password });
    return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// Task 1 (server side): Get the book list available in the shop
public_users.get('/', async function (req, res) {
    const allBooks = await fetchBooks();
    return sendPretty(res, 200, allBooks);
});

// Task 2 (server side): Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const allBooks = await fetchBooks();
    const book = allBooks[req.params.isbn];
    if (!book) {
        return sendPretty(res, 404, {message: "No book found with ISBN " + req.params.isbn});
    }
    return sendPretty(res, 200, book);
 });

// Task 3 (server side): Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const allBooks = await fetchBooks();
    const author = req.params.author.trim().toLowerCase();
    const matches = Object.keys(allBooks)
        .filter((isbn) => allBooks[isbn].author.toLowerCase() === author)
        .map((isbn) => ({ isbn, ...allBooks[isbn] }));
    if (matches.length === 0) {
        return sendPretty(res, 404, {message: "No books found for author " + req.params.author});
    }
    return sendPretty(res, 200, {booksbyauthor: matches});
});

// Task 4 (server side): Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const allBooks = await fetchBooks();
    const title = req.params.title.trim().toLowerCase();
    const matches = Object.keys(allBooks)
        .filter((isbn) => allBooks[isbn].title.toLowerCase() === title)
        .map((isbn) => ({ isbn, ...allBooks[isbn] }));
    if (matches.length === 0) {
        return sendPretty(res, 404, {message: "No books found with title " + req.params.title});
    }
    return sendPretty(res, 200, {booksbytitle: matches});
});

//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
    const allBooks = await fetchBooks();
    const book = allBooks[req.params.isbn];
    if (!book) {
        return sendPretty(res, 404, {message: "No book found with ISBN " + req.params.isbn});
    }
    if (Object.keys(book.reviews).length === 0) {
        return sendPretty(res, 200, {
            message: "No reviews found for this book.",
            isbn: req.params.isbn,
            title: book.title,
            reviews: book.reviews
        });
    }
    return sendPretty(res, 200, {isbn: req.params.isbn, title: book.title, reviews: book.reviews});
});


// ---------------------------------------------------------------------------
// Task 11: Axios client functions that call this server's own endpoints.
// They need the server to be running (node index.js). Run them with:
//   RUN_AXIOS_DEMO=1 node index.js
// ---------------------------------------------------------------------------

// Task 10: Get all books using async/await with Axios
async function getAllBooks() {
    try {
        const response = await axios.get(BASE_URL + "/");
        console.log("All books:");
        console.log(JSON.stringify(response.data, null, 4));
        return response.data;
    } catch (error) {
        console.error("Error fetching all books:", error.message);
    }
}

// Task 11: Get book details by ISBN using Promises (.then/.catch) with Axios
function getBookByISBN(isbn) {
    return axios.get(BASE_URL + "/isbn/" + encodeURIComponent(isbn))
        .then((response) => {
            console.log("Book with ISBN " + isbn + ":");
            console.log(JSON.stringify(response.data, null, 4));
            return response.data;
        })
        .catch((error) => {
            console.error("Error fetching book by ISBN " + isbn + ":", error.message);
        });
}

// Task 12: Get books by author using async/await with Axios
async function getBooksByAuthor(author) {
    try {
        const response = await axios.get(BASE_URL + "/author/" + encodeURIComponent(author));
        console.log("Books by author " + author + ":");
        console.log(JSON.stringify(response.data, null, 4));
        return response.data;
    } catch (error) {
        console.error("Error fetching books by author " + author + ":", error.message);
    }
}

// Task 13: Get books by title using async/await with Axios
async function getBooksByTitle(title) {
    try {
        const response = await axios.get(BASE_URL + "/title/" + encodeURIComponent(title));
        console.log("Books with title " + title + ":");
        console.log(JSON.stringify(response.data, null, 4));
        return response.data;
    } catch (error) {
        console.error("Error fetching books by title " + title + ":", error.message);
    }
}

// Runs all four Axios functions one after another
async function runAxiosDemo() {
    await getAllBooks();
    await getBookByISBN(1);
    await getBooksByAuthor("Chinua Achebe");
    await getBooksByTitle("Things Fall Apart");
}

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
module.exports.runAxiosDemo = runAxiosDemo;
