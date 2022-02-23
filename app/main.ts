import { Engine } from "./engine.js";
import { Game } from "./game.js";

let game: Game = Game.Instance;
let engine: Engine = Engine.Instance;

const startGame = () => {
  engine.load()
  .then(() => game.setUp())
  .then(() => engine.start()
  );
}

startGame();








