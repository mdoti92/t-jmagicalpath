import Phaser from 'phaser';

// Importante: Usar formato numérico 0x... para los círculos de Phaser
const COLOR_MAP: Record<string, number> = {
  rojo: 0xff4d4d,
  azul: 0x4d94ff,
  amarillo: 0xffdb4d,
  verde: 0x4dff88,
  default: 0xffffff
};

export class PawnManager {
  private pawns: Map<string, Phaser.GameObjects.Container> = new Map();
  private pawnPositions: Map<string, { gridX: number; gridY: number }> = new Map();

  createPawn(scene: Phaser.Scene, playerId: string, color: string, gridX: number, gridY: number, offsetX: number, offsetY: number) {
    if (this.pawns.has(playerId)) return;

    const normalizedColor = (color || 'default').toLowerCase();
    
    // 1. Resolver el color numérico
    let hexColor = COLOR_MAP[normalizedColor] ?? COLOR_MAP.default;

    // Si la variable 'color' llega del servidor como string '#ff4d4d', la convertimos a número:
    if (typeof color === 'string' && color.startsWith('#')) {
      hexColor = Phaser.Display.Color.HexStringToColor(color).color;
    }

    const pixelX = offsetX + gridX * 80 + 40;
    const pixelY = offsetY + gridY * 80 + 40;

    // 2. Círculo de fondo con el color del jugador
    const bgCircle = scene.add.circle(0, 0, 22, hexColor)
      .setStrokeStyle(3, 0xffffff);

    // 3. Emoji del mago centrado sobre el círculo
    const wizardIcon = scene.add.text(0, 0, '🧙‍♂️', {
      fontSize: '28px'
    }).setOrigin(0.5);

    // 4. Contenedor que agrupa ambos objetos
    const pawnContainer = scene.add.container(pixelX, pixelY, [bgCircle, wizardIcon])
      .setDepth(10);

    this.pawns.set(playerId, pawnContainer);
    this.pawnPositions.set(playerId, { gridX, gridY });
  }

  movePawnSmooth(scene: Phaser.Scene, playerId: string, gridX: number, gridY: number, offsetX: number, offsetY: number) {
    const pawn = this.pawns.get(playerId);
    if (!pawn) return;

    const targetPixelX = offsetX + gridX * 80 + 40;
    const targetPixelY = offsetY + gridY * 80 + 40;
    const overlapOffset = this.getOverlapOffset(gridX, gridY);

    scene.tweens.add({
      targets: pawn,
      x: targetPixelX + overlapOffset.x,
      y: targetPixelY + overlapOffset.y,
      duration: 250,
      ease: 'Power2'
    });

    this.pawnPositions.set(playerId, { gridX, gridY });
  }

  private getOverlapOffset(gridX: number, gridY: number) {
    let count = 0;
    for (const position of this.pawnPositions.values()) {
      if (position.gridX === gridX && position.gridY === gridY) count++;
    }

    if (count <= 1) return { x: 0, y: 0 };
    return count % 2 === 0 ? { x: 8, y: -8 } : { x: -8, y: 8 };
  }

  getPawnSprite(playerId: string): Phaser.GameObjects.Container | undefined {
    return this.pawns.get(playerId);
  }

  getAllPawnIds() {
    return Array.from(this.pawns.keys());
  }

  removePawn(playerId: string) {
    const pawn = this.pawns.get(playerId);
    if (pawn) {
      pawn.destroy();
      this.pawns.delete(playerId);
      this.pawnPositions.delete(playerId);
    }
  }
}