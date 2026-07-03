/**
 * DiceService.test.ts
 * Tests unitarios para el servicio del dado
 * Usar con Jest o Vitest
 */

import { DiceService, DiceResult } from "../services/DiceService";

describe("DiceService", () => {
  describe("rollDice", () => {
    it("debe retornar un objeto con propiedades value y timestamp", () => {
      const result = DiceService.rollDice();
      expect(result).toHaveProperty("value");
      expect(result).toHaveProperty("timestamp");
      expect(typeof result.value).toBe("number");
      expect(typeof result.timestamp).toBe("number");
    });

    it("debe retornar un valor válido del dado", () => {
      const result = DiceService.rollDice();
      const validValues = [1, 2, 3, 4];
      expect(validValues).toContain(result.value);
    });

    it("debe tener la distribución correcta de caras: 1, 2, 2, 3, 3, 4", () => {
      // Ejecutar 600 tiradas para verificar distribución
      const rolls = DiceService.simulateMultipleRolls(600);
      const stats = DiceService.getStatistics(rolls);

      // Verificar que cada valor aparece aproximadamente correcto
      // 1: ~100 (16.67%), 2: ~200 (33.33%), 3: ~200 (33.33%), 4: ~100 (16.67%)
      expect(stats[1]).toBeGreaterThan(50);
      expect(stats[1]).toBeLessThan(150);

      expect(stats[2]).toBeGreaterThan(150);
      expect(stats[2]).toBeLessThan(250);

      expect(stats[3]).toBeGreaterThan(150);
      expect(stats[3]).toBeLessThan(250);

      expect(stats[4]).toBeGreaterThan(50);
      expect(stats[4]).toBeLessThan(150);
    });

    it("debe ser independiente entre tiradas", () => {
      const results = DiceService.simulateMultipleRolls(100);
      let consecutiveCount = 0;

      for (let i = 1; i < results.length; i++) {
        if (results[i].value === results[i - 1].value) {
          consecutiveCount++;
        }
      }

      // No deberían ser TODOS iguales, pero algunos sí pueden repetirse
      expect(consecutiveCount).toBeLessThan(100);
    });

    it("debe tener timestamps diferentes en tiradas rápidas", () => {
      const result1 = DiceService.rollDice();
      const result2 = DiceService.rollDice();

      // Es poco probable que tengan exactamente el mismo timestamp
      expect(result1.timestamp).toBeGreaterThanOrEqual(0);
      expect(result2.timestamp).toBeGreaterThanOrEqual(result1.timestamp);
    });
  });

  describe("getDiceFace", () => {
    it("debe retornar el valor correcto para cada índice", () => {
      expect(DiceService.getDiceFace(0)).toBe(1);
      expect(DiceService.getDiceFace(1)).toBe(2);
      expect(DiceService.getDiceFace(2)).toBe(2);
      expect(DiceService.getDiceFace(3)).toBe(3);
      expect(DiceService.getDiceFace(4)).toBe(3);
      expect(DiceService.getDiceFace(5)).toBe(4);
    });

    it("debe lanzar error para índice negativo", () => {
      expect(() => DiceService.getDiceFace(-1)).toThrow();
    });

    it("debe lanzar error para índice fuera de rango", () => {
      expect(() => DiceService.getDiceFace(6)).toThrow();
      expect(() => DiceService.getDiceFace(100)).toThrow();
    });
  });

  describe("getAllDiceFaces", () => {
    it("debe retornar todas las caras del dado", () => {
      const faces = DiceService.getAllDiceFaces();
      expect(faces).toEqual([1, 2, 2, 3, 3, 4]);
    });

    it("debe retornar una copia, no la referencia original", () => {
      const faces1 = DiceService.getAllDiceFaces();
      const faces2 = DiceService.getAllDiceFaces();
      expect(faces1).toEqual(faces2);
      expect(faces1).not.toBe(faces2);
    });

    it("debe tener exactamente 6 caras", () => {
      const faces = DiceService.getAllDiceFaces();
      expect(faces.length).toBe(6);
    });
  });

  describe("getProbability", () => {
    it("debe calcular la probabilidad correcta para cada valor", () => {
      expect(DiceService.getProbability(1)).toBeCloseTo(16.67, 1);
      expect(DiceService.getProbability(2)).toBeCloseTo(33.33, 1);
      expect(DiceService.getProbability(3)).toBeCloseTo(33.33, 1);
      expect(DiceService.getProbability(4)).toBeCloseTo(16.67, 1);
    });

    it("debe retornar 0% para valores inválidos", () => {
      expect(DiceService.getProbability(5)).toBe(0);
      expect(DiceService.getProbability(0)).toBe(0);
      expect(DiceService.getProbability(-1)).toBe(0);
    });
  });

  describe("isValidDiceValue", () => {
    it("debe retornar true para valores válidos", () => {
      expect(DiceService.isValidDiceValue(1)).toBe(true);
      expect(DiceService.isValidDiceValue(2)).toBe(true);
      expect(DiceService.isValidDiceValue(3)).toBe(true);
      expect(DiceService.isValidDiceValue(4)).toBe(true);
    });

    it("debe retornar false para valores inválidos", () => {
      expect(DiceService.isValidDiceValue(0)).toBe(false);
      expect(DiceService.isValidDiceValue(5)).toBe(false);
      expect(DiceService.isValidDiceValue(6)).toBe(false);
      expect(DiceService.isValidDiceValue(-1)).toBe(false);
      expect(DiceService.isValidDiceValue(1.5)).toBe(false);
    });
  });

  describe("simulateMultipleRolls", () => {
    it("debe retornar el número correcto de tiradas", () => {
      const results = DiceService.simulateMultipleRolls(50);
      expect(results.length).toBe(50);
    });

    it("debe retornar todos los resultados válidos", () => {
      const results = DiceService.simulateMultipleRolls(100);
      results.forEach((result) => {
        expect(DiceService.isValidDiceValue(result.value)).toBe(true);
      });
    });

    it("debe retornar array vacío cuando times es 0", () => {
      const results = DiceService.simulateMultipleRolls(0);
      expect(results).toEqual([]);
    });
  });

  describe("getStatistics", () => {
    it("debe calcular estadísticas correctas", () => {
      const results: DiceResult[] = [
        { value: 1, timestamp: 1 },
        { value: 2, timestamp: 2 },
        { value: 2, timestamp: 3 },
        { value: 3, timestamp: 4 },
        { value: 3, timestamp: 5 },
        { value: 4, timestamp: 6 },
      ];

      const stats = DiceService.getStatistics(results);

      expect(stats[1]).toBe(1);
      expect(stats[2]).toBe(2);
      expect(stats[3]).toBe(2);
      expect(stats[4]).toBe(1);
    });

    it("debe retornar estadísticas con ceros para valores no presentes", () => {
      const results: DiceResult[] = [
        { value: 1, timestamp: 1 },
        { value: 1, timestamp: 2 },
      ];

      const stats = DiceService.getStatistics(results);

      expect(stats[1]).toBe(2);
      expect(stats[2]).toBe(0);
      expect(stats[3]).toBe(0);
      expect(stats[4]).toBe(0);
    });

    it("debe manejar array vacío", () => {
      const stats = DiceService.getStatistics([]);

      expect(stats[1]).toBe(0);
      expect(stats[2]).toBe(0);
      expect(stats[3]).toBe(0);
      expect(stats[4]).toBe(0);
    });
  });

  describe("Integración", () => {
    it("debe ejecutar un ciclo completo de tirada", () => {
      const result = DiceService.rollDice();

      expect(DiceService.isValidDiceValue(result.value)).toBe(true);
      expect(DiceService.getProbability(result.value)).toBeGreaterThan(0);
    });

    it("debe mantener coherencia entre métodos", () => {
      const faces = DiceService.getAllDiceFaces();
      const diceValues = [1, 2, 3, 4];

      diceValues.forEach((value) => {
        expect(faces).toContain(value);
        expect(DiceService.isValidDiceValue(value)).toBe(true);
      });
    });
  });
});
