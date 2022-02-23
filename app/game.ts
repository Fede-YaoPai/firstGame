import { Engine } from "./engine.js";
import { CanvasConfig } from "./game-components/canvas.js";
import { Obstacle } from "./game-components/obstacle.js";
import { Physics } from "./game-components/physics.js";
import { Player } from "./game-components/player.js";
import { Arrows, PlayerInit } from "./utils/constants.js";


export class Game {
  private static _instance: Game;

  private canvas!: HTMLCanvasElement;
  private canvasSettings = new CanvasConfig();
  private canvasCtx!: CanvasRenderingContext2D;
  private physics = new Physics();

  private player = new Player();

  private isMovingLeft: boolean = false;
  private isMovingRight: boolean = false;

  private obstacle!: Obstacle;

  private readonly arrowRight: string = Arrows.Right;
  private readonly arrowLeft: string = Arrows.Left;
  private readonly arrowUp: string = Arrows.Up;

  constructor() {}

  public static get Instance(): Game {
    return this._instance || (this._instance = new this());
  }

  public setUp(): void {
    let canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;

    this.setCanvas(canvas);
    this.addMovementListeners();
  }

  private setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.canvas.style.height = this.canvasSettings.height + 'vh';
    this.canvas.style.width = this.canvasSettings.width + 'vw';
    this.canvas.style.backgroundColor = this.canvasSettings.backgroundColor;
    this.canvas.style.border = this.canvasSettings.border;
    this.canvas.style.borderRadius = this.canvasSettings.borderRadius;

    let ctx = canvas.getContext('2d');
    if (ctx) this.canvasCtx = ctx;    
  }

  private addMovementListeners(): void {
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

  public draw(): void {
    this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.placePlayer(this.player);
    this.placeObstacle(0, 0, 5, 5, 'red');

    this.activateGravity();
    this.activateCollisionOnCanvasLimits(this.player, this.canvas);
    this.activateCollisionOnObstacles(this.player, this.obstacle);
  }

  private activateGravity(): void {
    this.player.offsetY += this.physics.gravity;
  }

  private activateCollisionOnCanvasLimits(p: Player, c: HTMLCanvasElement): void {
    if (p.offsetY + p.height > c.height) 
      p.offsetY = c.height - p.height;
    
    if (p.offsetY < 0) 
      p.offsetY = 0;
    
    if (p.offsetX + p.width > c.width) 
      p.offsetX = c.width - p.width;

    if (p.offsetX < 0) 
      p.offsetX = 0;
  }

  private activateCollisionOnObstacles(p: Player, o: Obstacle): void {
    let playerRightSide: number = p.offsetX + p.width;
    let playerLeftSide: number = p.offsetX;
    let playerTopSide: number = p.offsetY;
    let playerBottomSide: number = p.offsetY + p.height;
    
    let obstacleRightSide: number = o.offsetX + o.width;
    let obstacleLeftSide: number = o.offsetX;
    let obstacleTopSide: number = o.offsetY;
    let obstacleBottomSide: number = o.offsetY + o.height;

    let collided: boolean = 
      (playerRightSide >= obstacleLeftSide) && 
      (playerLeftSide <= obstacleRightSide) && 
      (playerBottomSide >= obstacleTopSide) &&
      (playerTopSide <= obstacleBottomSide)
    ;

    if (collided) this.gameOver();
  }

  private placePlayer(player: Player): void {
    let ctx = this.canvasCtx;

    ctx.beginPath();
    ctx.rect(
      player.offsetX,
      player.offsetY,
      player.width,
      player.height
    );
    ctx.fillStyle = player.color;
    ctx.fill();
  }

  private placeObstacle(x: number, y: number, w: number, h: number, c: string): void {
    let ctx = this.canvasCtx;
    let obstacleX: number = (this.canvas.width / 2) - (w / 2);
    let obstacleY: number = this.canvas.height - h;

    this.obstacle = new Obstacle(obstacleX, obstacleY, w, h, c);

    ctx.beginPath();
    ctx.rect(
      obstacleX,
      obstacleY,
      w,
      h
    );
    ctx.fillStyle = c;
    ctx.fill();
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

        if (this.player.offsetY <= (this.canvas.height - (this.player.height * (this.player.jumpForce / 3)))) 
          clearInterval(jumpInterval);

      }, 15)
    }
  }

  private gameOver(): void {
    let engine = Engine.Instance;
    if (engine.active) engine.stop();

    let tryAgainDiv: HTMLElement | null = document.getElementById('gameOverMessage');
    let tryAgainButton: HTMLElement | null = document.querySelector('#gameOverMessage button');

    if (tryAgainDiv && tryAgainButton) {
      tryAgainDiv.style.display = 'block';

      tryAgainButton.addEventListener('click', () => {
        if (tryAgainDiv) this.tryAgain(tryAgainDiv);
      })
    }
  }

  private tryAgain(tryAgainDiv: HTMLElement): void {
    tryAgainDiv.style.display = 'none';

    this.resetPlayer(this.player);
    this.restartEngine(Engine.Instance);
  }

  private resetPlayer(p: Player): void {
    p.offsetX = PlayerInit.X;
    p.offsetY = PlayerInit.Y;
    p.height = PlayerInit.H;
    p.width = PlayerInit.W;
    p.jumpForce = PlayerInit.JumpForce;
    p.runSpeed = PlayerInit.RunSpeed;
    p.color = PlayerInit.Color;
  }
  
  private restartEngine(e: Engine): void {
    if (!e.active) e.start();
  }

}



