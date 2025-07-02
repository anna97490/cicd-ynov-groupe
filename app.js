const mongoose = require('mongoose');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');

const User = require('./models/user');
const BlogPost = require('./models/blogPost'); 
const { specs, swaggerUi } = require('./swagger');

const router = express.Router();

dotenv.config();

// ------------------------------
// Connexion MongoDB
// ------------------------------

// Mongoose strict mode option
mongoose.set('strictQuery', false);

// Connexion à MongoDB
const mongoDB = process.env.MONGODB_URL;

main().catch((err) => console.error('Erreur de connexion MongoDB :', err));

async function main() {
  await mongoose.connect(mongoDB);
  console.log('Yo les girls');
}

const app = express();

// ------------------------------
// Configurations
// ------------------------------

const allowedOrigins = [
  "http://localhost:3000",
  "https://fleurkernevez.github.io",
  "https://fleurkernevez.github.io/integration-deploiement/",
  "https://fleurkernevez.github.io/integration-deploiement",
];

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

// Route de test
app.get('/', (req, res) => {
  res.send('Hello World');
});


// ------------------------------
// Routes pour BlogPost
// ------------------------------

/**
 * @description Get All users
 * @route GET /posts
 * @swagger
 * /blogPost:
 *   get:
 *     summary: Returns all posts
 *     responses:
 *       200:
 *         description: A successful response
 */

// Récupérer tous les billets de blog
router.get('/', async (req, res) => {
  try {
    const posts = await BlogPost.find({}).populate('author');
    res.status(200).json({ posts });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @description Get All users
 * @route POST /post
 * @swagger
 * /blogPost:
 *   post:
 *     summary: Create one post
 *     responses:
 *       200:
 *         description: A successful response
 */

// Créer un billet de blog
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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Export de l'app (si utilisation dans un autre fichier comme server.js)
module.exports = app;