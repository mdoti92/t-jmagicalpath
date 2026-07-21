# 🤖 INSTRUCCIÓN DIRECTA PARA LA IA — DEV B

> **PROMPT DE ACTIVACIÓN:** 
> "Actúa como un desarrollador Frontend Senior especializado en Phaser 3/4 y animaciones en TypeScript. Tu objetivo es implementar la capa visual del tablero, sprites de peones y animaciones para 'El Laberinto Mágico'. Lee @PROJECT_CONTEXT.md para sincronizar las dimensiones e interfaces."

---

## 🎯 ARCHIVOS PERMITIDOS (LÍMITE DE ESCRITURA)
Solo puedes crear o modificar los siguientes archivos:
- `client/src/scenes/BoardScene.ts`
- `client/src/managers/PawnManager.ts`
- `client/src/managers/EffectsManager.ts`

---

## 📋 HISTORIAS DE USUARIO A CUMPLIR
- **US-01:** Renderizado claro del tablero 6x6 con sus símbolos mágicos. Los muros NO se dibujan (invisibles).
- **US-04:** Animación de movimiento fluido del peón casilla por casilla.
- **US-05:** Animación de choque con muro (sacudida, texto "¡MURO!" y retorno a la esquina).
- **US-06:** Feedback visual al recolectar un símbolo mágico.

---

## 🛠️ INSTRUCCIONES PASO A PASO DE IMPLEMENTACIÓN

### Paso 1: `client/src/scenes/BoardScene.ts`
1. Renderiza un tablero de 6x6 casillas (tamaño 80x80px por celda) centrado en pantalla.
2. Dibuja sobre cada celda un ícono o representación visual de su símbolo según la matriz `BOARD_SYMBOLS`.
3. **REGLA ESTRICTA:** No dibujes líneas de muros bajo ninguna circunstancia.
4. Implementa y exporta métodos de conversión:
   - `gridToPixel(gridX, gridY)`: Retorna coordenadas `{ x, y }` en píxeles.
   - `pixelToGrid(pixelX, pixelY)`: Retorna la casilla `{ gridX, gridY }`.

### Paso 2: `client/src/managers/PawnManager.ts`
1. Administra los Sprites de los peones por `playerId`.
2. **`createPawn(scene, playerId, color, gridX, gridY)`**:
   - Crea el sprite del peón usando el color correspondiente (`'rojo'`, `'azul'`, `'amarillo'`, `'verde'`).
   - Posiciónalo en canvas mediante `gridToPixel`.
3. **`movePawnSmooth(scene, playerId, gridX, gridY, onComplete)`**:
   - Desplaza el peón suavemente usando `scene.tweens.add` con una duración de 250ms.
4. **Manejo de superposición:**
   - Si más de un peón coincide en `(gridX, gridY)`, aplica un pequeño offset visual (+8px, -8px) para mantener todos los peones visibles.

### Paso 3: `client/src/managers/EffectsManager.ts`
1. **`playWallCollisionAnimation(scene, pawnSprite, startGridX, startGridY, onComplete)`**:
   - Aplica un efecto de vibración/shake o parpadeo rojo al peón.
   - Crea un texto flotante temporal ("¡BOOM! Muro") que se eleva y desvanece.
   - Realiza un Tween de regreso rápido del peón hacia la posición de inicio `(startGridX, startGridY)`.
   - Invoca `onComplete()` al finalizar.
2. **`playCollectSymbolAnimation(scene, pixelX, pixelY)`**:
   - Emite un destello de luz o efecto de partículas escalar sobre la casilla.

### Paso 4: Sincronización en `BoardScene.ts`
1. Escucha eventos de Colyseus:
   - `room.state.players.onAdd`: Ejecuta `pawnManager.createPawn`.
   - `player.onChange`: Si la coordenada cambia, invoca `pawnManager.movePawnSmooth`.
   - `room.onMessage("WALL_HIT")`: Invoca `effectsManager.playWallCollisionAnimation`.
2. Interacción de click:
   - Captura clics en el canvas, convierte a `(gridX, gridY)` y envía `room.send("movePawn", { targetX, targetY })`.