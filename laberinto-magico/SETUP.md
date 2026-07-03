# 🧙 Laberinto Mágico - Guía de Ejecución

## Estructura del Proyecto

```
laberinto-magico/
├── server/          # Backend Colyseus + TypeScript
│   ├── src/
│   │   ├── Board.ts       # Lógica del tablero
│   │   ├── index.ts       # Servidor
│   │   └── rooms/
│   │       └── MyRoom.ts  # Sala de juego
│   └── package.json
└── client/          # Frontend Phaser 4
    ├── src/
    │   ├── main.ts
    │   ├── types.ts
    │   └── scenes/
    │       └── BoardScene.ts
    └── package.json
```

## Instalación Inicial

### 1. Instalar dependencias del servidor
```bash
cd server
npm install
cd ..
```

### 2. Instalar dependencias del cliente
```bash
cd client
npm install
cd ..
```

## Ejecución

Necesitas **dos terminales** abiertas:

### Terminal 1: Servidor
```bash
cd server
npm start
```

Verás:
```
✅ Tablero validado exitosamente:
   • Todas las 36 casillas son alcanzables
   • Cada casilla tiene al menos una entrada
   • Total de muros: 19
⚔️  Servidor de Colyseus escuchando en http://localhost:2567
```

### Terminal 2: Cliente
```bash
cd client
npm run dev
```

Se abrirá automáticamente `http://localhost:3000` en tu navegador.

## Cómo Jugar

1. **Conectarse**: El cliente se conecta automáticamente al servidor
2. **Moverse**: 
   - Usa las **flechas del teclado** (↑ ↓ ← →)
   - O haz **click en casillas adyacentes**
3. **Muros invisibles**: Algunos movimientos estarán bloqueados (hay 19 muros fijos)
4. **Símbolos**: Cada casilla muestra un símbolo mágico (🌙 ⭐ ☀️ 🔥 etc)

## Demostración de Tablero

Para ver el tablero en la consola sin interfaz gráfica:

```bash
cd server
npx tsx src/demo.ts
```

Mostrará:
- Grilla visual del tablero
- Lista de todos los muros
- Pruebas de validación de movimientos

## Troubleshooting

### "No se pudo conectar al servidor"
- Verificar que el **servidor está corriendo** en Terminal 1
- Verificar que es `ws://localhost:2567` (no HTTP)

### El tablero no se muestra
- Abrir la consola del navegador (F12)
- Verificar que no hay errores de conexión
- Recargar la página (Ctrl+R)

### Puerto 3000 ya está en uso
```bash
cd client
npm run dev -- --port 3001
```

### Puerto 2567 ya está en uso
```bash
cd server
PORT=2568 npm start
```

## Arquitectura

```
Cliente (Phaser 4)
    ↓ WebSocket
Servidor Colyseus (Node.js)
    ↓
Board.ts (Lógica del juego)
```

**Flujo de Movimiento:**
1. Usuario presiona flecha en cliente
2. Client envía mensaje `move` al servidor
3. Servidor valida con `board.canMove()`
4. Si es válido, actualiza posición
5. Estado se sincroniza a todos los clientes

## Comandos Útiles

```bash
# Build para producción
cd client && npm run build

# Compilar TypeScript sin ejecutar
cd server && npx tsc --noEmit

# Ver demo del tablero
cd server && npx tsx src/demo.ts
```

¡Que disfrutes el juego! 🎮✨
