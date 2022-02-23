export class Obstacle {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  color: string;
  img?: string;
  
  constructor(
    private x: number,
    private y: number,
    private w: number,
    private h: number,
    private c: string,
    private i?: string
  ) {
    this.offsetX = x;
    this.offsetY = y;
    this.width = w;
    this.height = h;
    this.color = c;
    this.img = i
  }
}