/**
 * EXAMPLE: Integración Rápida del Sistema de Dado
 * 
 * Este archivo muestra ejemplos reales de cómo integrar el sistema completo
 * en tu código existente. Copiar y adaptar según tu estructura.
 */

// ============================================================================
// PASO 1: INTEGRACIÓN EN SERVER (MyRoom.ts)
// ============================================================================

import { Room, Client } from "colyseus";
import { DiceRoomHandler } from "../handlers/DiceRoomHandler";
import { DiceEvents, DiceRolledMessage } from "../events/DiceEvents";

export class MyRoom extends Room {
  private diceHandler: DiceRoomHandler = new DiceRoomHandler();
  private activePlayerId: string = "";
  private players: Map<string, { name: string; score: number }> = new Map();

  onCreate(): void {
    this.setMetadata({ name: "Laberinto Mágico" });

    // ⭐ Escuchar solicitud de tirar dado
    this.onMessage(DiceEvents.CLIENT_EVENTS.ROLL_DICE_REQUEST, (client) => {
      console.log(`[DICE] ${client.sessionId} solicita tirar dado`);
      this.handleDiceRoll(client);
    });
  }

  onJoin(client: Client, options: any): void {
    // Guardar jugador
    this.players.set(client.sessionId, {
      name: options.playerName || `Player${Math.random().toString(36).substring(7)}`,
      score: 0,
    });

    // ⭐ Inicializar estado del dado
    this.diceHandler.initializePlayerDiceState(client.sessionId);

    console.log(`[JOIN] ${client.sessionId} se unió`);

    // Si es el primer jugador, es activo
    if (this.activePlayerId === "") {
      this.activePlayerId = client.sessionId;
    }
  }

  // ⭐ Método principal para manejar tirada de dado
  private handleDiceRoll(client: Client): void {
    const isActive = client.sessionId === this.activePlayerId;
    const playerName = this.players.get(client.sessionId)?.name || "Unknown";

    // Validar y tirar el dado en el servidor
    const result = this.diceHandler.handleDiceRollRequest(
      client.sessionId,
      isActive
    );

    if (result.success && result.value !== undefined) {
      // ✅ Tirada exitosa
      console.log(
        `[DICE-SUCCESS] ${playerName} tiró: ${result.value}`
      );

      const message: DiceRolledMessage = {
        playerId: client.sessionId,
        playerName,
        diceValue: result.value,
        timestamp: Date.now(),
      };

      // 📢 Broadcast a TODOS los jugadores
      this.broadcast(DiceEvents.SERVER_EVENTS.DICE_ROLLED, message);
    } else {
      // ❌ Tirada rechazada
      console.log(
        `[DICE-FAILED] ${playerName}: ${result.message}`
      );

      client.send(DiceEvents.SERVER_EVENTS.DICE_ROLL_FAILED, {
        message: result.message,
        timestamp: Date.now(),
      });
    }
  }

  // ⭐ Llamar cuando termina un turno y pasa al siguiente jugador
  nextTurn(newActivePlayerId: string): void {
    console.log(`[TURN] Nuevo turno para: ${newActivePlayerId}`);

    // Reiniciar estado del dado para el nuevo turno
    this.diceHandler.resetDiceStateForNewTurn(newActivePlayerId);
    this.activePlayerId = newActivePlayerId;

    // Notificar a todos los clientes que cambió de turno
    this.broadcast("turnChanged", {
      activePlayerId: newActivePlayerId,
      playerName: this.players.get(newActivePlayerId)?.name,
    });
  }

  onLeave(client: Client): void {
    console.log(`[LEAVE] ${client.sessionId} se desconectó`);
    this.players.delete(client.sessionId);
  }
}

// ============================================================================
// PASO 2: INTEGRACIÓN EN CLIENT - BoardScene.ts
// ============================================================================

import Phaser from "phaser";
import { Client, Room } from "colyseus";
import { DiceRollScene } from "./DiceRollScene";
import { DiceEvents, DiceRolledMessage } from "../events/DiceEvents";

export class BoardScene extends Phaser.Scene {
  private room!: Room;
  private diceScene!: DiceRollScene;
  private currentPlayerTurn!: string;

  constructor() {
    super("BoardScene");
  }

