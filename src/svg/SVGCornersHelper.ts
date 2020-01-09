
var roundPathCorners = function (pathString: any, radius: number, useFractionalRadius: any) {
    function moveTowardsLength(movingPoint: any, targetPoint: any, amount: any) {
        var width = (targetPoint.x - movingPoint.x);
        var height = (targetPoint.y - movingPoint.y);

        var distance = Math.sqrt(width * width + height * height);

        return moveTowardsFractional(movingPoint, targetPoint, Math.min(1, amount / distance));
    }
    function moveTowardsFractional(movingPoint: any, targetPoint: any, fraction: any) {
        return {
            x: movingPoint.x + (targetPoint.x - movingPoint.x) * fraction,
            y: movingPoint.y + (targetPoint.y - movingPoint.y) * fraction
        };
    }

    // Adjusts the ending position of a command
    function adjustCommand(cmd: any, newPoint: any) {
        if (cmd.length > 2) {
            cmd[cmd.length - 2] = newPoint.x;
            cmd[cmd.length - 1] = newPoint.y;
        }
    }

    // Gives an {x, y} object for a command's ending position
    function pointForCommand(cmd: any) {
        return {
            x: parseFloat(cmd[cmd.length - 2]),
            y: parseFloat(cmd[cmd.length - 1]),
        };
    }

    // Split apart the path, handing concatonated letters and numbers
    var pathParts = pathString
        .split(/[,\s]/)
        .reduce(function (parts: any, part: any) {
            var match = part.match("([a-zA-Z])(.+)");
            if (match) {
                parts.push(match[1]);
                parts.push(match[2]);
            } else {
                parts.push(part);
            }

            return parts;
        }, []);

    // Group the commands with their arguments for easier handling
    var commands = pathParts.reduce(function (commands: any, part: any) {
        if (parseFloat(part) === part && commands.length) {
            commands[commands.length - 1].push(part);
        } else {
            commands.push([part]);
        }

        return commands;
    }, []);

    // The resulting commands, also grouped
    var resultCommands = [];

    if (commands.length > 1) {
        var startPoint = pointForCommand(commands[0]);

        // Handle the close path case with a "virtual" closing line
        var virtualCloseLine = null;
        if (commands[commands.length - 1][0] === "Z" && commands[0].length > 2) {
            virtualCloseLine = ["L", startPoint.x, startPoint.y];
            commands[commands.length - 1] = virtualCloseLine;
        }

        // We always use the first command (but it may be mutated)
        resultCommands.push(commands[0]);

        for (var cmdIndex = 1; cmdIndex < commands.length; cmdIndex++) {
            var prevCmd = resultCommands[resultCommands.length - 1];

            var curCmd = commands[cmdIndex];

            // Handle closing case
            var nextCmd = (curCmd === virtualCloseLine)
                ? commands[1]
                : commands[cmdIndex + 1];

            // Nasty logic to decide if this path is a candidite.
            if (nextCmd && prevCmd && (prevCmd.length > 2) && curCmd[0] === "L" && nextCmd.length > 2 && nextCmd[0] === "L") {
                // Calc the points we're dealing with
                var prevPoint = pointForCommand(prevCmd);
                var curPoint = pointForCommand(curCmd);
                var nextPoint = pointForCommand(nextCmd);

                // The start and end of the cuve are just our point moved towards the previous and next points, respectivly
                var curveStart, curveEnd;

                if (useFractionalRadius) {
                    curveStart = moveTowardsFractional(curPoint, prevCmd.origPoint || prevPoint, radius);
                    curveEnd = moveTowardsFractional(curPoint, nextCmd.origPoint || nextPoint, radius);
                } else {
                    curveStart = moveTowardsLength(curPoint, prevPoint, radius);
                    curveEnd = moveTowardsLength(curPoint, nextPoint, radius);
                }

                // Adjust the current command and add it
                adjustCommand(curCmd, curveStart);
                curCmd.origPoint = curPoint;
                resultCommands.push(curCmd);

                // The curve control points are halfway between the start/end of the curve and
                // the original point
                var startControl = moveTowardsFractional(curveStart, curPoint, .5);
                var endControl = moveTowardsFractional(curPoint, curveEnd, .5);

                // Create the curve 
                var curveCmd = ["C", startControl.x, startControl.y, endControl.x, endControl.y, curveEnd.x, curveEnd.y];
                // Save the original point for fractional calculations
                curveCmd["origPoint"] = curPoint;
                resultCommands.push(curveCmd);
            } else {
                // Pass through commands that don't qualify
                resultCommands.push(curCmd);
            }
        }

        // Fix up the starting point and restore the close path if the path was orignally closed
        if (virtualCloseLine) {
            var newStartPoint = pointForCommand(resultCommands[resultCommands.length - 1]);
            resultCommands.push(["Z"]);
            adjustCommand(resultCommands[0], newStartPoint);
        }
    } else {
        resultCommands = commands;
    }

    return resultCommands.reduce(function (str: any, c: any) { return str + c.join(" ") + " "; }, "");
}
var createRoundedPathString = (pathCoords: { x: number, y: number }[], radius: number) => {
    const path = [];
    const curveRadius = radius;
    // Reset indexes, so there are no gaps
    pathCoords = pathCoords.filter(() => true);
    for (let i = 0; i < pathCoords.length; i++) {
        // 1. Get current coord and the next two (startpoint, cornerpoint, endpoint) to calculate rounded curve
        const c2Index = ((i + 1) > pathCoords.length - 1) ? (i + 1) % pathCoords.length : i + 1;
        const c3Index = ((i + 2) > pathCoords.length - 1) ? (i + 2) % pathCoords.length : i + 2;

        const c1 = pathCoords[i],
            c2 = pathCoords[c2Index],
            c3 = pathCoords[c3Index];

        // 2. For each 3 coords, enter two new path commands: Line to start of curve, bezier curve around corner.

        // Calculate curvePoint c1 -> c2
        const c1c2Distance = Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2));
        const c1c2DistanceRatio = (c1c2Distance - curveRadius) / c1c2Distance;
        const c1c2CurvePoint = [
            ((1 - c1c2DistanceRatio) * c1.x + c1c2DistanceRatio * c2.x).toFixed(1),
            ((1 - c1c2DistanceRatio) * c1.y + c1c2DistanceRatio * c2.y).toFixed(1)
        ];

        // Calculate curvePoint c2 -> c3
        const c2c3Distance = Math.sqrt(Math.pow(c2.x - c3.x, 2) + Math.pow(c2.y - c3.y, 2));
        const c2c3DistanceRatio = curveRadius / c2c3Distance;
        const c2c3CurvePoint = [
            ((1 - c2c3DistanceRatio) * c2.x + c2c3DistanceRatio * c3.x).toFixed(1),
            ((1 - c2c3DistanceRatio) * c2.y + c2c3DistanceRatio * c3.y).toFixed(1)
        ];

        // If at last coord of polygon, also save that as starting point
        if (i === pathCoords.length - 1) {
            path.unshift('M' + c2c3CurvePoint.join(','));
        }

        // Line to start of curve (L endcoord)
        path.push('L' + c1c2CurvePoint.join(','));
        // Bezier line around curve (Q controlcoord endcoord)
        path.push('Q' + c2.x + ',' + c2.y + ',' + c2c3CurvePoint.join(','));
    }
    // Logically connect path to starting point again (shouldn't be necessary as path ends there anyway, but seems cleaner)
    path.push('Z');

    return path.join(' ');
}

