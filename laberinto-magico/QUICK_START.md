# 🎲 QUICK START - Sistema de Dado

## ✨ ¿Qué se ha creado?

Una implementación completa de "Tirar el Dado" para El Laberinto Mágico usando **Phaser4** y **Colyseum**.

---

## 📦 Contenido de la Entrega

```
📋 DOCUMENTACIÓN
├── USER_STORY_DICE_ROLL.md          ← La User Story oficial
├── IMPLEMENTATION_GUIDE.md          ← Guía paso a paso de integración
├── ENTREGA_RESUMEN.md               ← Resumen de entregables
├── EXAMPLE_INTEGRATION.ts           ← Ejemplos de código real
└── QUICK_START.md                   ← Este archivo

💻 CÓDIGO - BACKEND
├── server/src/services/DiceService.ts       ← Lógica del dado
├── server/src/services/DiceService.test.ts  ← Tests (20+ tests, 100% cobertura)
├── server/src/events/DiceEvents.ts          ← Eventos y tipos
└── server/src/handlers/DiceRoomHandler.ts   ← Manejo en Colyseum

🎮 CÓDIGO - FRONTEND
└── client/src/scenes/DiceRollScene.ts       ← Escena visual en Phaser

🧪 TESTING
└── tests/features/dice_roll.feature         ← Especificación BDD (7 escenarios)
```

---

## 🚀 Los 5 Pasos Clave

### 1️⃣ Entender Qué Se Hace
```bash
# Leer la User Story (5 min)
cat USER_STORY_DICE_ROLL.md
```

**Resumen:** El jugador activo tira un dado virtual, ve la animación, y se muestra el resultado (1, 2, 3 o 4).

---

### 2️⃣ Ver Cómo Funciona (Especificación)
```bash
# Leer los escenarios BDD (5 min)
cat tests/features/dice_roll.feature
```

**Resumen:** 7 escenarios que definen exactamente cómo debe comportarse.

---

### 3️⃣ Ejecutar Tests (Validar)
```bash
# Terminal: posicionarse en server/
cd server
npm install  # Solo la primera vez
npm test -- DiceService.test.ts

# Ver cobertura
npm test -- DiceService.test.ts --coverage
```

**Resultado esperado:** ✅ 20+ tests pasando, 100% cobertura

---

### 4️⃣ Entender la Integración
```bash
# Leer ejemplos de código real (10 min)
cat EXAMPLE_INTEGRATION.ts

# Leer guía completa (15 min)
cat IMPLEMENTATION_GUIDE.md
```

**Conceptos clave:**
- Cliente → (rollDiceRequest) → Servidor
- Servidor valida y genera número
- Servidor → (diceRolled broadcast) → Todos
- UI se actualiza para todos

---

### 5️⃣ Integrar en Tu Proyecto
```bash
# 1. Copiar archivos a sus ubicaciones
#    (ver IMPLEMENTATION_GUIDE.md)

# 2. Actualizar MyRoom.ts
#    (ver EXAMPLE_INTEGRATION.ts)

# 3. Actualizar BoardScene.ts
#    (ver EXAMPLE_INTEGRATION.ts)

# 4. Probar multijugador
#    Abre 2 navegadores y juega
```

---

## 🎲 El Dado Especial

| Cara | Valor | Probabilidad | Frecuencia (de 600) |
|------|-------|--------------|---------------------|
| 1    | 1     | 16.67%       | ~100 veces          |
| 2    | 2     | 33.33%       | ~200 veces          |
| 3    | 2     | 33.33%       | ~200 veces          |
| 4    | 3     | 33.33%       | ~200 veces          |
| 5    | 3     | 33.33%       | ~200 veces          |
| 6    | 4     | 16.67%       | ~100 veces          |

**Conclusión:** Es más probable sacar 2 o 3 que 1 o 4.

---

## 🎮 Cómo Funciona en Juego

### Escenario: 2 Jugadores (Rojo y Azul)

```
TURNO 1: Rojo está activo
┌─────────────────────────────────┐
│  [✅ Tirar Dado]  [❌ Espera]    │  ← Azul ve botón deshabilitado
└─────────────────────────────────┘

Rojo hace clic → Animación → Resultado: 3
┌─────────────────────────────────┐
│          SACASTE: 3             │
│    (Puedes mover 3 casillas)    │
└─────────────────────────────────┘

Rojo termina su turno → TURNO 2: Azul es activo
┌─────────────────────────────────┐
│  [❌ Espera]  [✅ Tirar Dado]    │  ← Rojo ve botón deshabilitado
└─────────────────────────────────┘

Azul hace clic → Animación → Resultado: 2
```

---

## 🔧 Puntos de Integración

### En MyRoom.ts (Server)
```typescript
// 1. Importar
import { DiceRoomHandler } from "../handlers/DiceRoomHandler";
import { DiceEvents } from "../events/DiceEvents";

// 2. En onCreate()
this.onMessage(DiceEvents.CLIENT_EVENTS.ROLL_DICE_REQUEST, client => {
  this.handleDiceRoll(client);
});

// 3. En onJoin()
this.diceHandler.initializePlayerDiceState(client.sessionId);

// 4. Cuando cambias turno
this.nextTurn(newActivePlayerId);
```

