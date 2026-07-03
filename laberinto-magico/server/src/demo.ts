/**
 * Script de demostración del tablero
 * Muestra el tablero del Laberinto Mágico en la consola
 */

import { Board } from "./Board";

console.log("\n🎮 ========================================");
console.log("   DEMOSTRACIÓN DEL LABERINTO MÁGICO");
console.log("========================================\n");

// Crear una instancia del tablero
const board = new Board();

// Mostrar el tablero
console.log(board.renderBoard());

// Mostrar información adicional
console.log("\n📋 Información detallada del tablero:\n");

// Listar todos los símbolos
const tiles = board.getAllTiles();
console.log("Casillas del tablero:");
for (let y = 0; y < 6; y++) {
  const row = tiles
    .filter((t) => t.y === y)
    .sort((a, b) => a.x - b.x)
    .map((t) => `(${t.x},${t.y}):${t.symbol}`)
    .join("  ");
  console.log(`  Fila ${y}: ${row}`);
}

// Mostrar muros
console.log("\n🧱 Muros del tablero (19 total):");
const walls = board.getWalls();
walls.forEach((wall, index) => {
  console.log(
    `  ${index + 1}. Bloquea movimiento entre (${wall.x1},${wall.y1}) ↔ (${wall.x2},${wall.y2})`
  );
});

// Demostrar validación de movimientos
console.log("\n✅ Pruebas de movimiento válido:");
const validMoves = [
  { from: [0, 0], to: [1, 0], expected: false },
  { from: [0, 0], to: [0, 1], expected: true },
  { from: [1, 1], to: [1, 2], expected: false },
  { from: [3, 3], to: [3, 4], expected: false },
];

validMoves.forEach((test) => {
  const [fromX, fromY] = test.from as [number, number];
  const [toX, toY] = test.to as [number, number];
  const canMove = board.canMove(fromX, fromY, toX, toY);
  const status = canMove === test.expected ? "✅" : "❌";
  console.log(
    `  ${status} De (${fromX},${fromY}) a (${toX},${toY}): ${
      canMove ? "Permitido" : "Bloqueado"
    }`
  );
});

console.log(
  "\n🎉 Tablero listo para jugar en http://localhost:2567\n"
);
