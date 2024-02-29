const express = require('express');
const bodyParser = require("body-parser");
const app = express();
require("dotenv").config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const db = require("./src/models");
const Role = db.role;
function initial() {
  Role.findOrCreate({
    where: { id: 1 },
    defaults: {
      name: "user"
    }
  });

  Role.findOrCreate({
    where: { id: 2 },
    defaults: {
      name: "admin",
    }
  });
}

db.sequelize.sync({ force: false }).then(() => {
  initial();
});
// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to API." });
  });
  
require('./src/routes/authRoute')(app);

// Khởi chạy máy chủ
const port = process.env.SERVER_PORT;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