let getResourceTag3_25 = ( width: number, radius: number, side?: ResourceTagSide, percent?: number) => {
    let height = width/3.1;

    let tagSide: ResourceTagSide = ResourceTagSide.LEFT;
    if (side) {
        tagSide = side;
    }
    let pointPercentage = 0.20;
    if (!!percent) {
        pointPercentage = ( percent / 100) ;
    }

    if (tagSide === ResourceTagSide.LEFT) {

        return createRoundedPathString([
            { x: width - width / 10, y: height },
            { x: width, y: height },
            { x: width, y: 0 },
            { x: width * ( pointPercentage), y: 0 },
            { x: 0, y: height / 2 },
            { x: width * ( pointPercentage), y: height },
            { x: width, y: height },
            { x: width, y: height },
        ], radius)
    } else {
        return createRoundedPathString([
            { x: width / 10, y: height },
            { x: width - width * pointPercentage, y: height },
            { x: width, y: height / 2 },
            { x: width - width * pointPercentage, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: height },
            { x: width / 10, y: height }
        ], radius)
    }
}
export enum ResourceTagSide {
    LEFT = "left",
    RIGHT = "right"
}

let getResourceTagPath = (height: number, width: number, radius: number, side?: ResourceTagSide, percent?: number) => {
    let tagSide: ResourceTagSide = ResourceTagSide.LEFT;
    if (side) {
        tagSide = side;
    }
    let pointPercentage = 0.20;
    if (!!percent) {
        pointPercentage = ( percent / 100) ;
    }

    if (tagSide === ResourceTagSide.LEFT) {
        return createRoundedPathString([
            { x: width - width / 10, y: height },
            { x: width, y: height },
            { x: width, y: 0 },
            { x: width * ( pointPercentage), y: 0 },
            { x: 0, y: height / 2 },
            { x: width * ( pointPercentage), y: height },
            { x: width, y: height },
            { x: width, y: height },
        ], radius)
    } else {
        return createRoundedPathString([
            { x: width / 10, y: height },
            { x: width - width * pointPercentage, y: height },
            { x: width, y: height / 2 },
            { x: width - width * pointPercentage, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: height },
            { x: width / 10, y: height }
        ], radius)
    }
};

export const SVGCornersHelper = { roundPathCorners, createRoundedPathString, getResourceTagPath,getResourceTag3_25 };