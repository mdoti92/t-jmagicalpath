import Phaser from "phaser";
import { LobbyScene } from "./managers/scenes/LobbyScene";
import { BoardScene } from "./scenes/BoardScene";
import { UIScene } from "./managers/scenes/UIScene";

const config: Phaser.Types.Core.GameConfig & { createDOMContainer?: boolean } = {
  type: Phaser.AUTO,
  parent: "game-container",
  createDOMContainer: true,
  width: 960,
  height: 640,
  scale: {
    mode: Phaser.Scale.FIT, // Escala el juego para encajar en el contenedor
    autoCenter: Phaser.Scale.CENTER_BOTH, // Lo centra horizontal y verticalmente
  },
  scene: [LobbyScene, BoardScene, UIScene],
};

new Phaser.Game(config);