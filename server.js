const app = require('./app');
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
