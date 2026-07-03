import { Room, Client } from "colyseus";
import { Board } from "../Board";

export class MyRoom extends Room {
  maxClients = 4;
  private board: Board = new Board();
  private activePlayers: Map<
    string,
    { sessionId: string; position: { x: number; y: number } }
  > = new Map();

  onCreate(options: any) {
    console.log("🧙 Sala del Laberinto Mágico creada!");

    // Mostrar el tablero en la consola del servidor
    console.log(this.board.renderBoard());

    // Enviar el estado del tablero a los clientes
    this.setState({
      board: this.board.getState(),
      activePlayers: Array.from(this.activePlayers.entries()),
    });

    // Listener para mensajes de movimiento
    this.onMessage("move", (client, message) => {
      console.log(
        `🎮 Jugador ${client.sessionId} intenta moverse a:`,
        message
      );

      // Validar si el movimiento es permitido (será más complejo luego)
      const { fromX, fromY, toX, toY } = message;

      if (this.board.canMove(fromX, fromY, toX, toY)) {
        console.log(`✅ Movimiento válido`);
        // Actualizar posición del jugador
        const player = this.activePlayers.get(client.sessionId);
        if (player) {
          player.position = { x: toX, y: toY };
          // Emitir actualización del estado
          this.setState({
            board: this.board.getState(),
            activePlayers: Array.from(this.activePlayers.entries()),
          });
        }
      } else {
        console.log(
          `❌ Movimiento bloqueado por muro entre (${fromX},${fromY}) y (${toX},${toY})`
        );
      }
    });
  }

  onJoin(client: Client, options: any) {
    console.log(`🎭 Jugador conectado: ${client.sessionId}`);

    // Asignar posición inicial (esquinas del tablero para diferentes jugadores)
    const playerCount = this.activePlayers.size;
    let startX = 0,
      startY = 0;

    switch (playerCount) {
      case 0:
        startX = 0;
        startY = 0; // Esquina superior izquierda
        break;
      case 1:
        startX = 5;
        startY = 0; // Esquina superior derecha
        break;
      case 2:
        startX = 0;
        startY = 5; // Esquina inferior izquierda
        break;
      case 3:
        startX = 5;
        startY = 5; // Esquina inferior derecha
        break;
    }

    this.activePlayers.set(client.sessionId, {
      sessionId: client.sessionId,
      position: { x: startX, y: startY },
    });

    // Actualizar estado
    this.setState({
      board: this.board.getState(),
      activePlayers: Array.from(this.activePlayers.entries()),
    });

    console.log(`   📍 Posición inicial: (${startX}, ${startY})`);
    console.log(
      `   👥 Jugadores en la sala: ${this.activePlayers.size}/${this.maxClients}`
    );
  }

  onLeave(client: Client, consented?: number) {
    console.log(`🚪 Jugador desconectado: ${client.sessionId}`);
    this.activePlayers.delete(client.sessionId);

    // Actualizar estado
    this.setState({
      board: this.board.getState(),
      activePlayers: Array.from(this.activePlayers.entries()),
    });

    console.log(
      `   👥 Jugadores en la sala: ${this.activePlayers.size}/${this.maxClients}`
    );
  }

  onDispose() {
    console.log("🗑️  Sala destruida.");
  }
}