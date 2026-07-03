# User Story: Tirar el Dado

## ID
US-001

## Título
Como jugador, quiero tirar el dado para saber cuántas casillas puedo mover mi peón.

## Descripción
El jugador necesita tirar un dado virtual que determine la cantidad máxima de casillas que puede mover su peón durante su turno. El dado tiene caras especiales: 1, 2, 2, 3, 3, 4 (lo que hace más probable sacar 2 o 3).

## Criterios de Aceptación

- [ ] **CA-1:** El dado tiene 6 caras con valores: 1, 2, 2, 3, 3, 4
  - La distribución de valores debe ser exacta
  - Cada valor debe aparecer la cantidad correcta de veces

- [ ] **CA-2:** El resultado es aleatorio
  - Cada tirada debe ser independiente
  - La probabilidad debe ser uniforme entre las 6 caras

- [ ] **CA-3:** El resultado se muestra claramente en pantalla antes de que el jugador mueva
  - Animación visual del dado rodando (1-2 segundos)
  - Resultado destacado en grande en el centro de la pantalla
  - Efecto sonoro al caer el dado (opcional pero recomendado)

- [ ] **CA-4:** Solo el jugador del turno activo puede tirar el dado
  - El botón "Tirar Dado" solo está habilitado para el jugador activo
  - Otros jugadores ven el botón deshabilitado
  - Si se intenta tirar fuera de turno, se muestra un mensaje de error

## Historias Relacionadas
- US-002: Mover el peón según el resultado del dado
- US-003: Detectar colisión con muros invisibles

## Notas Técnicas

### Arquitectura
- **Servicio:** `DiceService` - Lógica de generación de números aleatorios
- **Escena:** `DiceRollScene` - Visualización y animación del dado
- **Eventos:** Uso de Coliseum Room para sincronizar entre jugadores
- **Framework:** Phaser 4

### Configuración del Dado
```typescript
const DICE_FACES = [1, 2, 2, 3, 3, 4];
const ANIMATION_DURATION = 1500; // ms
```

### Flujo de Interacción
1. El jugador hace clic en el botón "Tirar Dado"
2. Se llama a `DiceService.rollDice()`
3. La animación del dado se ejecuta en `DiceRollScene`
4. El resultado se emite al servidor (Coliseum Room)
5. El servidor valida que sea el turno del jugador
6. Se emite el evento `diceRolled` con el resultado
7. La escena del tablero queda a la espera del siguiente input

## Criterios de Definición de Listo (DoD)
- [ ] Tests unitarios de `DiceService` con cobertura 100%
- [ ] Tests de integración con Coliseum Room
- [ ] Animación suave sin lag en navegadores modernos
- [ ] Funciona en modo multijugador (2-4 jugadores)
- [ ] Se maneja correctamente la desconexión durante la tirada
- [ ] Documentación en el README actualizada

## Estimación
- Story Points: 5
- Tiempo estimado: 2-3 días

## Prioridad
Alta - Funcionalidad core del juego

## Aceptado por
[Pendiente de aprobación]
