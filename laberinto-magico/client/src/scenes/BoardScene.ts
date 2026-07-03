import Phaser from "phaser";
import * as Colyseus from "colyseus.js";
import { GameState, Tile, Wall } from "../types";

const TILE_SIZE = 80;
const GRID_COLUMNS = 6;
const GRID_ROWS = 6;
const PADDING = 50;

export class BoardScene extends Phaser.Scene {
  private client: Colyseus.Client | null = null;
  private room: Colyseus.Room<GameState> | null = null;
  private playerSessionId: string | null = null;

  // Elementos visuales
  private tileGroup: Phaser.Physics.Arcade.Group | null = null;
  private playerSprites: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();
  private symbolTexts: Map<string, Phaser.GameObjects.Text> = new Map();

  // Estado del juego
  private boardState: GameState | null = null;
  private myPosition: { x: number; y: number } | null = null;

  constructor() {
    super({ key: "BoardScene" });
  }

  async create() {
    console.log("🎮 Creando escena del tablero...");

    // Conectar con el servidor
    await this.connectToServer();

    // Crear controles
    this.createControls();

    // Mostrar información
    this.showConnectionStatus();
  }

  private async connectToServer() {
    try {
      if (this.shouldUseMockConnection()) {
        console.log("🧪 Usando mock de joinOrCreate...");
        this.playerSessionId = "mock-player";
        this.room = this.createMockRoom();
        console.log(`✅ Mock conectado a sala con ID: ${this.playerSessionId}`);
        return;
      }

      const serverURL = window.location.hostname === "localhost"
        ? "ws://localhost:2567"
        : `ws://${window.location.hostname}:2567`;

      console.log(`📡 Conectando a: ${serverURL}`);

      this.client = new Colyseus.Client(serverURL);
      console.log("📡 Cliente Colyseus creado...");

      this.room = await this.client.joinOrCreate("laberinto_room");
      this.playerSessionId = this.room.sessionId;

      console.log(`✅ Conectado a sala con ID: ${this.playerSessionId}`);

      // Recibir estado inicial
      this.room.onStateChange((state: GameState) => {
        console.log("📊 Estado actualizado:", state);
        this.boardState = state;
        this.updateGameboard();
      });
    } catch (error) {
      console.error("❌ Error conectando al servidor:", error);
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Revisa que el servidor esté corriendo en localhost:2567";

      this.showError(`No se pudo conectar al servidor. ${message}`);
    }
  }

  private shouldUseMockConnection(): boolean {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("mock") === "1";
  }

  private createMockRoom(): Colyseus.Room<GameState> {
    const mockState: GameState = {
      board: {
        grid: Array.from({ length: GRID_ROWS }, (_, y) =>
          Array.from({ length: GRID_COLUMNS }, (_, x) => ({
            x,
            y,
            symbol: ["☀️", "🌙", "⭐", "🔥", "🌿", "💧"][(x + y) % 6],
          }))
        ),
        walls: [],
        gridSize: GRID_COLUMNS,
        tileCount: GRID_COLUMNS * GRID_ROWS,
      },
      activePlayers: [
        [this.playerSessionId ?? "mock-player", {
          sessionId: this.playerSessionId ?? "mock-player",
          position: { x: 0, y: 0 },
        }],
      ],
    };

    let stateCallback: ((state: GameState) => void) | null = null;

    const room = {
      sessionId: this.playerSessionId ?? "mock-player",
      onStateChange: (callback: (state: GameState) => void) => {
        stateCallback = callback;
        callback(mockState);
      },
      send: (type: string, message: any) => {
        if (type !== "move" || !stateCallback) return;

        const nextPosition = {
          x: message.toX,
          y: message.toY,
        };

        mockState.activePlayers[0][1].position = nextPosition;
        stateCallback({
          ...mockState,
          activePlayers: [...mockState.activePlayers],
        });
      },
    } as unknown as Colyseus.Room<GameState>;

    this.boardState = mockState;
    this.updateGameboard();
    return room;
  }

  private updateGameboard() {
    if (!this.boardState) return;

    // Limpiar tablero anterior
    this.children.removeAll();
    this.tileGroup = this.physics.add.group();
    this.playerSprites.clear();
    this.symbolTexts.clear();

    // Renderizar tablero
    this.renderBoard();

    // Renderizar jugadores
    this.renderPlayers();

    // Extraer posición del jugador actual
    if (this.boardState.activePlayers && Array.isArray(this.boardState.activePlayers)) {
      for (const [key, player] of this.boardState.activePlayers) {
        if (player.sessionId === this.playerSessionId) {
          this.myPosition = player.position;
          break;
        }
      }
    }
  }

