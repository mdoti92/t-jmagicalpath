import Phaser from 'phaser';

export class EffectsManager {
  playWallCollisionAnimation(
    scene: Phaser.Scene,
    pawnSprite: Phaser.GameObjects.Arc,
    startGridX: number,
    startGridY: number,
    offsetX: number,
    offsetY: number
  ) {
    // 1. Crear texto flotante de impacto
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

    // 2. Parpadeo de color/alfa en el peón
    scene.tweens.add({
      targets: pawnSprite,
      alpha: 0.2,
      yoyo: true,
      repeat: 2,
      duration: 100,
      onComplete: () => {
        // 3. Regreso rápido a la esquina inicial
        const targetX = offsetX + startGridX * 80 + 40;
        const targetY = offsetY + startGridY * 80 + 40;

        scene.tweens.add({
          targets: pawnSprite,
          x: targetX,
          y: targetY,
          duration: 400,
          ease: 'Back.easeOut'
        });
      }
    });
  }
}