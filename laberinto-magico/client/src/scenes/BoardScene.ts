import Phaser from 'phaser';
import { Room } from 'colyseus.js';
import { PawnManager } from '../managers/PawnManager';
import { EffectsManager } from '../managers/EffectsManager';

const CELL_SIZE = 80;
const BOARD_SIZE = 6;

const BOARD_SYMBOLS = [
  [1, 2, 3, 4, 5, 6],
  [7, 8, 9, 10, 11, 12],
  [13, 14, 15, 16, 17, 18],
  [19, 20, 21, 22, 23, 24],
  [25, 26, 27, 28, 29, 30],
  [31, 32, 33, 34, 35, 36]
];

export class BoardScene extends Phaser.Scene {
  private pawnManager!: PawnManager;
  private effectsManager!: EffectsManager;
  private room!: Room;
  private boardGrid!: Phaser.GameObjects.Container;
  private symbolLabels: Phaser.GameObjects.Text[] = [];
  private cellBySymbolId: Map<number, Phaser.GameObjects.Rectangle> = new Map();
  private tileSize: number = CELL_SIZE;
  private offsetX: number = 0;
  private offsetY: number = 0;

  constructor() {
    super({ key: 'BoardScene' });
  }

  init(data: { room?: Room }) {
    this.room = data.room || this.registry.get('room');
  }

  create() {
    this.pawnManager = new PawnManager();
    this.effectsManager = new EffectsManager();

    this.offsetX = (this.cameras.main.width - BOARD_SIZE * this.tileSize) / 2;
    this.offsetY = (this.cameras.main.height - BOARD_SIZE * this.tileSize) / 2;

    this.drawBoard();
    this.setupColyseusListeners();
    this.setupInputListeners();
  }

  private drawBoard() {
    this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY, 560, 560, 0x1f2a44, 0.95).setOrigin(0.5);

    this.boardGrid = this.add.container(0, 0);

    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const pixel = this.gridToPixel(x, y);
        const symbolId = BOARD_SYMBOLS[y][x];
        const cellBg = this.add.rectangle(pixel.x, pixel.y, this.tileSize - 6, this.tileSize - 6, 0x2f4b7c, 0.9);
        this.boardGrid.add(cellBg);
        this.cellBySymbolId.set(symbolId, cellBg);
        const label = this.add.text(pixel.x, pixel.y, `✨ ${symbolId}`, {
          fontSize: '14px',
          color: '#fef3c7'
        }).setOrigin(0.5);
        this.boardGrid.add(label);
        this.symbolLabels.push(label);
      }
    }

    this.add.text(this.cameras.main.centerX, 40, '🧙 Laberinto Mágico', {
      fontSize: '22px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.updateTargetHighlight();
  }

  private setupColyseusListeners() {
    if (!this.room) return;

    const syncPlayers = () => {
      const currentPlayers = this.room.state.players;
      const existingIds = new Set(this.pawnManager.getAllPawnIds?.() ?? []);

      currentPlayers.forEach((player: any, playerId: string) => {
        if (!existingIds.has(playerId)) {
          this.attachPlayer(player, playerId);
        }
      });

      existingIds.forEach((playerId) => {
        if (!currentPlayers.has(playerId)) {
          this.pawnManager.removePawn(playerId);
        }
      });
    };

    syncPlayers();

    this.room.onStateChange(() => {
      syncPlayers();
      this.updateTargetHighlight();

      this.room.state.players.forEach((player: any, playerId: string) => {
        const pawnSprite = this.pawnManager.getPawnSprite(playerId);
        if (pawnSprite) {
          this.pawnManager.movePawnSmooth(this, playerId, player.x, player.y, this.offsetX, this.offsetY);
        }
      });
    });

    this.room.onMessage('WALL_HIT', (payload: { playerId: string; startX: number; startY: number }) => {
      const pawnSprite = this.pawnManager.getPawnSprite(payload.playerId);
      const playerState = this.room.state.players.get(payload.playerId);

      if (pawnSprite && playerState) {
        this.effectsManager.playWallCollisionAnimation(
          this,
          pawnSprite,
          playerState.startX,
          playerState.startY,
          this.offsetX,
          this.offsetY
        );
      }
    });

    this.room.onMessage('SYMBOL_COLLECTED', (payload: { x: number; y: number }) => {
      const pixel = this.gridToPixel(payload.x, payload.y);
      this.effectsManager.playCollectSymbolAnimation(this, pixel.x, pixel.y);
    });
  }

  private attachPlayer(player: any, playerId: string) {
    const color = player.color || 'rojo';
    this.pawnManager.createPawn(this, playerId, color, player.x, player.y, this.offsetX, this.offsetY);
  }

  private updateTargetHighlight() {
    const targetSymbolId = this.room?.state?.activeSymbolId;

    this.cellBySymbolId.forEach((cell, symbolId) => {
      const isTarget = symbolId === targetSymbolId;
      cell.setFillStyle(isTarget ? 0x4c6ef5 : 0x2f4b7c);
      cell.setAlpha(isTarget ? 1 : 0.9);
      cell.setStrokeStyle(isTarget ? 4 : 0, 0xffffff);
    });
  }

  private setupInputListeners() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.room) return;

      const isMyTurn = this.room.sessionId === this.room.state.currentTurnPlayerId;
      const hasMoves = this.room.state.remainingMoves > 0;

      if (!isMyTurn || !hasMoves) return;

      const grid = this.pixelToGrid(pointer.x, pointer.y);
      if (!grid) return;

      const { gridX, gridY } = grid;
      this.room.send('movePawn', { targetX: gridX, targetY: gridY });
    });
  }

  gridToPixel(gridX: number, gridY: number) {
    return {
      x: this.offsetX + gridX * this.tileSize + this.tileSize / 2,
      y: this.offsetY + gridY * this.tileSize + this.tileSize / 2
    };
  }

  pixelToGrid(pixelX: number, pixelY: number) {
    const localX = pixelX - this.offsetX;
    const localY = pixelY - this.offsetY;

    if (localX < 0 || localY < 0) return null;

    const gridX = Math.floor(localX / this.tileSize);
    const gridY = Math.floor(localY / this.tileSize);

    if (gridX < 0 || gridX >= BOARD_SIZE || gridY < 0 || gridY >= BOARD_SIZE) return null;

    return { gridX, gridY };
  }
}
