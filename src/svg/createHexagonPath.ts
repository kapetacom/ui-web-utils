import {fromAngle, Vector} from "./common";

export enum Orientation {
    VERTICAL,
    HORIZONTAL
}

/**
 * TODO: replace the code in the method with the new
 * shape creation to avoid open ends and miss rendering of  
 * hexagon components
 */
export function createSimpleHexagon(dim: number, orientation?: Orientation) {

    return createHexagonPath(dim, dim , 3, orientation,dim/3)
}

export function createHexagonPath(width: number, height: number, radius: number = 5, orientation: number = 0, pointSize: number = 40) {
    let a, b, c, d, e, f, level;
    
    if (orientation === Orientation.HORIZONTAL) {
        width -= pointSize; //We do this to make sure the hexagon gets the exact height we want
        level = new Vector(radius, 0);
        a = new Vector(0, height / 2);
        b = new Vector(pointSize, 0);
        c = new Vector(width * 3 / 4 + pointSize, 0);
        d = new Vector(width * 3 / 4 + pointSize * 2, height / 2);
        e = new Vector(width * 3 / 4 + pointSize, height);
        f = new Vector(pointSize, height);
    } else {
        height -= pointSize; //We do this to make sure the hexagon gets the exact height we want
        /**
         *  orientation shift by 90 degrees
         */
        a = new Vector((width / 2), 0);
        b = new Vector(width, pointSize);
        c = new Vector(width, height);
        d = new Vector(width / 2, height + pointSize);
        e = new Vector(0, height);
        f = new Vector(0, pointSize);
        level = new Vector(0, radius)
    }

    const right = fromAngle(b.subtract(a).angle(), radius);
    const left = fromAngle(f.subtract(a).angle(), radius);

    return " M " + a.add(left) +
        " Q " + a + " " + a.add(right) +
        " L " + b.subtract(right) +
        " Q " + b + " " + b.add(level) +
        " L " + c.subtract(level) +
        " Q " + c + " " + c.add(left) +
        " L " + d.subtract(left) +
        " Q " + d + " " + d.subtract(right) +
        " L " + e.add(right) +
        " Q " + e + " " + e.subtract(level) +
        " L " + f.add(level) +
        " Q " + f + " " + f.subtract(left) + " Z ";
}

