# 🧙 El Laberinto Mágico — Contexto del Proyecto

## 🛠️ Tech Stack & Comandos
- **Client:** Phaser 3/4 + TypeScript
- **Server:** Colyseus + Node.js (TypeScript)
- **Database:** Supabase
- **Run Server:** `npm run start:server`
- **Run Client:** `npm run start:client`

---

## 📐 Contrato de Datos Compartido (Fuente de Verdad)
> **REGLA DE ORO:** Ningún modelo de IA puede cambiar estos nombres de propiedades.

### Posiciones y Muros
- Tablero: Grilla `6x6` (coordenadas `x: 0..5`, `y: 0..5`).
- Muros fijos (`HARDCODED_WALLS`): `{ x1, y1, x2, y2 }` (Representa la arista entre dos celdas adyacentes).
- Esquinas iniciales:
  - Jugador 1 (Rojo): `(0,0)`
  - Jugador 2 (Azul): `(5,5)`
  - Jugador 3 (Amarillo): `(0,5)`
  - Jugador 4 (Verde): `(5,0)`

### Colyseus Schema (`GameState`)
- `players`: MapSchema<Player>
  - `id`: string
  - `name`: string
  - `color`: 'rojo' | 'azul' | 'amarillo' | 'verde'
  - `x`: number, `y`: number
  - `startX`: number, `startY`: number
  - `score`: number
- `currentTurnPlayerId`: string
- `diceValue`: number (Valores posibles: 1, 2, 2, 3, 3, 4)
- `remainingMoves`: number
- `activeSymbolId`: number (0 a 23)
- `bag`: ArraySchema<number>
- `status`: 'LOBBY' | 'PLAYING' | 'FINISHED'

---

## 📁 Estructura de Archivos y Responsabilidades
- `server/src/rooms/GameRoom.ts` -> Lógica del servidor, validación de movimiento, muros y victorias. (Dev A)
- `server/src/rooms/schema/GameState.ts` -> Schemas de Colyseus. (Dev A)
- `client/src/scenes/BoardScene.ts` -> Renderizado visual del tablero y grilla. (Dev B)
- `client/src/managers/PawnManager.ts` -> Sprites de los peones y animaciones. (Dev B)
- `client/src/scenes/LobbyScene.ts` -> Selección de jugador, color y conexión. (Dev C)
- `client/src/scenes/UIScene.ts` -> HUD (Dado, Turno activo, Símbolo objetivo, Marcador). (Dev C)

---

## 📌 Estado Actual del Desarrollo (Checklist Vivo)
- [x] Contrato de datos definido
- [ ] Servidor: Schemas e inicialización de bolsa (Dev A)
- [ ] Servidor: Movimiento y colisión de muros (Dev A)
- [ ] Cliente: Renderizado de tablero y símbolos (Dev B)
- [ ] Cliente: Animación de movimiento y choque (Dev B)
- [ ] UI: Lobby y HUD (Dev C)
- [ ] Integración Cliente-Servidor (Todos)