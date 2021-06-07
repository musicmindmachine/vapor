import React from "react";
import * as THREE from "three";
import {
  EffectComposer,
  Bloom,
  SMAA,
  Vignette,
  ToneMapping,
  GodRays,
} from "@react-three/postprocessing";
import { useWorld } from "../storage/WorldState";

const CubePostEffects = (props) => {
  const { postProcessingEnabled } = useWorld((state) => state.graphics);
  return postProcessingEnabled ? (
    <EffectComposer>
      <ToneMapping
        adaptive={false}
        averageLuminance={0.0005}
        middleGrey={0.1199}
        maxLuminance={4.8}
        opacity={0.5}
      />
      <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
      <Vignette eskil={false} offset={0.1} darkness={0.5} />
      <SMAA preset={8} />
    </EffectComposer>
  ) : (
    <></>
  );
};

export default CubePostEffects;
