import { Room, Client } from "colyseus";

export class MyRoom extends Room {
  maxClients = 4;

  onCreate (options: any) {
    console.log("Sala del Laberinto Mágico creada!");

    this.onMessage("move", (client, message) => {
      // Aquí irá la lógica de validar si choca con la pared invisible
      console.log(`Jugador ${client.sessionId} quiere moverse a:`, message);
    });
  }

  onJoin (client: Client, options: any) {
    console.log(`Jugador conectado: ${client.sessionId}`);
  }

  onLeave (client: Client, consented: boolean) {
    console.log(`Jugador desconectado: ${client.sessionId}`);
  }

  onDispose () {
    console.log("Sala destruida.");
  }
}