  private renderBoard() {
    if (!this.boardState) return;

    const grid = this.boardState.board?.grid || [];

    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLUMNS; x++) {
        const tile = grid[y]?.[x];
        if (!tile) continue;

        const posX = PADDING + x * TILE_SIZE + TILE_SIZE / 2;
        const posY = PADDING + y * TILE_SIZE + TILE_SIZE / 2;

        // Crear casilla con graphics
        const graphics = this.make.graphics({} as any);
        graphics.fillStyle(0x2a2a4e, 0.8);
        graphics.fillRect(
          posX - TILE_SIZE / 2,
          posY - TILE_SIZE / 2,
          TILE_SIZE,
          TILE_SIZE
        );
        graphics.lineStyle(2, 0x667eea, 1);
        graphics.strokeRect(
          posX - TILE_SIZE / 2,
          posY - TILE_SIZE / 2,
          TILE_SIZE,
          TILE_SIZE
        );

        // Símbolo en la casilla
        const symbolText = this.add.text(posX, posY - 15, tile.symbol, {
          fontSize: "36px",
        });
        symbolText.setOrigin(0.5, 0.5);
        this.symbolTexts.set(`${x}_${y}`, symbolText);

        // Coordenadas
        const coordText = this.add.text(
          posX,
          posY + 30,
          `(${x},${y})`,
          {
            fontSize: "10px",
            color: "#888888",
          }
        );
        coordText.setOrigin(0.5, 0.5);

        // Crear zona interactiva
        const rect = this.add.rectangle(posX, posY, TILE_SIZE, TILE_SIZE);
        rect.setInteractive();
        rect.setData("gridX", x);
        rect.setData("gridY", y);
        (rect as any).gridX = x;
        (rect as any).gridY = y;
      }
    }
  }

  private renderPlayers() {
    if (!this.boardState || !this.boardState.activePlayers) return;

    const colors = [0xff0000, 0x0000ff, 0xffff00, 0x00ff00]; // Rojo, azul, amarillo, verde
    let colorIndex = 0;

    const playersArray = Array.isArray(this.boardState.activePlayers)
      ? this.boardState.activePlayers
      : Object.entries(this.boardState.activePlayers);

    for (const item of playersArray) {
      const [key, playerData] = Array.isArray(item) ? item : [item[0], item[1]];
      const player = playerData as any;

      const posX =
        PADDING + player.position.x * TILE_SIZE + TILE_SIZE / 2;
      const posY =
        PADDING + player.position.y * TILE_SIZE + TILE_SIZE / 2;

      // Crear círculo para el jugador
      const circle = this.add.circle(posX, posY, 15, colors[colorIndex % colors.length], 0.9);
      circle.setDepth(10);
      this.playerSprites.set(key, circle as any);

      // Etiqueta del jugador
      const isMe = player.sessionId === this.playerSessionId;
      const label = this.add.text(
        posX,
        posY - 35,
        isMe ? "TÚ" : `Jugador ${colorIndex + 1}`,
        {
          fontSize: "12px",
          color: isMe ? "#ffff00" : "#ffffff",
          backgroundColor: "#000000",
          padding: { x: 5, y: 2 } as any,
        }
      );
      label.setOrigin(0.5, 0.5);
      label.setDepth(11);

      colorIndex++;
    }
  }

  private createControls() {
    // Flecha arriba
    this.input.keyboard?.on("keydown-UP", () => {
      this.attemptMove(0, -1);
    });

    // Flecha abajo
    this.input.keyboard?.on("keydown-DOWN", () => {
      this.attemptMove(0, 1);
    });

    // Flecha izquierda
    this.input.keyboard?.on("keydown-LEFT", () => {
      this.attemptMove(-1, 0);
    });

    // Flecha derecha
    this.input.keyboard?.on("keydown-RIGHT", () => {
      this.attemptMove(1, 0);
    });

    // Click en casilla
    this.input.on("gameobjectup", (pointer: any, obj: any) => {
      const gridX = (obj as any).gridX ?? obj.getData?.("gridX");
      const gridY = (obj as any).gridY ?? obj.getData?.("gridY");

      if (gridX !== undefined && gridY !== undefined && this.myPosition) {
        const diffX = gridX - this.myPosition.x;
        const diffY = gridY - this.myPosition.y;

        // Solo permitir movimiento adyacente
        if (
          Math.abs(diffX) + Math.abs(diffY) === 1
        ) {
          this.attemptMove(diffX, diffY);
        }
      }
    });
  }

  private attemptMove(dirX: number, dirY: number) {
    if (!this.myPosition || !this.room) return;

    const newX = this.myPosition.x + dirX;
    const newY = this.myPosition.y + dirY;

    // Validar que esté dentro del tablero
    if (newX < 0 || newX >= GRID_COLUMNS || newY < 0 || newY >= GRID_ROWS) {
      console.warn("❌ Movimiento fuera del tablero");
      return;
    }

    console.log(`🎮 Intentando mover a (${newX}, ${newY})`);

    // Enviar mensaje de movimiento al servidor
    this.room.send("move", {
      fromX: this.myPosition.x,
      fromY: this.myPosition.y,
      toX: newX,
      toY: newY,
    });
  }

  private showConnectionStatus() {
    const statusDiv = document.createElement("div");
    statusDiv.className = "connection-status connected";
    statusDiv.textContent = "🟢 Conectado";
    document.body.appendChild(statusDiv);

    const infoDiv = document.createElement("div");
    infoDiv.className = "info-panel";
    infoDiv.innerHTML = `
      <h3>🧙 Laberinto Mágico</h3>
      <div class="player-info">📌 Usa flechas o click para moverte</div>
      <div class="player-info">👁️ Los muros son invisibles</div>
      <div class="player-info">⭐ Busca los símbolos mágicos</div>
    `;
    document.body.appendChild(infoDiv);
  }

  private showError(message: string) {
    const statusDiv = document.createElement("div");
    statusDiv.className = "connection-status disconnected";
    statusDiv.textContent = `🔴 ${message}`;
    document.body.appendChild(statusDiv);
  }

  update() {
    // Actualizar cada frame si es necesario
  }
}
