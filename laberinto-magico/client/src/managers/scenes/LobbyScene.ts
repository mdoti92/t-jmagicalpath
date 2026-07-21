import Phaser from 'phaser';
import { Client } from 'colyseus.js';

export class LobbyScene extends Phaser.Scene {
  private client!: Client;

  constructor() {
    super({ key: 'LobbyScene' });
  }

  create() {
    this.client = new Client('ws://localhost:2567');

    this.add.text(400, 150, '🧙 El Laberinto Mágico', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Botón de Unirse
    const joinBtn = this.add.rectangle(400, 300, 220, 50, 0x4d94ff)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add.text(400, 300, 'Unirse a Partida', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    joinBtn.on('pointerdown', async () => {
      try {
        btnText.setText('Conectando...');

        const room = await this.client.joinOrCreate('laberinto_room', {
          name: `Mago_${Math.floor(Math.random() * 100)}`,
          color: 'rojo'
        });

        // Registrar la room globalmente
        this.registry.set('room', room);

        // Al cambiar a 'PLAYING', arrancar BoardScene y UIScene en paralelo
        room.state.listen('status', (status: string) => {
          if (status === 'PLAYING') {
            this.scene.start('BoardScene');
            this.scene.launch('UIScene');
          }
        });
      } catch (e) {
        console.error('Error al unirse:', e);
        btnText.setText('Error de Conexión');
      }
    });
  }
}