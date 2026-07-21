import Phaser from 'phaser';

const COLOR_MAP: Record<string, number> = {
  rojo: 0xff4d4d,
  azul: 0x4d94ff,
  amarillo: 0xffdb4d,
  verde: 0x4dff88
};

export class PawnManager {
  private pawns: Map<string, Phaser.GameObjects.Arc> = new Map();

  createPawn(scene: Phaser.Scene, playerId: string, color: string, gridX: number, gridY: number, offsetX: number, offsetY: number) {
    if (this.pawns.has(playerId)) return;

    const hexColor = COLOR_MAP[color] || 0xffffff;
    const pixelX = offsetX + gridX * 80 + 40;
    const pixelY = offsetY + gridY * 80 + 40;

    const pawn = scene.add.circle(pixelX, pixelY, 18, hexColor)
      .setStrokeStyle(3, 0xffffff)
      .setDepth(10);

    this.pawns.set(playerId, pawn);
  }

  movePawnSmooth(scene: Phaser.Scene, playerId: string, gridX: number, gridY: number, offsetX: number, offsetY: number) {
    const pawn = this.pawns.get(playerId);
    if (!pawn) return;

    const targetPixelX = offsetX + gridX * 80 + 40;
    const targetPixelY = offsetY + gridY * 80 + 40;

    scene.tweens.add({
      targets: pawn,
      x: targetPixelX,
      y: targetPixelY,
      duration: 250,
      ease: 'Power2'
    });
  }

  getPawnSprite(playerId: string) {
    return this.pawns.get(playerId);
  }

  removePawn(playerId: string) {
    const pawn = this.pawns.get(playerId);
    if (pawn) {
      pawn.destroy();
      this.pawns.delete(playerId);
    }
  }
}