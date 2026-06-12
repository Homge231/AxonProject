import Phaser from 'phaser'

export class BackgroundScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BackgroundScene' })
  }
  create() {
    this.add.text(20, 20, 'ARENA.ENG — Phaser Running', {
      color: '#7df4ff',
      fontSize: '20px',
      fontFamily: 'monospace'
    })
  }
}
