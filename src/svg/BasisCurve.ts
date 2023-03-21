import { Point } from "@kapeta/ui-web-types";

export class BasisCurve {
    private _path: string[];
    private _line!: number;
    private _x0!: number;
    private _y0!: number;
    private _y1!: number;
    private _x1!: number;
    private _point!: number;

    constructor() {
        this._path = [];
    }

    private curveTo(x: number, y: number) {
        this.bezierCurveTo(
            (2 * this._x0 + this._x1) / 3,
            (2 * this._y0 + this._y1) / 3,
            (this._x0 + 2 * this._x1) / 3,
            (this._y0 + 2 * this._y1) / 3,
            (this._x0 + 4 * this._x1 + x) / 6,
            (this._y0 + 4 * this._y1 + y) / 6
        );
    }

    private bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) {
        this._path.push(
            `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`
        );
    }

    private lineTo(x: number, y: number) {
        this._path.push(
            `L ${x} ${y}`
        );
    }

    private moveTo(x: number, y: number) {
        this._path.push(
            `M ${x} ${y}`
        );
    }


    private addPoint(x: number, y: number) {
        x = +x;
        y = +y;

        /*eslint-disable */
        switch (this._point) {
            case 0:
                this._point = 1;
                this._line ? this.lineTo(x, y) : this.moveTo(x, y);
                break;
            case 1:
                this._point = 2;
                break;
            case 2:
                this._point = 3;
                this.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6); // proceed
            default:
                this.curveTo(x, y);
                break;
        }
        /*eslint-disable */

        this._x0 = this._x1;
        this._x1 = x;
        this._y0 = this._y1;
        this._y1 = y;
    }

    lineStart() {
        this._x0 = this._x1 =
            this._y0 = this._y1 = NaN;
        this._point = 0;
    }

    lineEnd() {
        /*eslint-disable */
        switch (this._point) {
            case 3:
                this.curveTo(this._x1, this._y1); // proceed
            case 2:
                this.lineTo(this._x1, this._y1);
                break;
        }
        /*eslint-disable */

        this._line = 1 - this._line;
    }

    point(p: Point) {
        this.addPoint(p.x, p.y);
    }

    toString() {
        return this._path.join(' ');
    }
}