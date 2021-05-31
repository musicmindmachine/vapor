import * as THREE from "three";
import { Dodecahedron, useMatcapTexture } from "@react-three/drei";

const Node = (props) => {
    const {position, preyClass} = props;

    const [matcapTexture] = useMatcapTexture(21, 1024);

    return (
        <Dodecahedron args={[2]} position={[0, 0, 0]} castShadow={true}>
            <meshMatcapMaterial attach="material" matcap={matcapTexture} />
        </Dodecahedron>
    );
}

export default Node;