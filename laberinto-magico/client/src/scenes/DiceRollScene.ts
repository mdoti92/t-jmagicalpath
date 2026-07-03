/**
 * DiceRollScene
 * Escena de Phaser4 que maneja la visualización y animación del dado
 * Se integra en el cliente de laberinto-magico
 */

import Phaser from "phaser";

export interface DiceRollConfig {
  animationDuration?: number;
  resultDisplayDuration?: number;
  diceSize?: number;
}

export class DiceRollScene extends Phaser.Scene {
  private diceSprite!: Phaser.Physics.Arcade.Sprite;
  private resultText!: Phaser.GameObjects.Text;
  private diceButton!: Phaser.GameObjects.Rectangle;
  private buttonText!: Phaser.GameObjects.Text;

  private isRolling: boolean = false;
  private currentResult: number = 0;
  private isPlayerActive: boolean = false;

  private animationDuration: number = 1500;
  private resultDisplayDuration: number = 3000;
  private diceSize: number = 100;

  private onDiceRolled?: (value: number) => void;

  constructor() {
    super("DiceRollScene");
  }

  init(data: { config?: DiceRollConfig; onDiceRolled?: (value: number) => void } = {}) {
    if (data.config) {
      this.animationDuration = data.config.animationDuration ?? 1500;
      this.resultDisplayDuration = data.config.resultDisplayDuration ?? 3000;
      this.diceSize = data.config.diceSize ?? 100;
    }
    this.onDiceRolled = data.onDiceRolled;
  }

  create(): void {
    const { width, height } = this.scale;

    // Crear fondo semi-transparente
    this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0)
      .setDepth(1);

    // Crear el dado (usando un rectángulo coloreado como placeholder)
    this.diceSprite = this.physics.add.sprite(width / 2, height / 2 - 50, "");
    this.diceSprite.setDisplaySize(this.diceSize, this.diceSize);
    this.diceSprite.setDepth(10);
    this.createDiceGraphics();

    // Crear texto para mostrar el resultado
    this.resultText = this.add.text(width / 2, height / 2 + 80, "", {
      fontSize: "72px",
      color: "#ffffff",
      align: "center",
      fontStyle: "bold",
    });
    this.resultText.setOrigin(0.5);
    this.resultText.setDepth(10);
    this.resultText.setVisible(false);

    // Crear botón para tirar el dado
    this.createDiceButton();

    // Escuchar eventos globales
    this.scene.manager.events.on("wake", () => {
      this.updateButtonState();
    });
  }

  /**
   * Crea la representación visual del dado
   */
  private createDiceGraphics(): void {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, this.diceSize, this.diceSize);
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeRect(0, 0, this.diceSize, this.diceSize);

    // Generar textura
    graphics.generateTexture("diceTexture", this.diceSize, this.diceSize);
    graphics.destroy();

    this.diceSprite.setTexture("diceTexture");
  }

  /**
   * Crea el botón para tirar el dado
   */
  private createDiceButton(): void {
    const { width, height } = this.scale;
    const buttonX = width / 2;
    const buttonY = height - 80;

    this.diceButton = this.add
      .rectangle(buttonX, buttonY, 200, 60, 0x4CAF50, 1)
      .setDepth(5);
    this.diceButton.setInteractive();

    this.buttonText = this.add.text(buttonX, buttonY, "Tirar Dado", {
      fontSize: "24px",
      color: "#ffffff",
      align: "center",
      fontStyle: "bold",
    });
    this.buttonText.setOrigin(0.5);
    this.buttonText.setDepth(6);

    this.diceButton.on("pointerdown", () => this.handleDiceButtonClick());
    this.diceButton.on("pointerover", () => this.handleButtonHover(true));
    this.diceButton.on("pointerout", () => this.handleButtonHover(false));
  }

  /**
   * Maneja el click en el botón de tirar dado
   */
  private handleDiceButtonClick(): void {
    if (this.isRolling || !this.isPlayerActive) {
      return;
    }

    this.rollDice();
  }

  /**
   * Efecto hover en el botón
   */
  private handleButtonHover(isOver: boolean): void {
    if (!this.isPlayerActive || this.isRolling) {
      return;
    }

    if (isOver) {
      this.diceButton.setFillStyle(0x45a049);
      this.input.setDefaultCursor("pointer");
    } else {
      this.diceButton.setFillStyle(0x4CAF50);
      this.input.setDefaultCursor("default");
    }
  }

  /**
   * Anima la tirada del dado
   */
  private rollDice(): void {
    if (this.isRolling) {
      return;
    }

    this.isRolling = true;
    this.diceButton.setInteractive(false);
    this.buttonText.setAlpha(0.5);
    this.resultText.setVisible(false);

    // Animación de rotación del dado
    this.tweens.add({
      targets: this.diceSprite,
      rotation: Math.PI * 4,
      duration: this.animationDuration,
      ease: Phaser.Math.Easing.Quad.Out,
    });

    // Generar número aleatorio (1, 2, 2, 3, 3, 4)
    const diceFaces = [1, 2, 2, 3, 3, 4];
    this.currentResult = diceFaces[Math.floor(Math.random() * diceFaces.length)];

    // Mostrar resultado después de la animación
    this.time.delayedCall(this.animationDuration, () => {
      this.showResult();
    });
  }

  /**
   * Muestra el resultado en pantalla
   */
  private showResult(): void {
    this.resultText.setText(String(this.currentResult));
    this.resultText.setVisible(true);

    // Efecto de escala
    this.tweens.add({
      targets: this.resultText,
      scale: 1.2,
      duration: 200,
      ease: Phaser.Math.Easing.Elastic.Out,
    });

    // Emitir evento
    if (this.onDiceRolled) {
      this.onDiceRolled(this.currentResult);
    }

    // Ocultar resultado y permitir siguiente tirada
    this.time.delayedCall(this.resultDisplayDuration, () => {
      this.resetForNextRoll();
    });
  }

  /**
   * Reinicia la escena para la siguiente tirada
   */
  private resetForNextRoll(): void {
    this.isRolling = false;
    this.resultText.setVisible(false);
    this.diceSprite.setRotation(0);

    if (this.isPlayerActive) {
      this.diceButton.setInteractive();
      this.buttonText.setAlpha(1);
    }
  }

  /**
   * Actualiza el estado del botón basado en si el jugador está activo
   */
  updateButtonState(isActive: boolean = false): void {
    this.isPlayerActive = isActive;

    if (isActive) {
      this.diceButton.setFillStyle(0x4CAF50);
      this.buttonText.setAlpha(1);
      this.buttonText.setText("Tirar Dado");
      this.diceButton.setInteractive();
    } else {
      this.diceButton.setFillStyle(0x999999);
      this.buttonText.setAlpha(0.5);
      this.buttonText.setText("Espera tu turno");
      this.diceButton.setInteractive(false);
    }
  }

  /**
   * Obtiene el último resultado
   */
  getLastResult(): number {
    return this.currentResult;
  }

  /**
   * Verifica si está en medio de una tirada
   */
  isCurrentlyRolling(): boolean {
    return this.isRolling;
  }

  /**
   * Establece el estado activo del jugador
   */
  setPlayerActive(active: boolean): void {
    this.isPlayerActive = active;
    this.updateButtonState(active);
  }
}
