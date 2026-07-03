# Guía de Implementación: User Story Tirar el Dado

## 📋 Resumen

Esta guía te ayudará a integrar la funcionalidad de tirar el dado en tu proyecto de "El Laberinto Mágico" usando Phaser4 y Coliseum.

## 📁 Archivos Creados

```
server/
├── src/
│   ├── services/
│   │   ├── DiceService.ts          # Lógica del dado
│   │   └── DiceService.test.ts     # Tests unitarios
│   ├── events/
│   │   └── DiceEvents.ts           # Definiciones de eventos
│   └── handlers/
│       └── DiceRoomHandler.ts      # Lógica en la sala de Coliseum

client/
├── src/
│   └── scenes/
│       └── DiceRollScene.ts        # Escena visual de Phaser4

tests/
└── features/
    └── dice_roll.feature           # Especificación BDD

USER_STORY_DICE_ROLL.md             # Este documento
```

## 🚀 Pasos de Integración

### 1. Server Side - Integrar DiceRoomHandler en MyRoom.ts

```typescript
// server/src/rooms/MyRoom.ts
import { Room, Client } from "colyseus";
import { DiceRoomHandler } from "../handlers/DiceRoomHandler";
import { DiceEvents, DiceRolledMessage } from "../events/DiceEvents";

export class MyRoom extends Room {
  private diceHandler: DiceRoomHandler = new DiceRoomHandler();
  private activePlayerId: string = "";

  onCreate() {
    // ... tu código existente ...
    
    // Inicializar handlers de dado
    this.onMessage(DiceEvents.CLIENT_EVENTS.ROLL_DICE_REQUEST, (client, data) => {
      this.handleDiceRoll(client);
    });
  }

  onJoin(client: Client) {
    // ... tu código existente ...
    
    // Inicializar estado del dado para el jugador
    this.diceHandler.initializePlayerDiceState(client.sessionId);
  }

  private handleDiceRoll(client: Client) {
    const isActive = client.sessionId === this.activePlayerId;
    
    const result = this.diceHandler.handleDiceRollRequest(
      client.sessionId,
      isActive
    );

    if (result.success) {
      // Obtener nombre del jugador (ajusta según tu estructura de datos)
      const playerName = this.getPlayerName(client.sessionId);

      const message: DiceRolledMessage = {
        playerId: client.sessionId,
        playerName,
        diceValue: result.value!,
        timestamp: Date.now(),
      };

      // Enviar a todos los jugadores
      this.broadcast(DiceEvents.SERVER_EVENTS.DICE_ROLLED, message);
    } else {
      // Enviar error al jugador
      client.send(DiceEvents.SERVER_EVENTS.DICE_ROLL_FAILED, {
        message: result.message,
      });
    }
  }

  private getPlayerName(playerId: string): string {
    // Implementar según tu estructura de datos de jugadores
    return `Player ${playerId.substring(0, 4)}`;
  }

  // Cuando cambia el turno
  nextTurn(newActivePlayerId: string) {
    // Reiniciar estado del dado para el nuevo turno
    this.diceHandler.resetDiceStateForNewTurn(newActivePlayerId);
    this.activePlayerId = newActivePlayerId;
  }
}
```

### 2. Client Side - Integrar DiceRollScene en el juego

```typescript
// client/src/main.ts o tu archivo de configuración de Phaser
import { DiceRollScene } from "./scenes/DiceRollScene";

const config: Phaser.Types.Core.GameConfig = {
  // ... tu configuración existente ...
  scene: [
    // ... tus otras escenas ...
    DiceRollScene,
  ],
};

const game = new Phaser.Game(config);
```

### 3. Conectar la Escena con Coliseum

```typescript
// En tu escena principal (BoardScene.ts)
import { DiceRollScene } from "./DiceRollScene";
import { DiceEvents } from "../events/DiceEvents";

export class BoardScene extends Phaser.Scene {
  private diceScene!: DiceRollScene;

  create() {
    // ... tu código existente ...

    // Lanzar la escena DiceRoll en paralelo
    this.scene.launch("DiceRollScene", {
      config: {
        animationDuration: 1500,
        resultDisplayDuration: 3000,
        diceSize: 100,
      },
      onDiceRolled: (value: number) => {
        this.handleDiceResult(value);
      },
    });

    // Obtener referencia a la escena del dado
    this.diceScene = this.scene.get("DiceRollScene") as DiceRollScene;

    // Conectar con Coliseum
    this.room.onMessage(DiceEvents.SERVER_EVENTS.DICE_ROLLED, (message) => {
      this.handleDiceRolledFromServer(message);
    });

    this.room.onMessage(
      DiceEvents.SERVER_EVENTS.DICE_ROLL_FAILED,
      (message) => {
        this.showError(message.message);
      }
    );
  }

  private handleDiceResult(value: number) {
    // El jugador local ha tirado el dado
    // Enviar confirmación al servidor
    this.room.send(DiceEvents.CLIENT_EVENTS.DICE_ROLL_ACK, {
      value,
      playerId: this.room.sessionId,
    });
  }

  private handleDiceRolledFromServer(message: DiceRolledMessage) {
    // Otro jugador tiró el dado o el turno cambió
    console.log(
      `${message.playerName} tiró: ${message.diceValue}`
    );

    // Si no es nuestro turno, deshabilitar el botón
    if (message.playerId !== this.room.sessionId) {
      this.diceScene?.setPlayerActive(false);
    } else {
      this.diceScene?.setPlayerActive(true);
    }
  }

  // Llamar cuando sea el turno del jugador
  setPlayerTurn(playerId: string) {
    const isActive = playerId === this.room.sessionId;
    this.diceScene?.setPlayerActive(isActive);
  }
}
```

