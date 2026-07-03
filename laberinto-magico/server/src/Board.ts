/**
 * Estructura del tablero del Laberinto Mágico
 * Grilla de 6x6 con símbolos mágicos y muros invisibles fijos
 */

// Símbolos mágicos disponibles
export enum MagicSymbol {
  MOON = "🌙",      // Luna
  STAR = "⭐",      // Estrella
  SUN = "☀️",       // Sol
  FIRE = "🔥",      // Fuego
  WATER = "💧",     // Agua
  LIGHTNING = "⚡", // Rayo
  LEAF = "🍀",      // Trébol/Hoja
  CRYSTAL = "💎",   // Cristal
  BOOK = "📖",      // Libro
  WAND = "✨",      // Varita
  SKULL = "💀",     // Calavera
  SPIDER = "🕷️",   // Araña
  POTION = "🧪",    // Poción
  CLOCK = "⏰",      // Reloj
  HEART = "💜",     // Corazón
  CROWN = "👑",     // Corona
  KEY = "🔑",       // Llave
  TREASURE = "💰",  // Tesoro
  GHOST = "👻",     // Fantasma
  EYE = "👁️",      // Ojo
  RING = "💍",      // Anillo
  SCROLL = "📜",    // Pergamino
  SNAKE = "🐍",     // Serpiente
  BAT = "🦇",       // Murciélago
}

// Tipos de muros: representan muros entre casillas
export interface Wall {
  x1: number;  // Casilla origen X
  y1: number;  // Casilla origen Y
  x2: number;  // Casilla destino X
  y2: number;  // Casilla destino Y
}

// Casilla del tablero
export interface Tile {
  x: number;
  y: number;
  symbol: MagicSymbol;
}

// Estado del tablero completo
export class Board {
  readonly GRID_SIZE = 6;
  readonly TILE_COUNT = this.GRID_SIZE * this.GRID_SIZE;
  
  private tiles: Tile[][] = [];
  private walls: Wall[] = [];

  constructor() {
    this.initializeTiles();
    this.initializeWalls();
    this.validateBoard();
  }

