import Phaser from 'phaser';
import { Room } from 'colyseus.js';

const COLOR_MAP: Record<string, number> = {
  rojo: 0xff4d4d,
  azul: 0x4d94ff,
  amarillo: 0xffdb4d,
  verde: 0x4dff88
};

export class UIScene extends Phaser.Scene {
  private room!: Room;
  private turnText!: Phaser.GameObjects.Text;
  private diceBtn!: Phaser.GameObjects.Rectangle;
  private diceText!: Phaser.GameObjects.Text;
  private targetSymbolText!: Phaser.GameObjects.Text;
  private scoreListText!: Phaser.GameObjects.Text;
  private banner!: Phaser.GameObjects.Rectangle;
  private modalContainer?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this.room = this.registry.get('room');

    this.banner = this.add.rectangle(400, 25, 760, 48, 0x1f2937).setOrigin(0.5, 0);
    this.turnText = this.add.text(40, 38, 'Turno de: Esperando...', {
      fontSize: '20px',
      color: '#ffffff'
    });

    this.diceBtn = this.add.rectangle(120, 520, 170, 48, 0x8b6d9c)
      .setInteractive({ useHandCursor: true });

    this.diceText = this.add.text(120, 520, '🎲 Tirar Dado', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.diceBtn.on('pointerdown', () => {
      if (this.room) this.room.send('rollDice');
    });

    this.targetSymbolText = this.add.text(620, 100, 'Objetivo:\n✨ Cargando', {
      fontSize: '18px',
      color: '#ffdb4d'
    });

    this.scoreListText = this.add.text(620, 220, 'Progreso:\n', {
      fontSize: '16px',
      color: '#ffffff',
      lineSpacing: 8
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.room) return;

    this.room.state.listen('currentTurnPlayerId', (currentId: string) => {
      const activePlayer = this.room.state.players.get(currentId);
      const playerName = activePlayer ? activePlayer.name : 'Esperando';
      const color = activePlayer ? activePlayer.color : 'rojo';

      this.turnText.setText(`Turno de: ${playerName}`);
      this.turnText.setColor(COLOR_MAP[color] ? `#${COLOR_MAP[color].toString(16)}` : '#ffffff');
      this.updateDiceButtonState();
      this.diceText.setText(this.room.state.diceValue > 0 ? `Dado: ${this.room.state.diceValue}` : '🎲 Tirar Dado');
    });

    this.room.state.listen('remainingMoves', () => {
      this.updateDiceButtonState();
    });

    this.room.state.listen('diceValue', (val: number) => {
      if (val > 0) {
        this.diceText.setText(`Dado: ${val}`);
      } else {
        this.diceText.setText('🎲 Tirar Dado');
      }
    });

    this.room.state.listen('activeSymbolId', (symbolId: number) => {
      this.targetSymbolText.setText(`Objetivo:\n✨ Ficha #${symbolId}`);
    });

    this.room.state.listen('players', () => {
      this.renderScores();
    });

    this.room.state.listen('status', (status: string) => {
      if (status === 'FINISHED') {
        const winner = this.room.state.players.get(this.room.state.winnerId);
        const winnerName = winner ? winner.name : 'Jugador';

        this.showWinModal(winnerName);
      }
    });

    this.renderScores();
  }

  private renderScores() {
    const lines: string[] = ['Progreso:'];

    this.room.state.players.forEach((player: { name?: string; score?: number }) => {
      lines.push(`${player.name || 'Jugador'}: ${player.score || 0}/5 fichas`);
    });

    this.scoreListText.setText(lines.join('\n'));
  }

  private updateDiceButtonState() {
    const currentId = this.room.state.currentTurnPlayerId;
    const isMyTurn = this.room.sessionId === currentId;
    const canRoll = isMyTurn && this.room.state.remainingMoves === 0;

    this.diceBtn.setAlpha(canRoll ? 1 : 0.4);
    if (this.diceBtn.input) {
      this.diceBtn.input.enabled = canRoll;
    }
  }

  private showWinModal(winnerName: string) {
    if (this.modalContainer) return;

    this.modalContainer = this.add.container(0, 0);
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    const panel = this.add.rectangle(400, 300, 420, 240, 0x111827, 0.95);
    const title = this.add.text(400, 240, `🏆 ¡Ganador!\n${winnerName}`, {
      fontSize: '28px',
      color: '#ffdb4d',
      align: 'center'
    }).setOrigin(0.5);

    const restartBtn = this.add.rectangle(400, 340, 180, 46, 0x4dff88)
      .setInteractive({ useHandCursor: true });
    const restartText = this.add.text(400, 340, 'Nueva Partida', {
      fontSize: '16px',
      color: '#000000'
    }).setOrigin(0.5);

    restartBtn.on('pointerdown', () => {
      this.room.leave();
      this.scene.stop('UIScene');
      this.scene.stop('BoardScene');
      this.scene.start('LobbyScene');
    });

    this.modalContainer.add([overlay, panel, title, restartBtn, restartText]);
  }
}