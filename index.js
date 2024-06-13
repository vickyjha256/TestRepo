const mongoConnection = require('./db'); // Imported db.js file.

const express = require('express');
var cors = require('cors');

// mongoConnection(); // Calling the imported function here for connecting with the database.

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());


// This is for authentication of user.
app.use('/api/users', require('./routes/users'));


// mongoConnection().then(() => {
  app.listen(port, () => {
    console.log(`ShoeStore app listening on port ${port}`)
  })
// })