  /**
   * Inicializa las casillas con símbolos distribuidos de forma balanceada
   */
  private initializeTiles(): void {
    const symbols = Object.values(MagicSymbol);
    let symbolIndex = 0;

    for (let y = 0; y < this.GRID_SIZE; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.GRID_SIZE; x++) {
        const symbol = symbols[symbolIndex % symbols.length];
        this.tiles[y]![x] = {
          x,
          y,
          symbol: symbol as MagicSymbol,
        };
        symbolIndex++;
      }
    }
  }

  /**
   * Inicializa los 19 muros fijos (variante fácil)
   * Los muros se representan como conexiones bloqueadas entre dos casillas adyacentes
   * Distribuidos estratégicamente para garantizar que cada casilla tenga al menos una entrada
   */
  private initializeWalls(): void {
    // Definición de 19 muros estratégicamente colocados
    // Se distribuyen de forma que crean un laberinto desafiante pero navegable
    this.walls = [
      // Zona superior (filas 0-1)
      { x1: 0, y1: 0, x2: 1, y2: 0 },  // Muro horizontal en fila 0
      { x1: 2, y1: 0, x2: 2, y2: 1 },  // Muro vertical entre (2,0)-(2,1)
      { x1: 3, y1: 0, x2: 4, y2: 0 },  // Muro horizontal en fila 0
      { x1: 5, y1: 0, x2: 5, y2: 1 },  // Muro vertical entre (5,0)-(5,1)

      // Zona media-superior (fila 1-2)
      { x1: 1, y1: 1, x2: 1, y2: 2 },  // Muro vertical entre (1,1)-(1,2)
      { x1: 3, y1: 1, x2: 4, y2: 1 },  // Muro horizontal en fila 1
      { x1: 4, y1: 2, x2: 5, y2: 2 },  // Muro horizontal en fila 2

      // Zona central (fila 2-3)
      { x1: 0, y1: 2, x2: 1, y2: 2 },  // Muro horizontal en fila 2
      { x1: 2, y1: 2, x2: 2, y2: 3 },  // Muro vertical entre (2,2)-(2,3)
      { x1: 3, y1: 2, x2: 4, y2: 2 },  // Muro horizontal en fila 2

      // Zona central-inferior (fila 3-4)
      { x1: 0, y1: 3, x2: 1, y2: 3 },  // Muro horizontal en fila 3
      { x1: 4, y1: 3, x2: 5, y2: 3 },  // Muro horizontal en fila 3
      { x1: 1, y1: 3, x2: 1, y2: 4 },  // Muro vertical entre (1,3)-(1,4)
      { x1: 3, y1: 3, x2: 3, y2: 4 },  // Muro vertical entre (3,3)-(3,4)

      // Zona inferior (fila 4-5)
      { x1: 0, y1: 4, x2: 0, y2: 5 },  // Muro vertical entre (0,4)-(0,5)
      { x1: 2, y1: 4, x2: 3, y2: 4 },  // Muro horizontal en fila 4
      { x1: 4, y1: 4, x2: 5, y2: 4 },  // Muro horizontal en fila 4
      { x1: 1, y1: 5, x2: 2, y2: 5 },  // Muro horizontal en fila 5
      { x1: 4, y1: 5, x2: 5, y2: 5 },  // Muro horizontal en fila 5
    ];
  }

  /**
   * Valida que cada casilla tenga al menos una entrada (no esté completamente rodeada de muros)
   * También verifica que todas las casillas sean alcanzables desde (0,0) usando BFS
   */
  private validateBoard(): void {
    // Validación 1: Cada casilla debe tener al menos una entrada
    for (let y = 0; y < this.GRID_SIZE; y++) {
      for (let x = 0; x < this.GRID_SIZE; x++) {
        const entrances = this.countEntrances(x, y);
        if (entrances === 0) {
          throw new Error(
            `❌ Casilla (${x},${y}) está completamente bloqueada por muros. ` +
            `Verificar configuración de muros.`
          );
        }
      }
    }

    // Validación 2: Todas las casillas deben ser alcanzables (BFS connectivity check)
    const visited = new Set<string>();
    const queue: [number, number][] = [[0, 0]];
    visited.add("0,0");

    while (queue.length > 0) {
      const [x, y] = queue.shift()!;

      // Revisar todos los lados adyacentes
      const neighbors = [
        { x: x - 1, y },
        { x: x + 1, y },
        { x, y: y - 1 },
        { x, y: y + 1 },
      ];

      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        if (
          neighbor.x >= 0 &&
          neighbor.x < this.GRID_SIZE &&
          neighbor.y >= 0 &&
          neighbor.y < this.GRID_SIZE &&
          !visited.has(key) &&
          this.canMove(x, y, neighbor.x, neighbor.y)
        ) {
          visited.add(key);
          queue.push([neighbor.x, neighbor.y]);
        }
      }
    }

    // Verificar que todas las casillas fueron visitadas
    const reachableTiles = visited.size;
    const totalTiles = this.TILE_COUNT;
    if (reachableTiles !== totalTiles) {
      throw new Error(
        `❌ Solo ${reachableTiles} de ${totalTiles} casillas son alcanzables. ` +
        `El tablero tiene zonas desconectadas. Verificar configuración de muros.`
      );
    }

    console.log(`✅ Tablero validado exitosamente:`);
    console.log(`   • Todas las ${totalTiles} casillas son alcanzables`);
    console.log(`   • Cada casilla tiene al menos una entrada`);
    console.log(`   • Total de muros: ${this.walls.length}`);
  }

  /**
   * Cuenta cuántas entradas (lados sin muro) tiene una casilla
   */
  private countEntrances(x: number, y: number): number {
    let entrances = 0;

    // Revisar todos los lados posibles
    const sides = [
      { x: x - 1, y }, // Izquierda
      { x: x + 1, y }, // Derecha
      { x, y: y - 1 }, // Arriba
      { x, y: y + 1 }, // Abajo
    ];

    for (const side of sides) {
      // Si el lado está fuera del tablero, no es una entrada
      if (
        side.x < 0 ||
        side.x >= this.GRID_SIZE ||
        side.y < 0 ||
        side.y >= this.GRID_SIZE
      ) {
        continue;
      }

      // Verificar si hay un muro bloqueando hacia ese lado
      const hasWall = this.hasWallBetween(x, y, side.x, side.y);
      if (!hasWall) {
        entrances++;
      }
    }

    return entrances;
  }

  /**
   * Verifica si existe un muro entre dos casillas adyacentes
   */
  private hasWallBetween(x1: number, y1: number, x2: number, y2: number): boolean {
    return this.walls.some(
      (wall) =>
        (wall.x1 === x1 && wall.y1 === y1 && wall.x2 === x2 && wall.y2 === y2) ||
        (wall.x1 === x2 && wall.y1 === y2 && wall.x2 === x1 && wall.y2 === y1)
    );
  }

  /**
   * Obtiene una casilla específica
   */
  getTile(x: number, y: number): Tile | null {
    if (x < 0 || x >= this.GRID_SIZE || y < 0 || y >= this.GRID_SIZE) {
      return null;
    }
    return this.tiles[y]?.[x] || null;
  }

  /**
   * Obtiene todas las casillas
   */
  getAllTiles(): Tile[] {
    const allTiles: Tile[] = [];
    for (let y = 0; y < this.GRID_SIZE; y++) {
      for (let x = 0; x < this.GRID_SIZE; x++) {
        const tile = this.tiles[y]?.[x];
        if (tile) {
          allTiles.push(tile);
        }
      }
    }
    return allTiles;
  }

  /**
   * Obtiene todos los muros
   */
  getWalls(): Wall[] {
    return [...this.walls];
  }

  /**
   * Verifica si un jugador puede moverse de una casilla a una adyacente
   */
  canMove(fromX: number, fromY: number, toX: number, toY: number): boolean {
    // Validar que sea movimiento adyacente (horizontal o vertical)
    const isAdjacent =
      (Math.abs(fromX - toX) === 1 && fromY === toY) ||
      (Math.abs(fromY - toY) === 1 && fromX === toX);

    if (!isAdjacent) {
      return false;
    }

    // Validar que la casilla destino exista
    if (toX < 0 || toX >= this.GRID_SIZE || toY < 0 || toY >= this.GRID_SIZE) {
      return false;
    }

    // Verificar si hay un muro bloqueando
    return !this.hasWallBetween(fromX, fromY, toX, toY);
  }

  /**
   * Renderiza una representación visual del tablero en texto
   * Útil para debugging y visualización en terminal
   */
  renderBoard(): string {
    let output = "🧙 TABLERO DEL LABERINTO MÁGICO (6x6)\n";
    output += "=====================================\n\n";

    // Encabezado con números de columna
    output += "   ";
    for (let x = 0; x < this.GRID_SIZE; x++) {
      output += ` ${x}  `;
    }
    output += "\n";

    // Filas del tablero
    for (let y = 0; y < this.GRID_SIZE; y++) {
      // Primera línea de la fila (muros superiores)
      output += "   ";
      for (let x = 0; x < this.GRID_SIZE; x++) {
        output += "+---";
      }
      output += "+\n";

      // Segunda línea (casillas con símbolos)
      output += ` ${y} `;
      for (let x = 0; x < this.GRID_SIZE; x++) {
        const tile = this.tiles[y]?.[x];
        const symbol = tile?.symbol || "?";
        output += `|${symbol} `;
      }
      output += "|\n";
    }

    // Última línea de muros inferiores
    output += "   ";
    for (let x = 0; x < this.GRID_SIZE; x++) {
      output += "+---";
    }
    output += "+\n";

    // Información adicional
    output += `\n📊 Información del tablero:\n`;
    output += `   • Casillas: ${this.TILE_COUNT} (6x6)\n`;
    output += `   • Muros: ${this.walls.length}\n`;
    output += `   • Símbolos únicos: ${Object.keys(MagicSymbol).length}\n`;

    return output;
  }

  /**
   * Genera un resumen del estado del tablero para enviar a clientes
   */
  getState() {
    return {
      grid: this.tiles,
      walls: this.walls,
      gridSize: this.GRID_SIZE,
      tileCount: this.TILE_COUNT,
    };
  }
}
