import Phaser from 'phaser'
import { PreloadScene } from './scenes/PreloadScene'
import { BackgroundScene } from './scenes/BackgroundScene'

export function createPhaserGame(parent: string): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: window.innerWidth,
    height: window.innerHeight,
    transparent: true,
    backgroundColor: 'transparent',
    scene: [PreloadScene, BackgroundScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    }
  })
}