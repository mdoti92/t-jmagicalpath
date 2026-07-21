# 🤖 INSTRUCCIÓN DIRECTA PARA LA IA — DEV A

> **PROMPT DE ACTIVACIÓN:** 
> "Actúa como un desarrollador Senior Backend especializado en Colyseus y Node.js. Tu objetivo es implementar toda la lógica del servidor para el juego 'El Laberinto Mágico' según la especificación a continuación. Lee @PROJECT_CONTEXT.md para respetar los tipos y nombres del estado."

---

## 🎯 ARCHIVOS PERMITIDOS (LÍMITE DE ESCRITURA)
Solo puedes crear o modificar los siguientes archivos:
- `server/src/rooms/schema/GameState.ts`
- `server/src/rooms/GameRoom.ts`

---

## 📋 HISTORIAS DE USUARIO A CUMPLIR
- **US-01 / US-05:** Configuración de 19 muros fijos e invisibles (`HARDCODED_WALLS`). Choque de muro reinicia al peón a su esquina y pasa turno.
- **US-02 / US-07:** Gestión de estado de jugadores y turnos circulares.
- **US-03:** Dado con caras [1, 2, 2, 3, 3, 4].
- **US-04:** Movimiento ortogonal ortogonal continuo sin retroceder en el mismo turno.
- **US-06 / US-08 / US-2b:** Bolsa de 24 símbolos (0-23) mezclados al inicio, revelación de símbolo activo y suma de puntos.
- **US-09:** Caso especial: Si un peón ya está parado sobre el nuevo símbolo al revelarse, lo obtiene automáticamente.
- **US-10:** Condición de victoria al llegar a 5 puntos.

---

## 🛠️ INSTRUCCIONES PASO A PASO DE IMPLEMENTACIÓN

### Paso 1: `server/src/rooms/schema/GameState.ts`
1. Define las clases `Player` y `GameState` utilizando `@colyseus/schema` tal como se especifica en `@PROJECT_CONTEXT.md`.
2. Exporta `HARDCODED_WALLS`: Array con exactamente 19 objetos `{x1, y1, x2, y2}`. Asegura que ninguna casilla quede completamente aislada (mínimo 1 acceso libre por celda).
3. Exporta `BOARD_SYMBOLS`: Matriz 6x6 que distribuye equitativamente los IDs de símbolo del 0 al 23 en el tablero.

### Paso 2: `server/src/rooms/GameRoom.ts`
1. **`onCreate()`**:
   - Inicializa `this.setState(new GameState())`.
   - Llena `bag` con los números 0 al 23 y mézclalos con Fisher-Yates.
   - Extrae el primer valor de `bag` hacia `activeSymbolId`.
2. **Handler `"rollDice"`**:
   - Valida que `client.sessionId == state.currentTurnPlayerId` y `remainingMoves == 0`.
   - Selecciona un valor aleatorio del arreglo `[1, 2, 2, 3, 3, 4]`.
   - Asigna el valor a `state.diceValue` y `state.remainingMoves`.
3. **Handler `"movePawn"` (payload: `{ targetX, targetY }`)**:
   - Valida que sea el turno del emisor y `remainingMoves > 0`.
   - Valida movimiento ortogonal (distancia Manhattan $|x_1 - x_2| + |y_1 - y_2| == 1$).
   - Revisa si la arista `(currentX, currentY) -> (targetX, targetY)` existe en `HARDCODED_WALLS`.
   - **SI HAY MURO:**
     - Resetea `player.x = player.startX` y `player.y = player.startY`.
     - `state.remainingMoves = 0`.
     - `this.send(client, "WALL_HIT", { playerId: player.id })`.
     - Executa `this.nextTurn()`.
   - **SI NO HAY MURO:**
     - Actualiza `player.x = targetX` y `player.y = targetY`.
     - Decrementa `state.remainingMoves--`.
     - Ejecuta `this.checkSymbolCollection(player)`.
     - Si `state.remainingMoves == 0`, ejecuta `this.nextTurn()`.
4. **`checkSymbolCollection(player)`**:
   - Verifica si la casilla `(player.x, player.y)` en `BOARD_SYMBOLS` coincide con `state.activeSymbolId`.
   - Si coincide:
     - `player.score++`.
     - `state.remainingMoves = 0`.
     - Si `player.score >= 5`: Llama a `this.endGame(player)`.
     - De lo contrario: Llama a `this.revealNextSymbol()` y luego `this.nextTurn()`.
5. **`revealNextSymbol()`**:
   - Si `bag` está vacía, coloca `state.activeSymbolId = -1` y retorna.
   - Extrae la siguiente ficha de `bag` a `activeSymbolId`.
   - **Chequeo US-09:** Si algún jugador en la sala ya está en la coordenada del nuevo `activeSymbolId`, ese jugador suma punto inmediatamente (`player.score++`), evalúa victoria, y si no gana, invoca de nuevo `this.revealNextSymbol()` recursivamente.
6. **`nextTurn()`**:
   - Cambia `currentTurnPlayerId` al siguiente jugador en la lista circular de `players`.
   - Resetea `state.remainingMoves = 0` y `state.diceValue = 0`.
7. **`endGame(winner)`**:
   - Asigna `state.status = 'FINISHED'` y `state.winnerId = winner.id`.