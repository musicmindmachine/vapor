import { Suspense, useRef, useEffect, useMemo } from "react";
import produce from "immer";
import create from "zustand";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import {
	PerspectiveCamera,
	OrbitControls,
	Line,
	GizmoViewcube,
	GizmoHelper,
	OrthographicCamera,
} from "@react-three/drei";
import { Dodecahedron, useMatcapTexture, Tetrahedron } from "@react-three/drei";
import {
	EffectComposer,
	Bloom,
	SMAA,
	Noise,
	Vignette,
	DepthOfField,
} from "@react-three/postprocessing";
import { AdditiveBlending } from "three";

//Setup Central Data Storage
const useWorld = create((set, get) => ({
	world: {
		width: 22,
		height: 22,
		depth: 22,
		animalDensity: 0.4,
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
	//get our world info
	const world = useWorld((state) => state.world);

	//define constant colors
	const lineDistLimit = world.depth / 2 + 50;

	const lines = useMemo(() => {
		const position = props.position ? props.position : { x: 0, y: 0, z: 0 };
		let newLines = [];
		let column,
			row,
			slice = 0;
		const verticies = new Float32Array({});

		//start looping through each orthogonal axis and make lines.
		//this just calculates the vertexes of each line for now

		//width-depth
		for (column = -1; column <= 1; column += 0.5) {
			for (row = -1; row <= 1; row += 0.5) {
				newLines.push({
					key: newLines.length,
					vertexArray: new Float32Array([
						lineDistLimit + position.x,
						world.width * 0.5 * column + position.y,
						world.depth * 0.5 * row + position.z,
						0 + position.x,
						world.width * 0.5 * column + position.y,
						world.depth * 0.5 * row + position.z,
						-lineDistLimit,
						world.width * 0.5 * column + position.y,
						world.depth * 0.5 * row + position.z,
					]), //hack for now remove
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
				newLines.push({
					key: newLines.length,
					vertexArray: new Float32Array([
						world.height * 0.5 * slice + position.x,
						lineDistLimit + position.y,
						world.depth * 0.5 * row + position.z,
						world.height * 0.5 * slice + position.x,
						0 + position.y,
						world.depth * 0.5 * row + position.z,
						world.height * 0.5 * slice + position.x,
						-lineDistLimit + position.y,
						world.depth * 0.5 * row + position.z,
					]), //hack for now remove
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
				newLines.push({
					key: newLines.length,
					vertexArray: new Float32Array([
						world.height * 0.5 * slice + position.x,
						world.width * 0.5 * column + position.y,
						lineDistLimit + position.z,
						world.height * 0.5 * slice + position.x,
						world.width * 0.5 * column + position.y,
						0 + position.z,
						world.height * 0.5 * slice + position.x,
						world.width * 0.5 * column + position.y,
						-lineDistLimit + position.z,
					]), //hack for now remove
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
	}, [world, lineDistLimit, props.position]);

	//return our line "objects"

	return lines ? (
		<>
			{lines.map((instance) => {
				return (
					<>
						<Line
							key={instance.key.toString()}
							points={[instance.start, instance.middle, instance.end]}
							color={"#ffffff"}
							vertexColors={[
								[0, 0, 0],
								[0.1, 0.1, 0.1],
								[0, 0, 0],
							]}
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

const WorldMap = (props) => {
	const world = useWorld((state) => state.world);
	const worldMap = useWorld((state) => state.worldMap);
	const position = props.position ? props.position : { x: 0, y: 0, z: 0 };
	return (
		<>
			{worldMap.map((slice, x) =>
				slice.map((column, y) =>
					column.map((unit, z) => {
						return (
							<Node
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
	return (
		<>
			<LineGrid position={position} />
			<WorldMap position={position} />
		</>
	);
};

//Configure the React App
const App = () => {
	const { depth, height } = useWorld((state) => state.world);
	const createWorld = useWorld((state) => state.createWorld);
	const camera = useRef();
	const orbitControls = useRef(null);

	useEffect(() => {
		createWorld();
	}, [createWorld]);

	return (
		<Suspense fallback={null}>
			<Canvas mode={"concurrent"} camera={{ position: [0.0, 1, 0.0] }}>
				<fog attach="fog" args={["#2255ee", depth * 2, depth * 5]} />
				<Simulation position={{ x: 0.0, y: 3 + height * 0.5, z: 0.0 }} />
				<GizmoHelper
					margin={[50, 50]}
					onTarget={() => orbitControls?.current?.target}
					onUpdate={() => orbitControls?.current?.update()}
					alignment="bottom-left" // widget alignment within scene
				>
					<GizmoViewcube />
				</GizmoHelper>
				<OrthographicCamera
					ref={camera}
					position={[10, 1.5, 0]}
					makeDefault
					fov={70}
				/>
				<OrbitControls
					ref={orbitControls}
					camera={camera.current}
					minDistance={depth * 0.05}
					maxDistance={depth * 2.4 + 6}
					enablePan={false}
					minAzimuthAngle={0}
					autoRotate={true}
				/>
				<EffectComposer>
					<SMAA preset={8} />
					<DepthOfField
						blendFunction={THREE.AdditiveBlending}
						focusDistance={0.0}
						focalLength={0.018}
						bokehScale={2}
						height={480}
					/>
					<Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
					<Noise opacity={0.02} />
					<Vignette eskil={false} offset={0.1} darkness={1.1} />
				</EffectComposer>
			</Canvas>
		</Suspense>
	);
};

export default App;
