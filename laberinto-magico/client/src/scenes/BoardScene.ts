import Phaser from 'phaser';
import { PawnManager } from '../managers/PawnManager';
import { EffectsManager } from '../managers/EffectsManager';

const CELL_SIZE = 80;
const BOARD_SIZE = 6;
const BOARD_OFFSET_X = 160;
const BOARD_OFFSET_Y = 90;

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
  private room!: any;
  private boardGrid!: Phaser.GameObjects.Container;
  private symbolLabels: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'BoardScene' });
  }

  create() {
    this.room = this.registry.get('room');
    this.pawnManager = new PawnManager();
    this.effectsManager = new EffectsManager();

    this.drawBoard();
    this.setupListeners();
    this.input.on('pointerdown', this.handleBoardClick, this);
  }

  private drawBoard() {
    this.add.rectangle(400, 300, 560, 560, 0x1f2a44, 0.95).setOrigin(0.5);

    this.boardGrid = this.add.container(0, 0);

    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const pixel = this.gridToPixel(x, y);
        const cellBg = this.add.rectangle(pixel.x, pixel.y, CELL_SIZE - 6, CELL_SIZE - 6, 0x2f4b7c, 0.9);
        this.boardGrid.add(cellBg);

        const symbolId = BOARD_SYMBOLS[y][x];
        const label = this.add.text(pixel.x, pixel.y, `${symbolId}`, {
          fontSize: '12px',
          color: '#fef3c7'
        }).setOrigin(0.5);
        this.boardGrid.add(label);
        this.symbolLabels.push(label);
      }
    }

    this.add.text(400, 40, '🧙 Laberinto Mágico', {
      fontSize: '22px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  private setupListeners() {
    if (!this.room) return;

    this.room.state.players.onAdd((player: any, playerId: string) => {
      const color = player.color || 'rojo';
      this.pawnManager.createPawn(this, playerId, color, player.x, player.y, BOARD_OFFSET_X, BOARD_OFFSET_Y);

      player.onChange(() => {
        this.pawnManager.movePawnSmooth(this, playerId, player.x, player.y, BOARD_OFFSET_X, BOARD_OFFSET_Y);
      });
    });

    this.room.state.players.onRemove((player: any, playerId: string) => {
      this.pawnManager.removePawn(playerId);
    });

    this.room.onMessage('WALL_HIT', (payload: any) => {
      const pawnSprite = this.pawnManager.getPawnSprite(payload.playerId);
      if (pawnSprite) {
        this.effectsManager.playWallCollisionAnimation(this, pawnSprite, payload.startX, payload.startY, BOARD_OFFSET_X, BOARD_OFFSET_Y, () => {});
      }
    });

    this.room.onMessage('SYMBOL_COLLECTED', (payload: any) => {
      const pixel = this.gridToPixel(payload.x, payload.y);
      this.effectsManager.playCollectSymbolAnimation(this, pixel.x, pixel.y);
    });
  }

  private handleBoardClick(pointer: Phaser.Input.Pointer) {
    if (!this.room) return;

    const grid = this.pixelToGrid(pointer.x, pointer.y);
    if (!grid) return;

    const { gridX, gridY } = grid;
    this.room.send('movePawn', { targetX: gridX, targetY: gridY });
  }

  gridToPixel(gridX: number, gridY: number) {
    return {
      x: BOARD_OFFSET_X + gridX * CELL_SIZE + CELL_SIZE / 2,
      y: BOARD_OFFSET_Y + gridY * CELL_SIZE + CELL_SIZE / 2
    };
  }

  pixelToGrid(pixelX: number, pixelY: number) {
    const localX = pixelX - BOARD_OFFSET_X;
    const localY = pixelY - BOARD_OFFSET_Y;

    if (localX < 0 || localY < 0) return null;

    const gridX = Math.floor(localX / CELL_SIZE);
    const gridY = Math.floor(localY / CELL_SIZE);

    if (gridX < 0 || gridX >= BOARD_SIZE || gridY < 0 || gridY >= BOARD_SIZE) return null;

    return { gridX, gridY };
  }
}
