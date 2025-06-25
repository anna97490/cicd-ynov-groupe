const mongoose = require('mongoose');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');

dotenv.config();

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

// Config CORS
const corsOptions = {
  origin: process.env.FRONT_URL,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// Route de test
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Export de l’app (si utilisation dans un autre fichier comme server.js)
module.exports = app;
