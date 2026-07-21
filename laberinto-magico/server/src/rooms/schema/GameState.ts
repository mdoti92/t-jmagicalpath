import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string")
  id = "";

  @type("string")
  name = "";

  @type("string")
  color: "rojo" | "azul" | "amarillo" | "verde" = "rojo";

  @type("number")
  x = 0;

  @type("number")
  y = 0;

  @type("number")
  startX = 0;

  @type("number")
  startY = 0;

  @type("number")
  score = 0;
}

export class GameState extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();

  @type("string")
  currentTurnPlayerId = "";

  @type("number")
  diceValue = 0;

  @type("number")
  remainingMoves = 0;

  @type("number")
  activeSymbolId = -1;

  @type(["number"])
  bag = new ArraySchema<number>();

  @type("string")
  status: "LOBBY" | "PLAYING" | "FINISHED" = "LOBBY";

  @type("string")
  winnerId = "";
}

export const HARDCODED_WALLS = [
  { x1: 0, y1: 0, x2: 1, y2: 0 },
  { x1: 1, y1: 0, x2: 1, y2: 1 },
  { x1: 1, y1: 1, x2: 2, y2: 1 },
  { x1: 2, y1: 1, x2: 3, y2: 1 },
  { x1: 3, y1: 1, x2: 3, y2: 2 },
  { x1: 3, y1: 2, x2: 4, y2: 2 },
  { x1: 4, y1: 2, x2: 5, y2: 2 },
  { x1: 5, y1: 2, x2: 5, y2: 3 },
  { x1: 0, y1: 1, x2: 0, y2: 2 },
  { x1: 0, y1: 2, x2: 1, y2: 2 },
  { x1: 1, y1: 2, x2: 1, y2: 3 },
  { x1: 1, y1: 3, x2: 2, y2: 3 },
  { x1: 2, y1: 3, x2: 2, y2: 4 },
  { x1: 2, y1: 4, x2: 3, y2: 4 },
  { x1: 3, y1: 4, x2: 3, y2: 5 },
  { x1: 4, y1: 0, x2: 5, y2: 0 },
  { x1: 4, y1: 1, x2: 4, y2: 2 },
  { x1: 2, y1: 5, x2: 3, y2: 5 },
  { x1: 5, y1: 4, x2: 5, y2: 5 },
];

export const BOARD_SYMBOLS: number[][] = [
  [0, 1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10, 11],
  [12, 13, 14, 15, 16, 17],
  [18, 19, 20, 21, 22, 23],
  [0, 6, 12, 18, 1, 7],
  [13, 5, 11, 17, 23, 2],
];
