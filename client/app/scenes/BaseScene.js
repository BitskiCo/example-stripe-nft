import { Scene } from 'phaser';

export default class BaseScene extends Scene {

  create(config) {
    // Add a listener to our resize event
    this.sys.game.events.on('resize', this.resize, this);
    // Call the resize so the game resizes correctly on scene start
    this.cameras.main.setBounds(0,0,600,600);
    this.resize();
    // Listen for this scene exit
    this.events.once('shutdown', this.shutdown, this);
  }

  resize() {
    let cam = this.cameras.main;
    const size = Math.min(window.innerWidth, window.innerHeight);
    const width = Math.min(size, 600);
    const height = Math.min(size, 600);
    const x = (window.innerWidth * 0.5) - (width * 0.5);
    const y = (window.innerHeight * 0.5) - (height * 0.5);
    cam.setViewport(x, y, width, height);
    cam.centerToBounds();
    // If we want to fit our game inside, then use the min scale
    cam.zoom = Math.min(1, Math.min(window.innerWidth/600, window.innerHeight/600));
  }

  shutdown() {
    // When this scene exits, remove the resize handler
    this.sys.game.events.off('resize', this.resize, this);
  }
}
