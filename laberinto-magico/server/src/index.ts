import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";

// Si Dev A ya creó GameRoom.ts en server/src/rooms/GameRoom.ts, descomenta la siguiente línea:
// import { GameRoom } from "./rooms/GameRoom";

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const gameServer = new Server({
  server,
});

// Ruta básica de prueba
app.get("/", (req, res) => {
  res.send("🧙 Servidor de El Laberinto Mágico activo");
});

// Cuando Dev A implemente GameRoom, se vincula aquí:
// gameServer.define("laberinto_room", GameRoom);

server.listen(port, () => {
  console.log(`🚀 Servidor Colyseus listo en http://localhost:${port}`);
});