  create(): void {
    const { width, height } = this.scale;

    // Crear tablero visual
    this.createBoardUI();

    // ⭐ Lanzar la escena del dado
    this.scene.launch("DiceRollScene", {
      config: {
        animationDuration: 1500,
        resultDisplayDuration: 3000,
        diceSize: 100,
      },
      onDiceRolled: (value: number) => {
        this.handleLocalDiceRoll(value);
      },
    });

    // ⭐ Obtener referencia a la escena del dado
    this.diceScene = this.scene.get("DiceRollScene") as DiceRollScene;

    // ⭐ Conectar listeners de eventos de Colyseum
    this.setupDiceEventListeners();
    this.setupTurnEventListeners();

    // Inicializar estado
    this.currentPlayerTurn = this.room.sessionId;
  }

  // ⭐ Configurar listeners para eventos del dado
  private setupDiceEventListeners(): void {
    // Cuando alguien tira el dado (broadcast)
    this.room.onMessage(DiceEvents.SERVER_EVENTS.DICE_ROLLED, (message: DiceRolledMessage) => {
      console.log(`[DICE-RECEIVED] ${message.playerName} tiró: ${message.diceValue}`);

      // Actualizar UI para mostrar quién tiró y qué sacó
      this.displayDiceResult(message);

      // Si no es nuestro turno, deshabilitar botón
      if (message.playerId !== this.room.sessionId) {
        this.diceScene?.setPlayerActive(false);
      } else {
        this.diceScene?.setPlayerActive(true);
      }
    });

    // Cuando falla la tirada
    this.room.onMessage(
      DiceEvents.SERVER_EVENTS.DICE_ROLL_FAILED,
      (message: { message: string }) => {
        console.error(`[DICE-ERROR] ${message.message}`);
        this.showNotification(`Error: ${message.message}`, "error");
      }
    );
  }

  // ⭐ Configurar listeners para cambios de turno
  private setupTurnEventListeners(): void {
    this.room.onMessage("turnChanged", (data: { activePlayerId: string; playerName: string }) => {
      console.log(`[TURN-CHANGED] Es el turno de: ${data.playerName}`);
      this.currentPlayerTurn = data.activePlayerId;

      // Actualizar estado visual
      this.updateTurnUI(data);

      // ⭐ Habilitar/deshabilitar botón del dado
      const isMyTurn = data.activePlayerId === this.room.sessionId;
      this.diceScene?.setPlayerActive(isMyTurn);
    });
  }

  // ⭐ Cuando el cliente hace clic en el botón de tirar
  private handleLocalDiceRoll(value: number): void {
    console.log(`[LOCAL-ROLL] Yo tiré: ${value}`);

    // El servidor ya procesó y broadcast el evento
    // Aquí puedes hacer acciones locales adicionales
    this.animatePlayerMovement(value);
  }

  // Mostrar resultado en pantalla
  private displayDiceResult(message: DiceRolledMessage): void {
    const notification = `${message.playerName} tiró: ${message.diceValue}`;
    this.showNotification(notification, "info");
  }

  // Actualizar UI cuando cambia el turno
  private updateTurnUI(data: { activePlayerId: string; playerName: string }): void {
    const turnText = this.add.text(100, 50, `Turno: ${data.playerName}`, {
      fontSize: "24px",
      color: "#ffffff",
    });
  }

  // Mostrar notificación temporal
  private showNotification(
    message: string,
    type: "info" | "error" | "success"
  ): void {
    const colors = {
      info: 0x2196F3,
      error: 0xF44336,
      success: 0x4CAF50,
    };

    const notification = this.add.text(this.scale.width / 2, 100, message, {
      fontSize: "20px",
      color: "#ffffff",
      backgroundColor: `#${colors[type].toString(16)}`,
      padding: { x: 20, y: 10 },
    });
    notification.setOrigin(0.5);

    this.tweens.add({
      targets: notification,
      alpha: 0,
      duration: 2000,
      delay: 1000,
      onComplete: () => notification.destroy(),
    });
  }

  // Animar movimiento del peón (ejemplo)
  private animatePlayerMovement(diceValue: number): void {
    console.log(`[MOVE] Puedo mover ${diceValue} casillas`);
    // Aquí implementarías la lógica de movimiento
    // del peón según el resultado del dado
  }