### 4. Hacer la Solicitud de Tirada desde el Botón

```typescript
// En DiceRollScene.ts - actualizar handleDiceButtonClick()
private handleDiceButtonClick(): void {
  if (this.isRolling || !this.isPlayerActive) {
    return;
  }

  // Enviar solicitud al servidor ANTES de animar
  if (this.room) {
    this.room.send(DiceEvents.CLIENT_EVENTS.ROLL_DICE_REQUEST, {});
  }

  // La animación se ejecutará cuando el servidor responda
  this.rollDice();
}
```

## 🧪 Ejecutar Tests

```bash
# Instalar dependencias (si no lo has hecho)
cd server
npm install

# Ejecutar tests unitarios
npm test -- DiceService.test.ts

# Con cobertura
npm test -- DiceService.test.ts --coverage
```

## 📊 Estructura de Datos

### DiceRolledMessage (del servidor)
```typescript
{
  playerId: string;           // ID de la sesión del jugador
  playerName: string;         // Nombre del jugador
  diceValue: number;          // 1, 2, 3 o 4
  timestamp: number;          // Timestamp Unix
}
```

### ClientEvents
- `rollDiceRequest`: Solicitud del cliente para tirar
- `diceRollAck`: Confirmación de la tirada

### ServerEvents
- `diceRolled`: Broadcast a todos cuando alguien tira
- `diceRollFailed`: Error en la tirada
- `invalidDiceRoll`: Valor inválido (no debería ocurrir)

## 🎮 Flujo de Juego Completo

```
1. Es el turno del Jugador A
   ├─ BoardScene: `setPlayerTurn("playerA")`
   └─ DiceRollScene: Botón habilitado (verde)

2. Jugador A hace clic en "Tirar Dado"
   ├─ DiceRollScene: Envía `rollDiceRequest` a servidor
   └─ Animación comienza localmente

3. Servidor valida la solicitud
   ├─ Verifica que sea turno del Jugador A
   ├─ Llama a DiceService.rollDice()
   └─ Broadcast `diceRolled` a todos

4. Todos los clientes reciben `diceRolled`
   ├─ Actualiza UI con el resultado
   ├─ Espera 3 segundos
   └─ BoardScene puede iniciar movimiento

5. Turno termina
   ├─ DiceRoomHandler.resetDiceStateForNewTurn()
   └─ Siguiente jugador puede tirar

```

## 🔄 Sincronización Multiplayer

- El servidor es la **fuente de verdad**
- El cliente solo solicita tirar (no genera número)
- El servidor valida y broadcast el resultado
- Todos los clientes ven el mismo resultado
- Sincronización automática si hay desconexión

## ⚙️ Configuración Personalizable

Puedes ajustar en `DiceRollConfig`:

```typescript
interface DiceRollConfig {
  animationDuration?: number;      // Default: 1500ms
  resultDisplayDuration?: number;  // Default: 3000ms
  diceSize?: number;               // Default: 100px
}
```

## 🐛 Debugging

### Ver logs del servidor
```typescript
console.log("Dice roll result:", result);
console.log("Player state:", this.diceHandler.getLastRollValue(playerId));
```

### Ver logs del cliente
```typescript
room.onMessage(DiceEvents.SERVER_EVENTS.DICE_ROLLED, (message) => {
  console.log("Dice rolled:", message);
});
```

## ✅ Checklist de Implementación

- [ ] Copiar archivos a sus ubicaciones correctas
- [ ] Integrar DiceRoomHandler en MyRoom.ts
- [ ] Registrar DiceRollScene en configuración de Phaser
- [ ] Conectar handlers de eventos en BoardScene
- [ ] Implementar `getPlayerName()` según tu estructura
- [ ] Ejecutar tests unitarios (cobertura 100%)
- [ ] Probar en modo multijugador (2-4 jugadores)
- [ ] Probar desconexión/reconexión durante tirada
- [ ] Verificar que solo el jugador activo puede tirar
- [ ] Probar en diferentes navegadores

## 📚 Referencias

- [Phaser 4 Docs](https://photonstorm.github.io/phaser4-docs/)
- [Colyseus Docs](https://docs.colyseus.io/)
- [Gherkin Syntax](https://cucumber.io/docs/gherkin/)

## 🆘 Troubleshooting

**P: ¿Por qué otros jugadores ven el botón deshabilitado?**
- R: Verifica que `DiceRollScene.setPlayerActive()` se llame correctamente cuando cambia el turno.

**P: ¿Cómo evito que se tire dos veces?**
- R: El servidor valida `hasRolledThisTurn` y rechaza tiradas duplicadas.

**P: ¿El resultado no se sincroniza?**
- R: Asegúrate de usar `room.broadcast()` en lugar de `client.send()`.

---

¡Listo para jugar! 🎲🧙‍♂️
