/**
 * DiceService
 * Servicio que maneja la lógica del dado con las caras especiales: 1, 2, 2, 3, 3, 4
 */

export interface DiceResult {
  value: number;
  timestamp: number;
}

export class DiceService {
  private static readonly DICE_FACES = [1, 2, 2, 3, 3, 4];

  /**
   * Tira el dado y retorna un valor aleatorio
   * @returns Valor del dado (1, 2, 3 o 4)
   */
  static rollDice(): DiceResult {
    const randomIndex = Math.floor(Math.random() * this.DICE_FACES.length);
    const value = this.DICE_FACES[randomIndex];

    return {
      value,
      timestamp: Date.now(),
    };
  }

  /**
   * Retorna la cara especificada del dado
   * @param index Índice de la cara (0-5)
   * @returns Valor de la cara
   */
  static getDiceFace(index: number): number {
    if (index < 0 || index >= this.DICE_FACES.length) {
      throw new Error(`Índice de cara inválido: ${index}`);
    }
    return this.DICE_FACES[index];
  }

  /**
   * Retorna todas las caras del dado
   * @returns Array con todas las caras
   */
  static getAllDiceFaces(): number[] {
    return [...this.DICE_FACES];
  }

  /**
   * Calcula la probabilidad de obtener un valor específico
   * @param value Valor a buscar
   * @returns Probabilidad en porcentaje (0-100)
   */
  static getProbability(value: number): number {
    const count = this.DICE_FACES.filter((face) => face === value).length;
    return (count / this.DICE_FACES.length) * 100;
  }

  /**
   * Valida que un resultado sea válido
   * @param value Valor a validar
   * @returns true si el valor es una cara válida del dado
   */
  static isValidDiceValue(value: number): boolean {
    return this.DICE_FACES.includes(value);
  }

  /**
   * Simula múltiples tiradas para testing
   * @param times Número de tiradas
   * @returns Array con los resultados
   */
  static simulateMultipleRolls(times: number): DiceResult[] {
    const results: DiceResult[] = [];
    for (let i = 0; i < times; i++) {
      results.push(this.rollDice());
    }
    return results;
  }

  /**
   * Calcula estadísticas de las tiradas
   * @param results Array de resultados
   * @returns Objeto con estadísticas
   */
  static getStatistics(results: DiceResult[]): Record<number, number> {
    const stats: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };

    results.forEach((result) => {
      if (result.value in stats) {
        stats[result.value]++;
      }
    });

    return stats;
  }
}
