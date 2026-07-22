import { Room, Client } from "colyseus";
import { ArraySchema } from "@colyseus/schema";
import { GameState, Player, HARDCODED_WALLS, BOARD_SYMBOLS } from "./schema/GameState";

const DICE_FACES = [1, 2, 2, 3, 3, 4];

const SPAWN_POSITIONS = [
  { color: "rojo" as const, x: 0, y: 0 },
  { color: "azul" as const, x: 5, y: 5 },
  { color: "amarillo" as const, x: 0, y: 5 },
  { color: "verde" as const, x: 5, y: 0 },
];

export class GameRoom extends Room<{ state: GameState }> {
  onCreate() {
    this.setState(new GameState());
    this.state.status = "LOBBY";
    this.initializeBag();
    this.revealNextSymbol();

    this.onMessage("rollDice", (client: Client) => {
      if (this.state.status !== "PLAYING") {
        return;
      }

      if (client.sessionId !== this.state.currentTurnPlayerId) {
        return;
      }

      if (this.state.remainingMoves !== 0) {
        return;
      }

      const value = DICE_FACES[Math.floor(Math.random() * DICE_FACES.length)];
      this.state.diceValue = value;
      this.state.remainingMoves = value;
    });

    this.onMessage("movePawn", (client: Client, payload: { targetX: number; targetY: number }) => {
      if (this.state.status !== "PLAYING") {
        return;
      }

      if (client.sessionId !== this.state.currentTurnPlayerId) {
        return;
      }

      if (this.state.remainingMoves <= 0) {
        return;
      }

      const player = this.state.players.get(client.sessionId);
      if (!player) {
        return;
      }

      const { targetX, targetY } = payload;
      if (!this.isOrthogonalMove(player, targetX, targetY)) {
        return;
      }

      if (this.isWallBetween(player.x, player.y, targetX, targetY)) {
        player.x = player.startX;
        player.y = player.startY;
        this.state.remainingMoves = 0;
        this.send(client, "WALL_HIT", { playerId: player.id });
        this.nextTurn();
        return;
      }

      player.x = targetX;
      player.y = targetY;
      this.state.remainingMoves -= 1;
      this.checkSymbolCollection(player);

      if (this.state.status === "PLAYING" && this.state.remainingMoves === 0) {
        this.nextTurn();
      }
    });
  }

  onJoin(client: Client, options?: { name?: string; color?: string; playerCount?: number }) {
    const index = this.state.players.size;
    const occupiedColors = new Set(Array.from(this.state.players.values()).map((player) => player.color));
    const requestedColor = options?.color;
    const selectedColor = requestedColor && !occupiedColors.has(requestedColor)
      ? requestedColor
      : Array.from(SPAWN_POSITIONS.map((spawn) => spawn.color)).find((color) => !occupiedColors.has(color)) || SPAWN_POSITIONS[0].color;
    const spawn = SPAWN_POSITIONS.find((item) => item.color === selectedColor) ?? SPAWN_POSITIONS[index] ?? SPAWN_POSITIONS[0];

    const player = new Player();
    player.id = client.sessionId;
    player.name = options?.name || `Jugador ${this.state.players.size + 1}`;
    player.color = selectedColor as Player['color'];
    player.startX = spawn.x;
    player.startY = spawn.y;
    player.x = spawn.x;
    player.y = spawn.y;
    player.score = 0;

    this.state.players.set(client.sessionId, player);

    if (!this.state.currentTurnPlayerId) {
      this.state.currentTurnPlayerId = client.sessionId;
    }

    if (this.state.status === "LOBBY" && this.state.players.size >= 2) {
      this.state.status = "PLAYING";
    }
  }

  onLeave(client: Client) {
    const leavingId = client.sessionId;
    const wasCurrent = this.state.currentTurnPlayerId === leavingId;
    this.state.players.delete(leavingId);

    if (this.state.players.size === 0) {
      this.state.status = "LOBBY";
      this.state.currentTurnPlayerId = "";
      this.state.diceValue = 0;
      this.state.remainingMoves = 0;
      return;
    }

    if (wasCurrent) {
      this.nextTurn();
    }
  }

  private initializeBag() {
    this.state.bag = new ArraySchema<number>();
    const values = Array.from(
      new Set(
        BOARD_SYMBOLS.flat().filter((symbolId) => symbolId >= 0)
      )
    );
    this.shuffleArray(values);
    values.forEach((value) => this.state.bag.push(value));
  }

  private shuffleArray<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private isOrthogonalMove(player: Player, targetX: number, targetY: number) {
    const dx = Math.abs(player.x - targetX);
    const dy = Math.abs(player.y - targetY);
    const insideBoard = targetX >= 0 && targetX <= 5 && targetY >= 0 && targetY <= 5;
    return insideBoard && dx + dy === 1;
  }

  private isWallBetween(x1: number, y1: number, x2: number, y2: number) {
    return HARDCODED_WALLS.some((wall) => {
      const sameDirection = wall.x1 === x1 && wall.y1 === y1 && wall.x2 === x2 && wall.y2 === y2;
      const reverseDirection = wall.x1 === x2 && wall.y1 === y2 && wall.x2 === x1 && wall.y2 === y1;
      return sameDirection || reverseDirection;
    });
  }

  private checkSymbolCollection(player: Player) {
    if (this.state.activeSymbolId < 0) {
      return;
    }

    const symbolId = BOARD_SYMBOLS[player.y]?.[player.x];
    if (symbolId !== this.state.activeSymbolId) {
      return;
    }

    player.score += 1;
    this.state.remainingMoves = 0;
    this.state.diceValue = 0;

    if (player.score >= 5) {
      this.endGame(player);
      return;
    }

    this.revealNextSymbol();
    if (this.state.status === "PLAYING") {
      this.nextTurn();
    }
  }

  private revealNextSymbol() {
    while (true) {
      if (this.state.bag.length === 0) {
        this.state.activeSymbolId = -1;
        return;
      }

      const nextSymbol = this.state.bag.shift();
      if (nextSymbol === undefined) {
        this.state.activeSymbolId = -1;
        return;
      }

      const symbolIdToUse = nextSymbol;
      const targetCell = BOARD_SYMBOLS.some((row) => row.includes(symbolIdToUse));

      if (!targetCell) {
        continue;
      }

      this.state.activeSymbolId = symbolIdToUse;
      let collected = false;

      for (const player of this.state.players.values()) {
        const symbolId = BOARD_SYMBOLS[player.y]?.[player.x];
        if (symbolId === this.state.activeSymbolId) {
          player.score += 1;
          collected = true;

          if (player.score >= 5) {
            this.endGame(player);
            return;
          }
        }
      }

      if (!collected) {
        return;
      }
    }
  }

  private nextTurn() {
    if (this.state.status !== "PLAYING") {
      return;
    }

    const players = Array.from(this.state.players.keys());
    if (players.length === 0) {
      this.state.currentTurnPlayerId = "";
      this.state.remainingMoves = 0;
      this.state.diceValue = 0;
      return;
    }

    const currentIndex = players.indexOf(this.state.currentTurnPlayerId);
    const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % players.length;
    this.state.currentTurnPlayerId = players[nextIndex];
    this.state.remainingMoves = 0;
    this.state.diceValue = 0;
  }

  private endGame(winner: Player) {
    if (this.state.status === "FINISHED") {
      return;
    }

    this.state.status = "FINISHED";
    this.state.winnerId = winner.id;
    this.state.remainingMoves = 0;
    this.state.diceValue = 0;
    this.broadcast("GAME_FINISHED", { winnerId: winner.id });
  }
}
