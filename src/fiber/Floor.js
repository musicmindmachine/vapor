import React, { Suspense, useEffect } from "react";
import { Plane } from "@react-three/drei";
import { useTexture } from "@react-three/drei";
import { RepeatWrapping } from "three";

const Floor = (props) => {
  const wraps = 1;
  const concrete_map = useTexture("textures/c1_map.jpg");
  const concrete_ao = useTexture("textures/c1_ao.jpg");
  //const concrete_bump = useTexture("textures/c1_bump.jpg");
  const concrete_disp = useTexture("textures/c1_disp.jpg");
  const concrete_normal = useTexture("textures/c1_normal.jpg");
  const concrete_rough = useTexture("textures/c1_rough.jpg");

  useEffect(() => {
    concrete_map.wrapS = RepeatWrapping;
    concrete_map.wrapT = RepeatWrapping;
    concrete_map.repeat.set(wraps, wraps);
  }, [concrete_map, wraps]);

  useEffect(() => {
    concrete_ao.wrapS = RepeatWrapping;
    concrete_ao.wrapT = RepeatWrapping;
    concrete_ao.repeat.set(wraps, wraps);
  }, [concrete_ao, wraps]);
  useEffect(() => {
    concrete_normal.wrapS = RepeatWrapping;
    concrete_normal.wrapT = RepeatWrapping;
    concrete_normal.repeat.set(wraps, wraps);
  }, [concrete_normal, wraps]);

  useEffect(() => {
    concrete_disp.wrapS = RepeatWrapping;
    concrete_disp.wrapT = RepeatWrapping;
    concrete_disp.repeat.set(wraps, wraps);
  }, [concrete_disp, wraps]);

  useEffect(() => {
    concrete_rough.wrapS = RepeatWrapping;
    concrete_rough.wrapT = RepeatWrapping;
    concrete_rough.repeat.set(wraps, wraps);
  }, [concrete_rough, wraps]);

  return (
    <Suspense
      fallback={
        <Plane
          rotation={[-Math.PI * 0.5, 0, 0]}
          args={[200, 200]}
          position={[0.0, 0.0, 0.0]}
        >
          <meshPhongMaterial color="grey" attach="material" />
        </Plane>
      }
    >
      <Plane
        castShadow
        receiveShadow
        rotation={[-Math.PI * 0.5, 0, 0]}
        args={[2, 2, 500, 500]}
        position={[0.0, -0.01, 0.0]}
      >
        <meshStandardMaterial
          attach="material"
          map={concrete_map}
          aoMap={concrete_ao}
          aoMapIntensity={2.0}
          //bumpMap={concrete_bump}
          displacementMap={concrete_disp}
          displacementScale={0.06}
          normalMap={concrete_normal}
          normalScale={1.55}
          roughnessMap={concrete_rough}
          roughness={0.7}
        />
      </Plane>
    </Suspense>
  );
};

export default Floor;
