import { Game } from "./game.js";

export class Engine {
  private static _instance: Engine;

  public active: boolean = false;
  public engineId: number = 0;
  public game = Game.Instance;

  constructor() {}

  public static get Instance(): Engine {
    return this._instance || (this._instance = new this());
  }

  public load(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      let countDown: number = 3;
      let loadingMessage: HTMLElement | null = document.getElementById('loadingMessage');

      let countDownInterval: number = setInterval(() => {
        if (countDown > 0) {
          loadingMessage!.innerHTML = `Si comincia in ${countDown}...`; 
        }
        else {
          loadingMessage!.style.display = 'none';
          clearInterval(countDownInterval);
          resolve(true);
        }
        countDown--;
      }, 750);
    })
  }

  public start(): void {
    this.active = true;
    clearInterval(this.engineId);

    this.engineId = setInterval(() => {
      this.game.draw();
    }, 1);
  }

  public stop(): void {
    this.active = false;
    clearInterval(this.engineId);
  }

}

