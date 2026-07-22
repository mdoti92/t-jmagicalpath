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
  scene: [LobbyScene, BoardScene, UIScene],
};

new Phaser.Game(config);
