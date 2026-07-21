import Phaser from 'phaser';
import { Room } from 'colyseus.js';
import { saveMatchResult } from '../services/supabase';

export class UIScene extends Phaser.Scene {
  private room!: Room;
  private turnText!: Phaser.GameObjects.Text;
  private diceBtn!: Phaser.GameObjects.Rectangle;
  private diceText!: Phaser.GameObjects.Text;
  private targetSymbolText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this.room = this.registry.get('room');

    // Indicator de Turno Activo
    this.turnText = this.add.text(20, 20, 'Turno de: Esperando...', {
      fontSize: '20px',
      color: '#ffffff'
    });

    // Control del Dado
    this.diceBtn = this.add.rectangle(100, 520, 130, 45, 0x8b6d9c)
      .setInteractive({ useHandCursor: true });

    this.diceText = this.add.text(100, 520, '🎲 Tirar Dado', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.diceBtn.on('pointerdown', () => {
      if (this.room) this.room.send('rollDice');
    });

    // Visualización del Objetivo Símbolo
    this.targetSymbolText = this.add.text(620, 100, 'Objetivo:\n✨ Cargando', {
      fontSize: '18px',
      color: '#ffdb4d'
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.room) return;

    // Escuchar Cambio de Turno
    this.room.state.listen('currentTurnPlayerId', (currentId: string) => {
      const activePlayer = this.room.state.players.get(currentId);
      if (activePlayer) {
        this.turnText.setText(`Turno de: ${activePlayer.name}`);
      }

      const isMyTurn = this.room.sessionId === currentId;
      const canRoll = isMyTurn && this.room.state.remainingMoves === 0;

      this.diceBtn.setAlpha(canRoll ? 1 : 0.4);
      this.diceBtn.input!.enabled = canRoll;
    });

    // Escuchar Valor del Dado
    this.room.state.listen('diceValue', (val: number) => {
      if (val > 0) {
        this.diceText.setText(`Dado: ${val}`);
      } else {
        this.diceText.setText('🎲 Tirar Dado');
      }
    });

    // Escuchar Símbolo Activo
    this.room.state.listen('activeSymbolId', (symbolId: number) => {
      this.targetSymbolText.setText(`Objetivo:\n✨ Ficha #${symbolId}`);
    });

    // Escuchar Fin de Partida
    this.room.state.listen('status', async (status: string) => {
      if (status === 'FINISHED') {
        const winner = this.room.state.players.get(this.room.state.winnerId);
        const winnerName = winner ? winner.name : 'Jugador';

        this.showWinModal(winnerName);
        await saveMatchResult(winnerName, this.room.state.players.size);
      }
    });
  }

  private showWinModal(winnerName: string) {
    this.add.rectangle(400, 300, 400, 250, 0x000000, 0.85);
    
    this.add.text(400, 240, `🏆 ¡GANADOR!\n${winnerName}`, {
      fontSize: '28px',
      color: '#ffdb4d',
      align: 'center'
    }).setOrigin(0.5);

    const restartBtn = this.add.rectangle(400, 330, 160, 40, 0x4dff88)
      .setInteractive({ useHandCursor: true });

    this.add.text(400, 330, 'Nueva Partida', {
      fontSize: '16px',
      color: '#000000'
    }).setOrigin(0.5);

    restartBtn.on('pointerdown', () => {
      this.room.leave();
      this.scene.stop('UIScene');
      this.scene.stop('BoardScene');
      this.scene.start('LobbyScene');
    });
  }
}