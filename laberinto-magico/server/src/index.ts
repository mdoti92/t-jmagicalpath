import { Server } from "colyseus";
import http from "http";
import express from "express";
import cors from "cors";
import { MyRoom } from "./rooms/MyRoom";

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

// Ruta de prueba para verificar que el servidor responde por HTTP
app.get("/", (req, res) => {
  res.send("🧙‍♂️ El backend del Laberinto Mágico está online!");
});

const server = http.createServer(app);
const gameServer = new Server({
  server: server,
});

// Registrar la sala del laberinto
gameServer.define("laberinto_room", MyRoom);

server.listen(port, () => {
  console.log(`⚔️  Servidor de Colyseus escuchando en http://localhost:${port}`);
});