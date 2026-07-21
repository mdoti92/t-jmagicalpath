import Phaser from 'phaser';

export class EffectsManager {
  playWallCollisionAnimation(
    scene: Phaser.Scene,
    pawnSprite: Phaser.GameObjects.Arc,
    startGridX: number,
    startGridY: number,
    offsetX: number,
    offsetY: number,
    onComplete?: () => void
  ) {
    const text = scene.add.text(pawnSprite.x, pawnSprite.y - 20, '¡BOOM! MURO', {
      fontSize: '16px',
      color: '#ff4d4d',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(20);

    scene.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => text.destroy()
    });

    scene.tweens.add({
      targets: pawnSprite,
      alpha: 0.2,
      x: pawnSprite.x + 6,
      yoyo: true,
      repeat: 2,
      duration: 100,
      onComplete: () => {
        const targetX = offsetX + startGridX * 80 + 40;
        const targetY = offsetY + startGridY * 80 + 40;

        scene.tweens.add({
          targets: pawnSprite,
          x: targetX,
          y: targetY,
          alpha: 1,
          duration: 400,
          ease: 'Back.easeOut',
          onComplete: () => onComplete?.()
        });
      }
    });
  }

  playCollectSymbolAnimation(scene: Phaser.Scene, pixelX: number, pixelY: number) {
    const flash = scene.add.circle(pixelX, pixelY, 20, 0xfff176, 0.4).setDepth(5);
    const ring = scene.add.circle(pixelX, pixelY, 8, 0xffffff, 0.2).setDepth(6);

    scene.tweens.add({
      targets: flash,
      scale: 2.2,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => flash.destroy()
    });

    scene.tweens.add({
      targets: ring,
      scale: 2.6,
      alpha: 0,
      duration: 450,
      ease: 'Power2',
      onComplete: () => ring.destroy()
    });
  }
}