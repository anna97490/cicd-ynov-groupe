const mongoose = require('mongoose');
const app = require('./app');
const PORT = process.env.PORT || 5001;

mongoose.set('strictQuery', false);
const mongoDB = process.env.MONGODB_URL;

async function main() {
  try {
    await mongoose.connect(mongoDB);
    console.log('Yo les girls');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Erreur de connexion MongoDB :', err);
  }
}

main();

