export enum Arrows {
  Left = 'a',
  Right = 'd',
  Up = 'w'
}

export enum PlayerInit {
  X = 3,
  Y = 20,
  H = 20,
  W = 20,
  JumpForce = 16,
  RunSpeed = 5,
  Color = 'black',
  Img = 'player.jpg'
}

export interface ObjectSides {
  top: number,
  right: number,
  bottom: number,
  left: number
}