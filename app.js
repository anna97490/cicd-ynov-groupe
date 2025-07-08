/**
 * @file app.js
 * @description Application Express principale sans connexion MongoDB (prévue dans server.js).
 * @requires express
 * @requires cors
 * @requires dotenv
 * @requires ./models/user
 * @requires ./models/blogPost
 * @requires ./swagger
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const User = require('./models/user');
const BlogPost = require('./models/blogPost');
const { specs, swaggerUi } = require('./swagger');

dotenv.config();

const app = express();
const router = express.Router();

// ------------------------------
// Configurations
// ------------------------------

const allowedOrigins = [
  "http://localhost:3000",
  "https://fleurkernevez.github.io",
  "https://fleurkernevez.github.io/integration-deploiement/",
  "https://fleurkernevez.github.io/integration-deploiement",
];

/**
 * @description Options CORS pour autoriser les requêtes cross-origin
 * @type {import('cors').CorsOptions}
 */

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },

  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};


app.use(cors(corsOptions));


// Pour gérer les requêtes preflight OPTIONS
app.options('*', cors(corsOptions));
app.use(express.json());

/**
 * @route GET /
 * @returns {string} Hello World
 */
app.get('/', (req, res) => res.send('Hello World'));

// ------------------------------
// Routes pour User
// ------------------------------

/**
 * @route GET /users
 * @description Récupère tous les utilisateurs
 * @returns {Object[]} utilisateurs - Liste des utilisateurs
 */
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ utilisateurs: users });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @route POST /users
 * @description Crée un utilisateur
 * @param {Object} req.body - Les données de l'utilisateur
 * @returns {Object} - Utilisateur créé
 */
app.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ------------------------------
// Routes pour BlogPost
// ------------------------------

/**
 * @route GET /posts
 * @description Récupère tous les billets de blog, filtrés éventuellement par email d'auteur
 * @queryParam {string} [authorEmail] - Email de l’auteur
 * @returns {Object[]} posts - Liste des billets de blog
 */

router.get('/', async (req, res) => {
  try {
    const { authorEmail } = req.query;
    let filter = {};

    if (authorEmail) {
      const author = await User.findOne({ email: authorEmail });
      if (!author) return res.status(404).json({ message: 'Auteur non trouvé' });
      filter.author = author._id;
    }

    const posts = await BlogPost.find(filter);
    res.status(200).json({ posts });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @route POST /posts
 * @description Crée un billet de blog
 * @param {Object} req.body - Données du billet : title, content, author, date
 * @returns {Object} - Billet de blog créé
 */
router.post('/', async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const newPost = new BlogPost({
      title,
      content,
      author,
    });
    await newPost.save();
    return res.status(201).json(newPost);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use("/posts", router);

// ------------------------------
// Documentation Swagger
// ------------------------------

/**
 * @route GET /api-docs
 * @description Route de documentation Swagger
 */

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

module.exports = app;
