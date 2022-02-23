import { Engine } from "./engine.js";
import { Game } from "./game.js";

const game: Game = Game.Instance;
const engine: Engine = new Engine();

engine.load()
  .then(() => game.setUp())
  .then(() => engine.start()
);



