# 🧙 Laberinto Mágico - Cliente

Cliente Phaser 4 para el juego Laberinto Mágico, que se conecta con el servidor Colyseus.

## Características

✨ **Renderización visual del tablero 6x6** con Phaser 4
📡 **Conexión en tiempo real** con servidor Colyseus
🎮 **Sistema de movimiento** con teclado y ratón
🎯 **Multiplayer** de hasta 4 jugadores simultáneamente
🧱 **Muros invisibles** que bloquean el movimiento dinámicamente

## Instalación

```bash
npm install
```

## Desarrollo

### Terminal 1: Servidor
```bash
cd ../server
npm start
```
El servidor escuchará en `http://localhost:2567`

### Terminal 2: Cliente
```bash
cd client
npm run dev
```
El cliente se abrirá en `http://localhost:3000`

## Controles

### Movimiento
- **Flechas del teclado** (↑ ↓ ← →) para mover el jugador
- **Click en casilla adyacente** para mover

### Objetivo
- Moverte por el tablero evitando los muros invisibles
- Buscar los símbolos mágicos (es multijugador, competitivo)

## Build

```bash
npm run build
```

Genera una carpeta `dist/` lista para producción.

## Estructura del Proyecto

```
client/
├── index.html              # HTML principal
├── package.json            # Dependencias
├── vite.config.ts          # Configuración de Vite
├── tsconfig.json           # Configuración TypeScript
└── src/
    ├── main.ts             # Punto de entrada
    ├── types.ts            # Tipos TypeScript compartidos
    └── scenes/
        └── BoardScene.ts   # Escena principal con Phaser
```

## Tecnologías

- **Phaser 4** - Framework de juegos
- **Colyseus** - Sincronización multiplayer
- **Vite** - Build tool moderno
- **TypeScript** - Tipado estático

## Desarrollo Futuro

- [ ] Animaciones de movimiento
- [ ] Efectos de sonido
- [ ] Sistema de puntuación visible
- [ ] Chat multiplayer
- [ ] Diferentes dificultades (19 vs 24 muros)
- [ ] Persistencia de sesiones
