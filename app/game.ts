import { CanvasConfig } from "./game-components/canvas.js";
import { Physics } from "./game-components/physics.js";
import { Player } from "./game-components/player.js";
import { Arrows } from "./utils/constants.js";


export class Game {
  public running: boolean = false;

  private canvas!: HTMLCanvasElement;
  private canvasSettings = new CanvasConfig();
  private canvasCtx!: CanvasRenderingContext2D;
  private player = new Player();
  private physics = new Physics();

  private isMovingLeft: boolean = false;
  private isMovingRight: boolean = false;

  private readonly arrowRight: string = Arrows.Right;
  private readonly arrowLeft: string = Arrows.Left;
  private readonly arrowUp: string = Arrows.Up;

  constructor() {}

  public setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.canvas.style.height = this.canvasSettings.height + 'px';
    this.canvas.style.width = this.canvasSettings.width + 'px';
    this.canvas.style.backgroundColor = this.canvasSettings.backgroundColor;
    this.canvas.style.border = this.canvasSettings.border;
    this.canvas.style.borderRadius = this.canvasSettings.borderRadius;

    let ctx = canvas.getContext('2d');
    if (ctx) this.canvasCtx = ctx;    
  }

  public start(): void {
    this.running = true;
    this.draw();
  }

  public draw(): void {
    setInterval(() => {
      this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.canvasCtx.beginPath();
      this.canvasCtx.rect(
        this.player.offsetX,
        this.player.offsetY,
        this.player.width,
        this.player.height
      );
      this.canvasCtx.fill();

      this.activateGravity();
      this.activateCollisionOnCanvasLimits();
    }, 1)
  }

  private activateGravity(): void {
    this.player.offsetY += this.physics.gravity;
  }

  private activateCollisionOnCanvasLimits(): void {
    if (this.player.offsetY + this.player.height > this.canvas.height) 
      this.player.offsetY = this.canvas.height - this.player.height;
    
    if (this.player.offsetY < 0) 
      this.player.offsetY = 0;
    
    if (this.player.offsetX + this.player.width > this.canvas.width) 
      this.player.offsetX = this.canvas.width - this.player.width;

    if (this.player.offsetX < 0) 
      this.player.offsetX = 0;
  }

  public addMovementListeners(): void {
    let leftMovementInterval: number;
    let rightMovementInterval: number;

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      
      if (e.key === this.arrowLeft && !this.isMovingLeft) {
        leftMovementInterval = setInterval(() => {
          this.moveLeft();
        }, 33)
      }
      else if (e.key === this.arrowRight && !this.isMovingRight) {
        rightMovementInterval = setInterval(() => {
          this.moveRight();
        }, 33)
      }
      else if (e.key === this.arrowUp) {
        this.jump();
      }
    })

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      if (e.key === this.arrowLeft && this.isMovingLeft) 
        this.stopMovingLeft(leftMovementInterval);

      else if (e.key === this.arrowRight && this.isMovingRight)
        this.stopMovingRight(rightMovementInterval);
    });
  }

  private moveLeft(): void {
    this.player.offsetX -= this.player.runSpeed;
    this.isMovingLeft = true;
  }

  private moveRight(): void {
    this.player.offsetX += this.player.runSpeed;
    this.isMovingRight = true;
  }

  private stopMovingLeft(leftInterval: number): void {
    clearInterval(leftInterval);
    this.isMovingLeft = false;
  }

  private stopMovingRight(rightInterval: number): void {
    clearInterval(rightInterval);
    this.isMovingRight = false;
  }

  private jump(): void {
    if (this.player.offsetY === this.canvas.height - this.player.height) {
      let jumpInterval: number;

      jumpInterval = setInterval(() => {
        this.player.offsetY -= this.physics.gravity * this.player.jumpForce;

        if (this.player.offsetY <= (this.canvas.height - (this.player.height * 3))) 
          clearInterval(jumpInterval);

      }, 15)
    }
  }

}