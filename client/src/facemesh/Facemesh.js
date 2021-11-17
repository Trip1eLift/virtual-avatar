import { extend } from "@react-three/fiber";
import * as THREE from 'three';
import mock_data from './landmarks-mock.json';
import CustomShaderMaterial from './shader';
import Landmarks_to_triangles from './landmarks2triangle';


const l2t = new Landmarks_to_triangles();

export default function Facemesh({landmarks}) {
  if (landmarks === undefined)
    landmarks = mock_data;

  const [dbPoints, normals, colors, itemSize, count] = l2t.map2DoublePoints(landmarks);

  // setAttribute force upload to GPU on hook
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(dbPoints, itemSize, false));
  //geometry.setAttribute("normal",  new THREE.BufferAttribute(normals, itemSize, true));
  geometry.setAttribute("color",  new THREE.BufferAttribute(colors, itemSize, false));

  extend({ CustomShaderMaterial });


  // Adjust position and rotation
  let envPosition = [0.0, 0.0, 0.0];
  let envRotation = new THREE.Euler(0.0, 0.0, 0.0, 'XYZ');
  let envXscale = 1.5;
  if (process.env.REACT_APP_ENV !== undefined) {
    const ENV = process.env;
    envXscale = ENV.REACT_APP_X_scale;
    envPosition = [ENV.REACT_APP_X_translate, ENV.REACT_APP_Y_translate, ENV.REACT_APP_Z_translate];
    envRotation = new THREE.Euler(ENV.REACT_APP_X_rotation, ENV.REACT_APP_Y_rotation, ENV.REACT_APP_Z_rotation, 'XYZ');
  }
  const expand = 1.5;
  return (
    <group >
      <group scale={[envXscale * expand, expand, expand]} position={envPosition} rotation={envRotation}>
      	<mesh 
          position={[-4.60, 6.1, -2]} scale={10} rotation={new THREE.Euler(-0.3, 3.16, 3.12, 'ZYX')}
          geometry={geometry}
        >
					<meshStandardMaterial attach="material" color="hotpink" flatShading={true} vertexColors={true} />
        </mesh>
      </group>
    </group>
  );
}

// <customShaderMaterial />
// <meshStandardMaterial attach="material" color="hotpink" flatShading={true} vertexColors={true} />