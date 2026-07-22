import Phaser from 'phaser';
import { Client } from 'colyseus.js';
const COLORS = ['rojo', 'azul', 'amarillo', 'verde'];
const COLOR_LABELS = {
    rojo: 'Rojo',
    azul: 'Azul',
    amarillo: 'Amarillo',
    verde: 'Verde'
};
export class LobbyScene extends Phaser.Scene {
    client;
    room;
    nameInput;
    playerCountText;
    colorButtons = [];
    selectedColor = 'rojo';
    playerCount = 2;
    statusText;
    playerListText;
    constructor() {
        super({ key: 'LobbyScene' });
    }
    create() {
        this.client = new Client('ws://localhost:2567');
        this.add.text(400, 80, '🧙 El Laberinto Mágico', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.add.text(400, 125, 'Configuración de partida', {
            fontSize: '18px',
            color: '#cfcfff'
        }).setOrigin(0.5);
        this.add.text(220, 180, 'Nombre:', {
            fontSize: '18px',
            color: '#ffffff'
        });
        const nameInputElement = document.createElement('input');
        nameInputElement.type = 'text';
        nameInputElement.value = `Mago_${Math.floor(Math.random() * 100)}`;
        nameInputElement.placeholder = 'Tu nombre';
        nameInputElement.style.width = '220px';
        nameInputElement.style.padding = '8px';
        nameInputElement.style.fontSize = '16px';
        nameInputElement.style.borderRadius = '6px';
        nameInputElement.style.border = '1px solid #7f8cff';
        if (this.sys.game.domContainer) {
            this.nameInput = this.add.dom(400, 180).createFromHTML(nameInputElement.outerHTML);
            this.nameInput.setOrigin(0.5, 0);
        }
        else {
            const parent = document.getElementById('game-container') || document.body;
            const wrapper = document.createElement('div');
            wrapper.innerHTML = nameInputElement.outerHTML;
            wrapper.style.position = 'absolute';
            wrapper.style.left = 'calc(50% - 110px)';
            wrapper.style.top = '180px';
            parent.appendChild(wrapper);
            this.nameInput = { node: wrapper.firstElementChild };
        }
        this.add.text(220, 245, 'Jugadores:', {
            fontSize: '18px',
            color: '#ffffff'
        });
        this.playerCountText = this.add.text(400, 245, '2', {
            fontSize: '18px',
            color: '#ffdb4d'
        });
        const minusBtn = this.add.rectangle(360, 245, 36, 32, 0x6b7280)
            .setInteractive({ useHandCursor: true });
        this.add.text(360, 245, '-', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);
        const plusBtn = this.add.rectangle(440, 245, 36, 32, 0x6b7280)
            .setInteractive({ useHandCursor: true });
        this.add.text(440, 245, '+', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);
        minusBtn.on('pointerdown', () => {
            this.playerCount = Math.max(2, this.playerCount - 1);
            this.playerCountText.setText(String(this.playerCount));
        });
        plusBtn.on('pointerdown', () => {
            this.playerCount = Math.min(4, this.playerCount + 1);
            this.playerCountText.setText(String(this.playerCount));
        });
        this.add.text(220, 295, 'Color:', {
            fontSize: '18px',
            color: '#ffffff'
        });
        COLORS.forEach((color, index) => {
            const x = 280 + index * 90;
            const button = this.add.rectangle(x, 330, 70, 36, this.getColorValue(color))
                .setInteractive({ useHandCursor: true });
            this.add.text(x, 330, COLOR_LABELS[color], {
                fontSize: '14px',
                color: '#ffffff'
            }).setOrigin(0.5);
            button.on('pointerdown', () => {
                this.selectedColor = color;
                this.updateColorSelection();
            });
            this.colorButtons.push(button);
        });
        this.updateColorSelection();
        const joinBtn = this.add.rectangle(400, 390, 220, 50, 0x4d94ff)
            .setInteractive({ useHandCursor: true });
        const btnText = this.add.text(400, 390, 'Iniciar / Unirse', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        joinBtn.on('pointerdown', async () => {
            const nameValue = this.nameInput.node?.value?.trim() || `Mago_${Math.floor(Math.random() * 100)}`;
            const colorValue = this.selectedColor;
            try {
                btnText.setText('Conectando...');
                joinBtn.setFillStyle(0x6b7280);
                this.statusText.setText('Conectando a la sala...');
                this.room = await this.client.joinOrCreate('laberinto_room', {
                    name: nameValue,
                    color: colorValue,
                    playerCount: this.playerCount
                });
                this.registry.set('room', this.room);
                this.registry.set('playerName', nameValue);
                this.registry.set('playerColor', colorValue);
                this.room.state.listen('status', (status) => {
                    if (status === 'PLAYING') {
                        this.scene.start('BoardScene');
                        this.scene.launch('UIScene');
                    }
                });
                this.room.state.listen('players', () => {
                    this.renderPlayersList();
                });
                this.renderPlayersList();
                this.statusText.setText('Esperando jugadores...');
            }
            catch (e) {
                console.error('Error al unirse:', e);
                btnText.setText('Error de Conexión');
                joinBtn.setFillStyle(0xff4d4d);
                this.statusText.setText('No se pudo conectar.');
            }
        });
        this.statusText = this.add.text(400, 455, 'Listo para empezar', {
            fontSize: '16px',
            color: '#cfcfff'
        }).setOrigin(0.5);
        this.playerListText = this.add.text(400, 500, 'Jugadores conectados:\n- Ninguno aún', {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
    }
    updateColorSelection() {
        const occupiedColors = new Set();
        this.getPlayers().forEach((player) => {
            if (player.color) {
                occupiedColors.add(player.color);
            }
        });
        const availableColor = this.getFirstAvailableColor(occupiedColors);
        if (occupiedColors.has(this.selectedColor) && this.selectedColor !== availableColor) {
            this.selectedColor = availableColor;
        }
        this.colorButtons.forEach((button, index) => {
            const color = COLORS[index];
            const isOccupied = occupiedColors.has(color);
            const isSelected = color === this.selectedColor;
            button.setFillStyle(isSelected ? this.getColorValue(color) : 0x374151);
            button.setAlpha(isSelected || !isOccupied ? 1 : 0.4);
            if (button.input) {
                button.input.enabled = !isOccupied || isSelected;
            }
        });
    }
    renderPlayersList() {
        if (!this.room)
            return;
        const players = this.getPlayers().map((player) => `• ${player?.name || 'Jugador'} (${player?.color || 'sin color'})`);
        this.playerListText.setText(`Jugadores conectados:\n${players.length ? players.join('\n') : '- Ninguno aún'}`);
    }
    getPlayers() {
        const playersState = this.room?.state?.players;
        if (!playersState) {
            return [];
        }
        if (typeof playersState.values === 'function') {
            const values = playersState.values();
            const array = Array.isArray(values) ? values : Array.from(values ?? []);
            return array.filter((player) => Boolean(player));
        }
        if (typeof playersState.forEach === 'function') {
            const collected = [];
            playersState.forEach((player) => {
                if (player) {
                    collected.push(player);
                }
            });
            return collected;
        }
        if (typeof playersState[Symbol.iterator] === 'function') {
            return Array.from(playersState).filter((player) => Boolean(player));
        }
        return [];
    }
    getColorValue(color) {
        const map = {
            rojo: 0xff4d4d,
            azul: 0x4d94ff,
            amarillo: 0xffdb4d,
            verde: 0x4dff88
        };
        return map[color] || 0xffffff;
    }
    getFirstAvailableColor(occupiedColors) {
        return COLORS.find((color) => !occupiedColors.has(color)) || 'rojo';
    }
}