  private createBoardUI(): void {
    // Crear elementos visuales del tablero
    // ... tu código existente ...
  }
}

// ============================================================================
// PASO 3: CONFIGURACIÓN EN MAIN.ts
// ============================================================================

import Phaser from "phaser";
import { DiceRollScene } from "./scenes/DiceRollScene";
import { BoardScene } from "./scenes/BoardScene";

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1024,
    height: 768,
  },
  // ⭐ Registrar la escena del dado
  scene: [
    BoardScene,
    DiceRollScene,  // ← IMPORTANTE: Agregar aquí
    // ... otras escenas ...
  ],
};

const game = new Phaser.Game(gameConfig);

// ============================================================================
// PASO 4: USO EN TYPESCRIPT
// ============================================================================

// Ejemplo de cómo usar el DiceService directamente (testing/debugging)
import { DiceService } from "../services/DiceService";

// Tirar un dado
const result = DiceService.rollDice();
console.log("Resultado:", result.value); // Output: 1, 2, 3 o 4

// Simular 100 tiradas
const rolls = DiceService.simulateMultipleRolls(100);
const stats = DiceService.getStatistics(rolls);
console.log("Estadísticas:", stats); 
// Output: { 1: ~17, 2: ~33, 3: ~33, 4: ~17 }

// Validar un valor
if (DiceService.isValidDiceValue(3)) {
  console.log("Es un valor válido");
}

// Obtener probabilidad
console.log(DiceService.getProbability(2)); // Output: 33.33333333333333

// ============================================================================
// PASO 5: FLUJO COMPLETO DE UN TURNO
// ============================================================================

/*

TURNO DEL JUGADOR A:
├─ Server: Establece activePlayerId = A
├─ Broadcast: turnChanged { A, "PlayerA" }
│
├─ Cliente A:
│  ├─ Recibe turnChanged
│  └─ DiceScene.setPlayerActive(true) ✅ Botón Verde
│
├─ Cliente B:
│  ├─ Recibe turnChanged
│  └─ DiceScene.setPlayerActive(false) ❌ Botón Gris
│
JUGADOR A TIRA DADO:
├─ Cliente A: Hace clic en botón
├─ Cliente A: Envía rollDiceRequest
│
├─ Server:
│  ├─ Valida: isActive = true ✓, hasRolledThisTurn = false ✓
│  ├─ DiceService.rollDice() → 3
│  └─ Broadcast: diceRolled { A, "PlayerA", 3 }
│
├─ Cliente A:
│  ├─ Recibe diceRolled
│  ├─ DiceScene: Muestra resultado "3"
│  └─ BoardScene: Habilita movimiento
│
├─ Cliente B:
│  ├─ Recibe diceRolled
│  └─ UI: Muestra "PlayerA tiró: 3"

JUGADOR A TERMINA TURNO:
├─ Server: nextTurn("B")
├─ Server: diceHandler.resetDiceStateForNewTurn("B")
│
└─ Repeats para Player B...

*/

// ============================================================================
// PASO 6: DEBUGGING
// ============================================================================

// En la consola del navegador, puedes hacer:

// Ver si el dado está generando resultados válidos
for (let i = 0; i < 20; i++) {
  console.log(DiceService.rollDice());
}

// Ver distribución después de 1000 tiradas
const largeRoll = DiceService.simulateMultipleRolls(1000);
console.log("Estadísticas de 1000 tiradas:", DiceService.getStatistics(largeRoll));

// ============================================================================
// PASO 7: TESTING CON JEST
// ============================================================================

// Ejecutar en terminal:
// npm test -- DiceService.test.ts

// Ver cobertura:
// npm test -- DiceService.test.ts --coverage

// Ver un test específico:
// npm test -- DiceService.test.ts -t "debe retornar un valor válido"

/**
 * Con esta estructura, tu juego tendrá:
 * ✅ Sistema de dado totalmente funcional
 * ✅ Sincronización en tiempo real
 * ✅ Validación en servidor (seguro)
 * ✅ UI responsiva y visual
 * ✅ Manejo de errores
 * ✅ Escalable a 2-4 jugadores
 */
