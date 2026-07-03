import { Schema, MapSchema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") id: string = "";
  @type("string") name: string = "";
  @type("string") color: string = "";
  @type("number") x: number = 0; // Posición en la grilla del laberinto
  @type("number") y: number = 0;
  @type("boolean") isReady: boolean = false;
}

export class LaberintoState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("number") maxPlayersRequired: number = 4; // Configurable (2, 3 o 4)
  @type("string") status: string = "waiting"; // waiting, playing, finished
}