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
    res.json({ message: "Welcome to API server Electronic Wallet." });
});

// Handle login event
io.on('connection', (socket) => {
    console.log(`A user connected with ID: ${socket.id}`);

    // Listen for login event
    socket.on('login', (username) => {
        console.log(`User ${username} logged in.`);
        // You can do further authentication/validation here
        // and emit response back to client accordingly
        socket.emit('loginResponse', `Welcome, ${username}!`);
    });

    // Listen for chat message event
    socket.on('chat message', (message) => {
        console.log(`Received message: ${message}`);
        // Broadcast the message to all connected clients except sender
        socket.broadcast.emit('chat message', message);
    });
});

require('./src/routes/auth.Routes')(app);
require('./src/routes/admin.Routes')(app);

// Khởi chạy máy chủ
const port = process.env.SERVER_PORT || 333;
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
