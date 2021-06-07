import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Dodecahedron,
  Tetrahedron,
  useMatcapTexture,
  Sky,
  Stars,
} from "@react-three/drei";

//other utilitie
import CubePostEffects from "./fiber/CubePostEffects";
import { useWorld } from "./storage/WorldState";
import LineGrid from "./fiber/LineGrid";
import Floor from "./fiber/Floor";

//inject the soft shadows shader
//SoftShadows();

//Node Comonent
const Node = (props) => {
  const { position, preyClass } = props;
  const mesh = useRef();
  const randomOffsets = useRef([
    Math.random() * 0.01,
    Math.random() * 0.01,
    Math.random() * 0.01,
  ]);

  const [matcapTexture] = useMatcapTexture(preyClass > 1 ? 58 : 23, 1024);
  useFrame(() => {
    if (preyClass >= 1) {
      mesh.current.rotation.y += 0.01 + randomOffsets.current[0];
      mesh.current.rotation.x += 0.006 + randomOffsets.current[1];
      mesh.current.rotation.z += 0.02 + randomOffsets.current[2];
    }
  });
  return (
    (preyClass === 2 && (
      <Dodecahedron ref={mesh} args={[0.4]} position={position} castShadow>
        <meshMatcapMaterial attach="material" matcap={matcapTexture} />
      </Dodecahedron>
    )) ||
    (preyClass === 1 && (
      <Tetrahedron ref={mesh} args={[0.2]} position={position} castShadow>
        <meshMatcapMaterial attach="material" matcap={matcapTexture} />
      </Tetrahedron>
    ))
  );
};

const WorldMap = (props) => {
  const world = useWorld((state) => state.world);
  const worldMap = useWorld((state) => state.worldMap);
  const position = props.position ? props.position : { x: 0, y: 0, z: 0 };
  return (
    <>
      {worldMap.forEach((slice, x) =>
        slice.forEach((column, y) =>
          column.forEach((unit, z) => {
            return (
              <Node
                castShadow
                position={[
                  x - world.height * 0.5 + position.x,
                  y - world.width * 0.5 + position.y,
                  z - world.depth * 0.5 + position.z,
                ]}
                preyClass={unit}
              />
            );
          })
        )
      )}
    </>
  );
};

export const Simulation = (props) => {
  const position = props.position ? props.position : { x: 0, y: 0, z: 0 };

  const createWorld = useWorld((state) => state.createWorld);

  //generate the world in instantiation
  useEffect(() => {
    //createWorld();
  }, [createWorld]);

  return (
    <group>
      <LineGrid position={position} />
      {/*<WorldMap castShadow position={position} />*/}
    </group>
  );
};

//Configure the React App
const App = () => {
  const { depth, height } = useWorld((state) => state.world);
  const { postProcessingEnabled } = useWorld((state) => state.graphics);

  return (
    <Suspense fallback={null}>
      <Canvas
        colorManagement
        gl={{
          powerPreference: "high-performance",
          alpha: true,
        }}
        camera={{ position: [-depth * 0.8, height * 0.9, 0], fov: 70 }}
      >
        <fog attach="fog" args={["black", 50, 70]} />
        <ambientLight intensity={0.01} />
        <directionalLight position={[3, 0.4, 0]} args={["#ff5511", 0.4]} />
        <directionalLight
          color={"#66ffff"}
          position={[2.5, 8, 5]}
          intensity={0.3}
        />
        <Sky
          mieCoefficient={0.2}
          mieDirectionalG={4.0}
          rayleigh={1.7}
          turbidity={1.0}
          sunPosition={[3.0, 0.003, 0.0]}
        />
        <Simulation position={{ x: 0.0, y: 3 + height * 0.5, z: 0.0 }} />
        <Floor position={[0.0, 0.0, 0.0]} wraps={64} />
        <OrbitControls
          minDistance={depth * 0.05}
          maxDistance={depth * 2.4 + 6}
          enablePan={true}
          maxPolarAngle={Math.PI / 2.05}
          autoRotate={false}
        />
        {postProcessingEnabled && (
          <CubePostEffects enabled={postProcessingEnabled} />
        )}
      </Canvas>
    </Suspense>
  );
};

export default App;
