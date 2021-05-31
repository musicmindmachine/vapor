import produce from "immer";
import create from "zustand";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, OrbitControls} from "@react-three/drei";
import { Suspense, useRef } from "react";

import Node from "./Node.js";

const useWorld = create((set) => ({
  world: {
    width: 4,
    height: 4,
    depth: 4,
    states: []
  },
  set: (fn) => set(produce(fn))
}));

const App = (props) => {
  const { world, set } = useWorld((state) => state);
  const camera = useRef();
  return (
    <Suspense fallback={null}>
      <Canvas>
          <Node position={[0,0,0]} preyClass={"none"} />
          <PerspectiveCamera ref={camera} />
          <OrbitControls camera={camera.current} />
      </Canvas>
    </Suspense>
  );
};

export default App;
