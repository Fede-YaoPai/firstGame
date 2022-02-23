import { Engine } from "./engine.js";
import { Game } from "./game.js";

const game: Game = Game.Instance;
let canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;

const engine: Engine = new Engine();
engine.load()
  .then(() => game.setCanvas(canvas))
  .then(() => game.addMovementListeners())
  .then(() => engine.start()
);