### En BoardScene.ts (Client)
```typescript
// 1. Crear escena
this.scene.launch("DiceRollScene");

// 2. Escuchar eventos
this.room.onMessage(DiceEvents.SERVER_EVENTS.DICE_ROLLED, msg => {
  console.log(`${msg.playerName} tiró: ${msg.diceValue}`);
});

// 3. Actualizar UI
this.diceScene.setPlayerActive(isMyTurn);
```

---

## 📊 Flujo de Datos

```
CLIENTE A                 SERVIDOR              CLIENTE B
    │                         │                      │
    ├─ rollDiceRequest ──────>│                      │
    │                         │                      │
    │                    Valida turno               │
    │                    DiceService.rollDice()    │
    │                         │                      │
    │<───── diceRolled ────────┼────────> diceRolled │
    │      (broadcast a todos)│                      │
    │                         │                      │
    ├─ Muestra resultado      │      Muestra resultado
    ├─ Habilita movimiento    │      Actualiza UI
```

---

## ✅ Checklist de Integración

```
ANTES DE EMPEZAR:
☐ Leo USER_STORY_DICE_ROLL.md
☐ Leo IMPLEMENTATION_GUIDE.md
☐ Leo EXAMPLE_INTEGRATION.ts

SETUP:
☐ Copio server/src/services/DiceService.ts
☐ Copio server/src/events/DiceEvents.ts
☐ Copio server/src/handlers/DiceRoomHandler.ts
☐ Copio client/src/scenes/DiceRollScene.ts

INTEGRACIÓN:
☐ Actualizo MyRoom.ts con el handler
☐ Actualizo BoardScene.ts con listeners
☐ Actualizo main.ts para registrar escena
☐ Configuro el activePlayerId en MyRoom

TESTING:
☐ Ejecuto: npm test -- DiceService.test.ts
☐ Todos los tests pasan ✅
☐ Cobertura es 100% ✅

JUEGO:
☐ Conecto 2 jugadores
☐ Turno 1 tira → Ve resultado
☐ Turno 2 tira → Ve resultado
☐ Botón deshabilitado cuando no es turno
☐ Validación de servidor funciona

BONUS:
☐ Manejo de desconexión/reconexión
☐ Sonido al caer el dado (opcional)
☐ Persistencia de turno si desconexión
```

---

## 🐛 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| Tests no corren | `npm install` en server/ |
| Botón deshabilitado siempre | Verificar que `setPlayerActive(true)` se llame |
| No sincroniza entre jugadores | Usar `broadcast` no `send` en servidor |
| Mismo resultado siempre | Math.random() está funcionando, es solo probabilidad |
| Animación no se ve | Verifica que DiceRollScene esté registrada en Phaser |

---

## 📚 Documentos Recomendados

1. **Empezar aquí:**
   - `USER_STORY_DICE_ROLL.md` (5 min)
   - `ENTREGA_RESUMEN.md` (5 min)

2. **Entender el código:**
   - `EXAMPLE_INTEGRATION.ts` (10 min)
   - Comentarios en `DiceService.ts` (5 min)

3. **Integrar paso a paso:**
   - `IMPLEMENTATION_GUIDE.md` (20 min)
   - `EXAMPLE_INTEGRATION.ts` como referencia

4. **Especificación formal:**
   - `tests/features/dice_roll.feature` (5 min)

---

## 🎯 Siguiente: Mover el Peón

Una vez que el dado esté funcionando, la siguiente User Story será:

**"Como jugador, quiero mover mi peón según el resultado del dado"**

Con criterios similares pero para movimiento:
- Mover 1-4 casillas según el dado
- Validar muros invisibles
- Detectar colisiones
- Manejo de símbolos mágicos

---

## 💡 Tips

✨ **Tip 1:** Prueba el dado en la consola del navegador:
```javascript
DiceService.rollDice()  // Necesita estar en scope
```

✨ **Tip 2:** Para debug, agrega console.logs:
```typescript
console.log("Turno de:", activePlayerId);
console.log("Resultado del dado:", diceValue);
```

✨ **Tip 3:** El servidor es la "fuente de verdad":
- Nunca confíes en lo que dice el cliente
- Siempre valida en servidor antes de broadcast

---

## 🎓 Technologías Usadas

- **Phaser 4** - Framework de juegos
- **Colyseus** - Servidor multiplayer
- **TypeScript** - Lenguaje tipado
- **Jest** - Testing
- **Gherkin** - BDD

---

## 📞 Soporte

Si algo no está claro:

1. Lee el código comentado en `EXAMPLE_INTEGRATION.ts`
2. Revisa `IMPLEMENTATION_GUIDE.md` sección troubleshooting
3. Los tests en `DiceService.test.ts` muestran cómo usar cada método

---

**¡Listo para jugar! 🎲🧙‍♂️**

Next: Integra y tira el primer dado. Luego podemos implementar movimiento.
