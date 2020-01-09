import {Vector} from "./common";
import {Point} from "@blockware/ui-web-types";
import BasisCurve from "./BasisCurve";


export function createConnectionPath(from: Point, to: Point, indent:number) {
    const points = [
        new Vector(from.x, from.y),
        new Vector(from.x + indent, from.y),
        new Vector(to.x - indent, to.y),
        new Vector(to.x , to.y)
    ];

    const curve = new BasisCurve();

    curve.lineStart();

    points.forEach(function(point) {
        curve.point(point);
    });

    curve.lineEnd();


    return curve.toString();
}

