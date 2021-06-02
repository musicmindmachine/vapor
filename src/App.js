import { Suspense, useRef, useEffect, useMemo } from "react";
import produce from "immer";
import create from "zustand";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, OrbitControls, Line } from "@react-three/drei";
import { Dodecahedron, useMatcapTexture, Tetrahedron } from "@react-three/drei";
import {
	EffectComposer,
	Bloom,
	SMAA,
	Noise,
	Vignette,
} from "@react-three/postprocessing";

const darkGreyLines = new THREE.Color(0.01, 0.01, 0.01);

//Setup Central Data Storage
const useWorld = create((set, get) => ({
	world: {
		width: 22,
		height: 22,
		depth: 22,
		animalDensity: 0.15,
		preyRatio: 0.95,
	},
	worldMap: [],
	createWorld: () => {
		set((state) => {
			state.worldMap = null;
			state.worldMap = [];
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
		});
	},
	set: (fn) => set(produce(fn)),
}));

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
			<Dodecahedron
				ref={mesh}
				args={[0.4]}
				position={position}
				castShadow={true}>
				<meshMatcapMaterial attach="material" matcap={matcapTexture} />
			</Dodecahedron>
		)) ||
		(preyClass === 1 && (
			<Tetrahedron
				ref={mesh}
				args={[0.2]}
				position={position}
				castShadow={true}>
				<meshMatcapMaterial attach="material" matcap={matcapTexture} />
			</Tetrahedron>
		))
	);
};

const LineGrid = (props) => {
	const world = useWorld((state) => state.world);
	const lines = useMemo(() => {
		let newLines = [];
		let column,
			row,
			slice = 0;

		//width-depth
		for (column = -1; column <= 1; column += 0.5) {
			for (row = -1; row <= 1; row += 0.5) {
				newLines.push({
					key: newLines.length,
					start: [200, world.width * 0.5 * column, world.depth * 0.5 * row],
					end: [-200, world.width * 0.5 * column, world.depth * 0.5 * row],
				});
			}
		}

		//height-depth
		for (slice = -1; slice <= 1; slice += 0.5) {
			for (row = -1; row <= 1; row += 0.5) {
				newLines.push({
					key: newLines.length,
					start: [world.height * 0.5 * slice, 200, world.depth * 0.5 * row],
					end: [world.height * 0.5 * slice, -200, world.depth * 0.5 * row],
				});
			}
		}

		//height-width
		for (slice = -1; slice <= 1; slice += 0.5) {
			for (column = -1; column <= 1; column += 0.5) {
				newLines.push({
					key: newLines.length,
					start: [world.height * 0.5 * slice, world.width * 0.5 * column, 200],
					end: [world.height * 0.5 * slice, world.width * 0.5 * column, -200],
				});
			}
		}
		return newLines;
	}, [world]);

	return lines ? (
		<>
			{lines.map((instance) => {
				return (
					<Line
						key={instance.key.toString()}
						points={[instance.start, instance.end]}
						color={darkGreyLines}
						lineWidth={1}
						dashed={false}
					/>
				);
			})}
		</>
	) : (
		<></>
	);
};

const WorldMap = (props) => {
	const world = useWorld((state) => state.world);
	const worldMap = useWorld((state) => state.worldMap);
	return (
		<>
			{worldMap.map((slice, x) =>
				slice.map((column, y) =>
					column.map((unit, z) => {
						return (
							<Node
								position={[
									x - world.height * 0.5,
									y - world.width * 0.5,
									z - world.depth * 0.5,
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

//Configure the React App
const App = () => {
	const { depth } = useWorld((state) => state.world);
	const createWorld = useWorld((state) => state.createWorld);
	const camera = useRef();

	useEffect(() => {
		createWorld();
	}, [createWorld]);

	return (
		<Suspense fallback={null}>
			<Canvas mode={"concurrent"}>
				<LineGrid />
				<WorldMap />
				<fog attach="fog" args={["#2255ee", depth * 2, depth * 5]} />
				<PerspectiveCamera ref={camera} position={[100, 0, 0]} makeDefault />
				<OrbitControls
					camera={camera.current}
					minDistance={depth * 0.8 + 6}
					maxDistance={depth * 2.4 + 6}
					autoRotate={true}
				/>
				<EffectComposer>
					<SMAA preset={8} />
					<Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
					<Noise opacity={0.02} />
					<Vignette eskil={false} offset={0.1} darkness={1.1} />
				</EffectComposer>
			</Canvas>
		</Suspense>
	);
};

export default App;
