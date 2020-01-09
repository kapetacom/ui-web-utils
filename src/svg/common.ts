export class Vector {

    y: number = 0;
    x: number = 0;
    height: any = 400;
    width: any = 50;
    color: any = 'red';
    length: number = 10;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(v: Vector) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    subtract(v: Vector) {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    divide(s: number) {
        return new Vector(this.x / s, this.y / s);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    unit() {
        return this.divide(this.magnitude());
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    toString() {
        return `${this.x},${this.y}`;
    }
}


export function fromAngle(angle: number, magnitude: number) {
    return new Vector(
        magnitude * Math.cos(angle),
        magnitude * Math.sin(angle)
    );
}