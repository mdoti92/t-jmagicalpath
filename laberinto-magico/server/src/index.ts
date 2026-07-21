import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { GameRoom } from "./rooms/GameRoom";

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const gameServer = new Server({
  transport: new WebSocketTransport({ server }),
});

// Ruta básica de prueba
app.get("/", (req, res) => {
  res.send("🧙 Servidor de El Laberinto Mágico activo");
});

gameServer.define("laberinto_room", GameRoom);

server.listen(port, () => {
  console.log(`🚀 Servidor Colyseus listo en http://localhost:${port}`);
});