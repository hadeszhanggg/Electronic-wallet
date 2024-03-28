const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
require("dotenv").config();
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const db = require("./src/models");
const Role = db.role;
const TranType =db.transactionType;
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
   TranType.findOrCreate({
    where: { id: 1 },
        defaults: {
            name: "Deposit",
        }
   });
   TranType.findOrCreate({
    where: { id: 2 },
        defaults: {
            name: "Transfer",
        }
   })
   TranType.findOrCreate({
    where: { id: 3 },
        defaults: {
            name: "Pay",
        }
   })
}
db.sequelize.sync({ force: false }).then(() => {
    initial();
});
// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to API server Electronic Wallet." });
});

// Handle login event
io.on('connection', (socket) => {
    console.log(`A user connected with ID: ${socket.id}`);
    socket.on('joinRoom', ( roomName ) => {
        socket.join(roomName);
        socket.emit('Welcome', "Welcome to Electronic-wallet API Server!");
     });
});
require('./src/routes/auth.Routes')(app);
require('./src/routes/admin.Routes')(app);
require('./src/routes/user.Routes')(app);
// Khởi chạy máy chủ
const port = process.env.SERVER_PORT || 333;
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
