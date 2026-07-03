/**
 * DiceEvents
 * Define los eventos relacionados con la tirada del dado para sincronización en Coliseum
 */

export interface DiceRolledMessage {
  playerId: string;
  playerName: string;
  diceValue: number;
  timestamp: number;
}

export interface DiceRolledEventPayload {
  playerId: string;
  playerName: string;
  diceValue: number;
  timestamp: number;
}

export class DiceEvents {
  // Eventos emitidos desde el cliente al servidor
  static readonly CLIENT_EVENTS = {
    ROLL_DICE_REQUEST: "rollDiceRequest",
    DICE_ROLL_ACK: "diceRollAck",
  } as const;

  // Eventos emitidos desde el servidor al cliente
  static readonly SERVER_EVENTS = {
    DICE_ROLLED: "diceRolled",
    DICE_ROLL_FAILED: "diceRollFailed",
    INVALID_DICE_ROLL: "invalidDiceRoll",
  } as const;

  // Mensajes de error
  static readonly ERROR_MESSAGES = {
    NOT_ACTIVE_PLAYER: "No es tu turno para tirar el dado",
    ALREADY_ROLLED: "Ya has tirado el dado en este turno",
    INVALID_VALUE: "El valor del dado no es válido",
    CONNECTION_ERROR: "Error de conexión al tirar el dado",
  } as const;
}

export type DiceEventType = typeof DiceEvents.SERVER_EVENTS[keyof typeof DiceEvents.SERVER_EVENTS];
