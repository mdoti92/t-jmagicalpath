# 🤖 MASTER PROMPT DE INTEGRACIÓN — DEV B (Servidor ↔ Tablero Visual)

> **PROMPT DE ACTIVACIÓN:**
> "Actúa como un desarrollador Frontend Senior especializado en Phaser 3/4 y Colyseus. Tu objetivo es implementar la integración en tiempo real entre el servidor Colyseus y las escenas visuales/managers de Phaser (`BoardScene.ts`, `PawnManager.ts` y `EffectsManager.ts`). Lee @PROJECT_CONTEXT.md para asegurar la coherencia de tipos e interfaces."

---

## 🎯 ARCHIVOS PERMITIDOS (LÍMITE DE ESCRITURA)
Solo puedes escribir o reemplazar el código de los siguientes archivos:
- `client/src/scenes/BoardScene.ts`
- `client/src/managers/PawnManager.ts`
- `client/src/managers/EffectsManager.ts`

---

## 💻 IMPLEMENTACIÓN COMPLETA

### 1. File: `client/src/scenes/BoardScene.ts`

```typescript
import Phaser from 'phaser';
import { Room } from 'colyseus.js';
import { PawnManager } from '../managers/PawnManager';
import { EffectsManager } from '../managers/EffectsManager';

export class BoardScene extends Phaser.Scene {
  private room!: Room;
  private pawnManager!: PawnManager;
  private effectsManager!: EffectsManager;
  private tileSize: number = 80;
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

    // Calcular offset para centrar el tablero 6x6 (480x480px)
    this.offsetX = (this.cameras.main.width - 6 * this.tileSize) / 2;
    this.offsetY = (this.cameras.main.height - 6 * this.tileSize) / 2;

    this.renderGrid();
    this.setupColyseusListeners();
    this.setupInputListeners();
  }

  private renderGrid() {
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
        const x = this.offsetX + col * this.tileSize;
        const y = this.offsetY + row * this.tileSize;

        // Renderizar casilla
        this.add.rectangle(x + 40, y + 40, 76, 76, 0x3a2e39)
          .setStrokeStyle(2, 0x8b6d9c);

        // Representación visual del símbolo
        const symbolId = (row * 6 + col) % 24; 
        this.add.text(x + 40, y + 40, `✨ ${symbolId}`, {
          fontSize: '14px',
          color: '#e2d4f0'
        }).setOrigin(0.5);
      }
    }
  }

  private setupColyseusListeners() {
    if (!this.room) return;

    // Escuchar adición de jugadores
    this.room.state.players.onAdd((player: any, key: string) => {
      this.pawnManager.createPawn(this, player.id, player.color, player.x, player.y, this.offsetX, this.offsetY);

      // Escuchar cambios de coordenadas (x, y)
      player.onChange(() => {
        this.pawnManager.movePawnSmooth(this, player.id, player.x, player.y, this.offsetX, this.offsetY);
      });
    });

    // Escuchar eliminación de jugadores
    this.room.state.players.onRemove((player: any, key: string) => {
      this.pawnManager.removePawn(player.id);
    });

    // Escuchar evento de choque con muro
    this.room.onMessage("WALL_HIT", (data: { playerId: string }) => {
      const pawnSprite = this.pawnManager.getPawnSprite(data.playerId);
      const playerState = this.room.state.players.get(data.playerId);

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
  }

  private setupInputListeners() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.room) return;

      const isMyTurn = this.room.sessionId === this.room.state.currentTurnPlayerId;
      const hasMoves = this.room.state.remainingMoves > 0;

      if (!isMyTurn || !hasMoves) return;

      // Convertir píxeles de pantalla a grilla (0 a 5)
      const targetX = Math.floor((pointer.x - this.offsetX) / this.tileSize);
      const targetY = Math.floor((pointer.y - this.offsetY) / this.tileSize);

      if (targetX >= 0 && targetX < 6 && targetY >= 0 && targetY < 6) {
        this.room.send("movePawn", { targetX, targetY });
      }
    });
  }
}