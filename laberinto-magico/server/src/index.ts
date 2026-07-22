import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { GameRoom } from "./rooms/GameRoom";

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🧙 Servidor de El Laberinto Mágico activo");
});

const server = http.createServer(app);
const gameServer = new Server({
  server,
  transport: new WebSocketTransport({ server })
});

gameServer.define("laberinto_room", GameRoom);

gameServer.listen(port);

console.log(`🚀 Servidor Colyseus listo en http://localhost:${port}`);
