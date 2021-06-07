import { useMemo } from "react";
import { Line } from "@react-three/drei";

import { useWorld } from "../storage/WorldState";

const LineGrid = ({ position }) => {
  //get our world info
  const world = useWorld((state) => state.world);

  const lines = useMemo(() => {
    const lineDistLimit = world.depth / 2 + 50;
    let newLines = new Set();
    let column,
      row,
      slice = 0;

    //start looping through each orthogonal axis and make lines.
    //this just calculates the vertexes of each line for now
    //width-depth
    for (column = -1; column <= 1; column += 0.5) {
      for (row = -1; row <= 1; row += 0.5) {
        newLines.add({
          key: `${row}_${column}_X`,
          vertexColors: [
            [0, 0, 0],
            [0.1, 0.1, 0.1],
            [0, 0, 0],
          ],
          start: [
            lineDistLimit + position.x,
            world.width * 0.5 * column + position.y,
            world.depth * 0.5 * row + position.z,
          ],
          middle: [
            0,
            world.width * 0.5 * column + position.y + position.x,
            world.depth * 0.5 * row + position.z,
          ],
          end: [
            -lineDistLimit + position.x,
            world.width * 0.5 * column + position.y,
            world.depth * 0.5 * row + position.z,
          ],
        });
      }
    }

    //height-depth
    for (slice = -1; slice <= 1; slice += 0.5) {
      for (row = -1; row <= 1; row += 0.5) {
        newLines.add({
          key: `${row}_X_${slice}`,
          vertexColors: [
            [0, 0, 0],
            [0.1, 0.1, 0.1],
            [0.3, 1.0, 1.0],
          ],
          start: [
            world.height * 0.5 * slice + position.x,
            lineDistLimit + position.y,
            world.depth * 0.5 * row + position.z,
          ],
          middle: [
            world.height * 0.5 * slice + position.x,
            world.width * -0.4 + position.y,
            world.depth * 0.5 * row + position.z,
          ],
          end: [
            world.height * 0.5 * slice + position.x,
            world.width * -0.5 - 3 + position.y,
            world.depth * 0.5 * row + position.z,
          ],
        });
      }
    }

    //height-width
    for (slice = -1; slice <= 1; slice += 0.5) {
      for (column = -1; column <= 1; column += 0.5) {
        newLines.add({
          key: `X_${column}_${slice}`,
          vertexColors: [
            [0, 0, 0],
            [0.1, 0.1, 0.1],
            [0, 0, 0],
          ],
          start: [
            world.height * 0.5 * slice + position.x,
            world.width * 0.5 * column + position.y,
            lineDistLimit + position.z,
          ],
          middle: [
            world.height * 0.5 * slice + position.x,
            world.width * 0.5 * column + position.y,
            0 + position.z,
          ],
          end: [
            world.height * 0.5 * slice + position.x,
            world.width * 0.5 * column + position.y,
            -lineDistLimit + position.z,
          ],
        });
      }
    }

    return newLines;
  }, [world, position]);

  //return our line "objects"

  return lines ? (
    <>
      {lines.forEach((instance) => {
        //console.log(instance?.key?.toString());
        return (
          <>
            <Line
              key={instance.key.toString()}
              points={[instance.start, instance.middle, instance.end]}
              color={"#ffffff"}
              vertexColors={instance.vertexColors}
              lineWidth={0.2}
              dashed={false}
            />
          </>
        );
      })}
    </>
  ) : (
    <></>
  );
};

export default LineGrid;
