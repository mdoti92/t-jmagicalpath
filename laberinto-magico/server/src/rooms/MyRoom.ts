import { Room, Client } from "colyseus";
import { LaberintoState, Player } from "./schema/LaberintoState";

// Colores disponibles fijados por la US
const AVAILABLE_COLORS = ["rojo", "azul", "amarillo", "verde"];

// Posiciones iniciales estándar en las esquinas del tablero (asumiendo un tablero por ej. de 7x7 o similar)
// Puedes cambiar estos números según el tamaño real de tu grilla en Phaser
const START_POSITIONS = [
  { x: 0, y: 0 }, // Esquina superior izquierda
  { x: 6, y: 0 }, // Esquina superior derecha
  { x: 0, y: 6 }, // Esquina inferior izquierda
  { x: 6, y: 6 }  // Esquina inferior derecha
];

export class MyRoom extends Room<LaberintoState> {
  
  onCreate (options: any) {
    // Inicializamos el estado de la sala
    this.setState(new LaberintoState());

    // El creador de la sala puede definir cuántos juegan (2, 3 o 4). Por defecto 4.
    if (options.maxPlayers && [2, 3, 4].includes(options.maxPlayers)) {
      this.state.maxPlayersRequired = options.maxPlayers;
      this.maxClients = options.maxPlayers;
    } else {
      this.state.maxPlayersRequired = 4;
      this.maxClients = 4;
    }

    console.log(`Sala configurada para ${this.state.maxPlayersRequired} jugadores.`);

    // Mensaje por si un jugador quiere cambiar su nombre temporal antes de iniciar
    this.onMessage("set_name", (client, message: { name: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (player && message.name) {
        player.name = message.name.trim();
        console.log(`Jugador ${client.sessionId} cambió su nombre a: ${player.name}`);
      }
    });
  }

  onJoin (client: Client, options: any) {
    // Validar si la partida ya empezó para no dejar entrar colados
    if (this.state.status !== "waiting") {
      throw new Error("La partida ya ha comenzado");
    }

    const playerIndex = this.state.players.size;

    const newPlayer = new Player();
    newPlayer.id = client.sessionId;
    // Criterio: Nombre temporal por defecto
    newPlayer.name = options.name || `Jugador ${playerIndex + 1}`;
    // Criterio: Asignar color de peón correspondiente
    newPlayer.color = AVAILABLE_COLORS[playerIndex];
    // Criterio: Ubicar peón en la esquina asignada
    newPlayer.x = START_POSITIONS[playerIndex].x;
    newPlayer.y = START_POSITIONS[playerIndex].y;

    // Guardar jugador en el mapa del estado
    this.state.players.set(client.sessionId, newPlayer);

    console.log(`Rentró ${newPlayer.name} con color ${newPlayer.color} en posición (${newPlayer.x}, ${newPlayer.y})`);

    // Si se llena la sala con la cantidad elegida, arranca la partida
    if (this.state.players.size === this.state.maxPlayersRequired) {
      this.state.status = "playing";
      this.lock(); // Cerramos la sala para que nadie más intente unirse
      console.log("¡Sala llena! La partida del Laberinto Mágico ha comenzado.");
    }
  }

  onLeave (client: Client, consented: boolean) {
    console.log(`Jugador desconectado: ${client.sessionId}`);
    this.state.players.delete(client.sessionId);
    
    // Si la partida no había empezado, permitimos que se sume otro abriendo la sala
    if (this.state.status === "waiting") {
      this.unlock();
    }
  }

  onDispose () {
    console.log("Sala del laberinto destruida.");
  }
}