import Phaser from "phaser";
import { LobbyScene } from "./managers/scenes/LobbyScene";

const config: Phaser.Types.Core.GameConfig & { createDOMContainer?: boolean } = {
  type: Phaser.AUTO,
  parent: "game-container",
  createDOMContainer: true,
  width: 960,
  height: 640,
  scene: [LobbyScene],
};

new Phaser.Game(config);
