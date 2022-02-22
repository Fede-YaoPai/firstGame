import { Engine } from "./engine.js";
import { Game } from "./game.js";

const game: Game = new Game();
let canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
const engine: Engine = new Engine();

engine.load()
  .then(() => engine.start())
  .then(() => game.setCanvas(canvas))
  .then(() => game.start())
  .then(() => game.addMovementListeners()
);



