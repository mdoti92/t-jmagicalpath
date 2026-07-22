import Phaser from "phaser";
import { LobbyScene } from "./managers/scenes/LobbyScene";
import { BoardScene } from "./scenes/BoardScene";
import { UIScene } from "./managers/scenes/UIScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 960,
  height: 640,
  // CONFIGURACIÓN CLAVE PARA ELEMENTOS DOM RESPONSIVOS:
  dom: {
    createContainer: true // Phaser creará el div superpuesto que escala con el canvas
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [LobbyScene, BoardScene, UIScene],
};

new Phaser.Game(config);