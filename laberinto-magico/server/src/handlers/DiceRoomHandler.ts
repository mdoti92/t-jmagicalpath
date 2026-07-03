/**
 * DiceRoomHandler
 * Maneja la lógica de tirada del dado en la sala de Coliseum
 * Este código se integra en MyRoom.ts
 */

import { DiceService, DiceResult } from "../services/DiceService";
import { DiceEvents, DiceRolledMessage } from "../events/DiceEvents";

export interface PlayerDiceState {
  playerId: string;
  lastRollValue?: number;
  hasRolledThisTurn: boolean;
  rollTimestamp?: number;
}

export class DiceRoomHandler {
  private playerDiceStates: Map<string, PlayerDiceState> = new Map();

  /**
   * Inicializa el estado del dado para un nuevo jugador
   */
  initializePlayerDiceState(playerId: string): void {
    this.playerDiceStates.set(playerId, {
      playerId,
      hasRolledThisTurn: false,
    });
  }

  /**
   * Maneja la solicitud de tirar el dado desde un jugador
   */
  handleDiceRollRequest(
    playerId: string,
    isActivePlayer: boolean
  ): { success: boolean; value?: number; message: string } {
    // Validar que sea el jugador activo
    if (!isActivePlayer) {
      return {
        success: false,
        message: DiceEvents.ERROR_MESSAGES.NOT_ACTIVE_PLAYER,
      };
    }

    const playerState = this.playerDiceStates.get(playerId);
    if (!playerState) {
      return {
        success: false,
        message: "Estado del jugador no encontrado",
      };
    }

    // Validar que no haya tirado ya en este turno
    if (playerState.hasRolledThisTurn) {
      return {
        success: false,
        message: DiceEvents.ERROR_MESSAGES.ALREADY_ROLLED,
      };
    }

    // Tirar el dado
    const diceResult: DiceResult = DiceService.rollDice();

    // Validar el resultado
    if (!DiceService.isValidDiceValue(diceResult.value)) {
      return {
        success: false,
        message: DiceEvents.ERROR_MESSAGES.INVALID_VALUE,
      };
    }

    // Guardar el estado
    playerState.lastRollValue = diceResult.value;
    playerState.hasRolledThisTurn = true;
    playerState.rollTimestamp = diceResult.timestamp;

    return {
      success: true,
      value: diceResult.value,
      message: "Dado tirado exitosamente",
    };
  }

  /**
   * Retorna el mensaje a enviar a todos los jugadores
   */
  createDiceRolledMessage(
    playerId: string,
    playerName: string,
    diceValue: number,
    timestamp: number
  ): DiceRolledMessage {
    return {
      playerId,
      playerName,
      diceValue,
      timestamp,
    };
  }

  /**
   * Reinicia el estado del dado para el siguiente turno
   */
  resetDiceStateForNewTurn(playerId: string): void {
    const playerState = this.playerDiceStates.get(playerId);
    if (playerState) {
      playerState.hasRolledThisTurn = false;
      playerState.lastRollValue = undefined;
      playerState.rollTimestamp = undefined;
    }
  }

  /**
   * Reinicia el estado del dado para todos los jugadores
   */
  resetAllDiceStates(): void {
    this.playerDiceStates.forEach((state) => {
      state.hasRolledThisTurn = false;
      state.lastRollValue = undefined;
      state.rollTimestamp = undefined;
    });
  }

  /**
   * Obtiene el último valor tirado por un jugador
   */
  getLastRollValue(playerId: string): number | undefined {
    return this.playerDiceStates.get(playerId)?.lastRollValue;
  }

  /**
   * Verifica si el jugador ya tiró en este turno
   */
  hasPlayerRolled(playerId: string): boolean {
    return this.playerDiceStates.get(playerId)?.hasRolledThisTurn ?? false;
  }
}
