import { Game } from "./game.js";

export class Engine {

  public active: boolean = false;
  public engineId: number = 0;
  public game = new Game();

  constructor() {}

  public load(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      let countDown: number = 3;
      let loadingMessage: HTMLElement | null = document.getElementById('loadingMessage');

      let countDownInterval: number = setInterval(() => {
        if (countDown > 0) {
          loadingMessage!.innerHTML = `Game engine starting in ${countDown}...`; 
        }
        else {
          loadingMessage!.style.display = 'none';
          clearInterval(countDownInterval);
          resolve(true);
        }
        countDown--;
      }, 1000);
    })
  }

  public start(): void {
    this.active = true;
    console.log('test')
  }

  public stop(): void {
    this.active = false;
    clearInterval(this.engineId)
  }

}