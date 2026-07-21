# 🤖 INSTRUCCIÓN DIRECTA PARA LA IA — DEV C

> **PROMPT DE ACTIVACIÓN:** 
> "Actúa como un desarrollador Frontend/Fullstack especializado en Interfaces de Usuario, conexión de sockets (Colyseus.js) e integración con Supabase. Tu objetivo es crear la UI, la sala de espera y la persistencia de victorias para 'El Laberinto Mágico'. Lee @PROJECT_CONTEXT.md para sincronizar las variables."

---

## 🎯 ARCHIVOS PERMITIDOS (LÍMITE DE ESCRITURA)
Solo puedes crear o modificar los siguientes archivos:
- `client/src/scenes/LobbyScene.ts`
- `client/src/scenes/UIScene.ts`
- `client/src/services/supabase.ts`

---

## 📋 HISTORIAS DE USUARIO A CUMPLIR
- **US-02:** Configuración de partida (2, 3 o 4 jugadores) y asignación de nombre/color.
- **US-03:** Botón e interfaz del dado con el resultado en pantalla.
- **US-06 / US-08:** HUD del símbolo activo actual e inventario de fichas recolectadas por jugador.
- **US-07:** Indicador visual claro de de quién es el turno activo.
- **US-10:** Modal de fin de juego y guardado del resultado en Supabase.
- **US-11:** Botón de "Nueva Partida" para reiniciar.

---

## 🛠️ INSTRUCCIONES PASO A PASO DE IMPLEMENTACIÓN

### Paso 1: `client/src/scenes/LobbyScene.ts`
1. Interfaz de entrada:
   - Input para nombre de jugador.
   - Selector de cantidad de jugadores (2, 3 o 4).
   - Selector de color de peón ('rojo', 'azul', 'amarillo', 'verde') deshabilitando los ocupados.
2. Botón "Iniciar / Unirse":
   - Conecta a Colyseus: `client.joinOrCreate("laberinto_room", { name, color })`.
3. Pantalla de espera:
   - Muestra la lista de jugadores conectados y cambia automáticamente a la escena principal cuando `room.state.status == 'PLAYING'`.

### Paso 2: `client/src/scenes/UIScene.ts`
1. **Banner de Turno:**
   - Muestra un panel superior: "Turno de: [Nombre Jugador]" resaltado con su color correspondiente.
2. **Control del Dado:**
   - Botón "Tirar Dado", habilitado únicamente cuando sea el turno del cliente local y `remainingMoves == 0`.
   - Al hacer click, envía `room.send("rollDice")`.
   - Renderiza el valor del dado arrojado.
3. **Panel del Símbolo Activo Objetivo:**
   - Recuadro visible lateral mostrando la ficha `activeSymbolId` que se debe recolectar actualmente.
4. **Tabla de Posiciones / Score:**
   - Lista con el progreso de cada jugador (ej: `Nombre: 3/5 Fichas`).

### Paso 3: `client/src/services/supabase.ts`
1. Inicializa el cliente de Supabase (`@supabase/supabase-js`).
2. Exporta `saveMatchResult(winnerName: string, totalPlayers: number)`:
   - Inserta un registro en la tabla `matches` con `{ winner_name, total_players, played_at: new Date() }`.

### Paso 4: Integración de Estado y Fin de Partida
1. Escucha cambios en el estado de Colyseus desde `UIScene.ts`:
   - `room.state.listen("currentTurnPlayerId")`: Actualiza el banner de turno y estado del botón Dado.
   - `room.state.listen("activeSymbolId")`: Actualiza el gráfico del símbolo objetivo.
   - `room.state.listen("status")`: Si pasa a `'FINISHED'`:
     - Muestra modal de Victoria con el nombre del ganador.
     - Ejecuta `saveMatchResult()`.
     - Despliega botón "Nueva Partida" (US-11) para limpiar la escena y regresar a `LobbyScene`.