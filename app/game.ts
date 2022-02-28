import { Engine } from "./engine.js";
import { CanvasConfig } from "./game-components/canvas.js";
import { Obstacle } from "./game-components/obstacle.js";
import { Physics } from "./game-components/physics.js";
import { Player } from "./game-components/player.js";
import { Arrows, PlayerInit } from "./utils/constants.js";


export class Game {
  private static _instance: Game;
  private over: boolean = false;

  private canvas!: HTMLCanvasElement;
  private canvasSettings = new CanvasConfig();
  private canvasCtx!: CanvasRenderingContext2D;
  private physics = new Physics();

  private player = new Player();
  private score: number = 0;

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
    this.setMovementListeners();
    this.setScoreBoard();
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

  private setMovementListeners(): void {
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
        this.jump(this.player);
      }
    })

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      if (e.key === this.arrowLeft && this.isMovingLeft) 
        this.stopMovingLeft(leftMovementInterval);

      else if (e.key === this.arrowRight && this.isMovingRight)
        this.stopMovingRight(rightMovementInterval);
    });
  }

  private setScoreBoard(): void {
    let scoreBoard: HTMLElement | null = document.getElementById('scoreBoard');
    if (scoreBoard) scoreBoard.style.display = 'flex';
  }

  public draw(): void {
    this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.placePlayer(this.player);
    this.placeObstacle(0, 0, 20, 30, 'red');

    this.activateGravity();
    this.activateCollisionOnCanvasLimits(this.player, this.canvas);
    this.activateCollisionOnObstacles(this.player, this.obstacle);
    this.activateScoreUpdate();
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

  private activateScoreUpdate(): void {
    let currentScore: HTMLElement | null = document.getElementById('currentScore');
    if (currentScore) currentScore.innerHTML = this.score.toString();
  } 

  private placePlayer(player: Player): void {
    let ctx = this.canvasCtx;

    let img = new Image();
    img.src = '../assets/img/player-small.jpg';

    ctx.drawImage(img, player.offsetX, player.offsetY, player.width, player.height);
  }

  private placeObstacle(x: number, y: number, w: number, h: number, c: string): void {
    let ctx = this.canvasCtx;
    let obstacleX: number = (this.canvas.width / 2) - (w / 2);
    let obstacleY: number = this.canvas.height - h;

    let img = new Image();
    img.src = '../assets/img/obstacle-small.png';

    this.obstacle = new Obstacle(obstacleX, obstacleY, w, h, c, img.src);

    ctx.drawImage(img, obstacleX, obstacleY, w, h)
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

  private jump(p: Player): void {
    let playerRightSide: number = p.offsetX + p.width;
    let obstacleLeftSide: number = this.obstacle.offsetX;

    let playerLeftOfObstacleBeforeJump: boolean = playerRightSide < obstacleLeftSide;
    let isOnTheGround: boolean = p.offsetY === this.canvas.height - p.height;
    
    if (isOnTheGround) {
      this.trackJump(p);
      this.trackjumpLanding(p, playerLeftOfObstacleBeforeJump)
    }
  }

  private trackJump(p: Player): void {
    let interval: number;

    interval = setInterval(() => {
        p.offsetY -= this.physics.gravity * p.jumpForce;

        if (p.offsetY <= (this.canvas.height - (p.height * (p.jumpForce / 3)))) 
          clearInterval(interval);
      }, 15)
  }

  private trackjumpLanding(p: Player, playerLeftOfObstacleBeforeJump: boolean): void {
    let interval: number;

    interval = setInterval(() => {
      if (this.over) clearInterval(interval);

      let jumpFinished: boolean = p.offsetY == this.canvas.height - p.height;

      if (jumpFinished) {
        let playerLeftOfObstacleAfterJump: boolean = this.player.offsetX < (this.obstacle.offsetX + this.obstacle.width);
        let playerJumpedOverObstacole: boolean = playerLeftOfObstacleBeforeJump != playerLeftOfObstacleAfterJump;

        if (playerJumpedOverObstacole) this.addScore();
        clearInterval(interval);
      }
    }, 15)
  }
  
  private addScore(): void {
    this.score++;
  }

  private resetScore(): void {
    this.score = 0;
  }

  private gameOver(): void {
    this.over = true;

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

    this.resetScore();
    this.resetPlayer(this.player);
    this.restartEngine(Engine.Instance);

    this.over = false;
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



