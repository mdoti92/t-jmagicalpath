Feature: Tirar el Dado
  Como jugador
  Quiero tirar el dado para saber cuántas casillas puedo mover mi peón
  Para avanzar en el laberinto

  Background:
    Given el juego está inicializado con 2 jugadores
    And el jugador "Rojo" es el jugador activo
    And el jugador "Azul" está esperando su turno

  Scenario: Tirar el dado y obtener un resultado válido
    When el jugador activo hace clic en "Tirar Dado"
    Then se muestra la animación del dado rodando durante 1-2 segundos
    And se muestra el resultado en pantalla
    And el resultado es uno de: 1, 2, 3, 4
    And se emite el evento "diceRolled" con el resultado

  Scenario: El resultado del dado debe ser aleatorio
    When se tiran 100 dados seguidos
    Then se obtienen valores variados (no el mismo valor en todas las tiradas)
    And la distribución es aproximadamente: 16.67% para 1, 33.33% para 2, 33.33% para 3, 16.67% para 4

  Scenario: Solo el jugador activo puede tirar el dado
    Given es el turno del jugador "Rojo"
    When el jugador "Azul" intenta hacer clic en "Tirar Dado"
    Then el botón "Tirar Dado" está deshabilitado para el jugador "Azul"
    And se muestra el mensaje "Espera tu turno"
    And no se emite ningún evento diceRolled

  Scenario: El resultado se muestra claramente antes del movimiento
    When el jugador activo tira el dado
    Then el resultado es visible en una posición central de la pantalla
    And el texto del resultado es grande y legible (mínimo 48px)
    And el resultado permanece visible durante al menos 3 segundos
    And el jugador no puede mover su peón hasta después de ver el resultado

  Scenario: Tiradas consecutivas tienen resultados diferentes
    When el jugador "Rojo" tira el dado y obtiene resultado "2"
    And el turno pasa al jugador "Azul"
    And el jugador "Azul" tira el dado
    Then es muy probable que el resultado sea diferente a "2"

  Scenario: El dado se reinicia para el siguiente turno
    When el jugador "Rojo" tira el dado y obtiene "3"
    And el jugador "Rojo" termina su turno
    And el jugador "Azul" comienza su turno
    Then el botón "Tirar Dado" está disponible nuevamente
    And el jugador "Azul" puede tirar el dado

  Scenario: Manejo de conexión perdida durante la tirada
    When el jugador activo está viendo la animación del dado
    And la conexión se pierde
    Then se muestra el mensaje "Conexión perdida"
    And el estado del juego se sincroniza cuando se recupera la conexión
