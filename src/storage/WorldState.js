import React from "react";
import produce from "immer";
import create from "zustand";

//Setup Central Data Storage
export const useWorld = create((set, get) => ({
  world: {
    width: 25,
    height: 25,
    depth: 25,
    animalDensity: 0.4,
    preyRatio: 0.95,
  },
  graphics: {
    postProcessingEnabled: true,
    useReflector: false,
  },
  worldMap: new Set(),
  createWorld: () => {
    /*
    set((state) => {
      state.worldMap = new Set();
      let wSlice,
        wCol,
        wUnit = 0;
      for (wSlice = 0; wSlice < get().world.height; wSlice++) {
        state.worldMap[wSlice] = [];
        for (wCol = 0; wCol < get().world.width; wCol++) {
          state.worldMap[wSlice][wCol] = [];
          for (wUnit = 0; wUnit < get().world.depth; wUnit++) {
            const type =
              Math.random() <= 1.0 - get().world.animalDensity
                ? 0
                : Math.random() < get().world.preyRatio
                ? 1
                : 2;
            state.worldMap[wSlice][wCol][wUnit] = type;
          }
        }
      }
    });*/
  },
  set: (fn) => set(produce(fn)),
}));
