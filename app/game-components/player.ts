import { PlayerInit } from "../utils/constants.js";

export class Player {
  offsetX: number = PlayerInit.X;
  offsetY: number = PlayerInit.Y;
  height: number = PlayerInit.H;
  width: number = PlayerInit.W;
  jumpForce: number = PlayerInit.JumpForce;
  runSpeed: number = PlayerInit.RunSpeed;
  color: string = PlayerInit.Color;

  constructor() {}
}

