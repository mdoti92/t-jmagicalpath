import Phaser from 'phaser';

const COLOR_MAP: Record<string, number> = {
  rojo: 0xff4d4d,
  azul: 0x4d94ff,
  amarillo: 0xffdb4d,
  verde: 0x4dff88,
  default: 0xffffff
};

export class PawnManager {
  private pawns: Map<string, Phaser.GameObjects.Arc> = new Map();
  private pawnPositions: Map<string, { gridX: number; gridY: number }> = new Map();

  createPawn(scene: Phaser.Scene, playerId: string, color: string, gridX: number, gridY: number, offsetX: number, offsetY: number) {
    if (this.pawns.has(playerId)) return;

    const normalizedColor = (color || 'default').toLowerCase();
    const hexColor = COLOR_MAP[normalizedColor] ?? COLOR_MAP.default;
    const pixelX = offsetX + gridX * 80 + 40;
    const pixelY = offsetY + gridY * 80 + 40;

    const pawn = scene.add.circle(pixelX, pixelY, 18, hexColor)
      .setStrokeStyle(3, 0xffffff)
      .setDepth(10);

    this.pawns.set(playerId, pawn);
    this.pawnPositions.set(playerId, { gridX, gridY });
  }

  movePawnSmooth(scene: Phaser.Scene, playerId: string, gridX: number, gridY: number, offsetX: number, offsetY: number) {
    const pawn = this.pawns.get(playerId);
    if (!pawn) return;

    const previous = this.pawnPositions.get(playerId);
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

  getPawnSprite(playerId: string) {
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