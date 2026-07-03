/**
 * Tipos para la comunicación con el servidor
 */

export interface Tile {
  x: number;
  y: number;
  symbol: string;
}

export interface Wall {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface BoardState {
  grid: Tile[][];
  walls: Wall[];
  gridSize: number;
  tileCount: number;
}

export interface PlayerState {
  sessionId: string;
  position: { x: number; y: number };
}

export interface GameState {
  board: BoardState;
  activePlayers: [string, PlayerState][];
}
