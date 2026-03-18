const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let players = {};

io.on("connection", (socket) => {
    console.log("Joueur connecté :", socket.id);

    // Créer joueur
    players[socket.id] = {
        x: Math.random() * 500,
        hp: 100,
        coins: 0,
        skin: "red"
    };

    // Envoyer les joueurs
    io.emit("players", players);

    // Déplacement
    socket.on("move", (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
        }
    });

    // Attaque
    socket.on("attack", () => {
        for (let id in players) {
            if (id !== socket.id) {
                if (Math.abs(players[id].x - players[socket.id].x) < 50) {
                    players[id].hp -= 10;

                    if (players[id].hp <= 0) {
                        players[socket.id].coins += 10;
                        players[id].hp = 100;
                    }
                }
            }
        }
    });

    // Acheter skin
    socket.on("buySkin", (skin) => {
        if (players[socket.id].coins >= 20) {
            players[socket.id].coins -= 20;
            players[socket.id].skin = skin;
        }
    });

    // Déconnexion
    socket.on("disconnect", () => {
        delete players[socket.id];
        io.emit("players", players);
    });
});

// 🔥 IMPORTANT POUR RENDER
const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
    console.log("Serveur lancé sur port " + PORT);
});

// Mise à jour en continu
setInterval(() => {
    io.emit("players", players);
}, 50);
