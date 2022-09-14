import * as THREE from 'three';
import mock_data from './landmarks-mock.json';
import Landmarks_to_triangles from './landmarks2triangle';
//import CustomShaderMaterial from './shader';
//import { extend } from "@react-three/fiber";

const l2t = new Landmarks_to_triangles();
let geometry;

export default function Facemesh({landmarks}) {
  if (landmarks === undefined)
    landmarks = mock_data;

  const [dbPoints, normals, colors, itemSize, count] = l2t.map2DoublePoints(landmarks);

  // TODO: make auto calibration ***
  // landmark pivots (1-based): 
  //    1: {"x":0.48297885060310364,"y":0.693518340587616,"z":-0.00966000184416771}
  //  105: {"x":0.43075257539749146,"y":0.5586864352226257,"z":-0.016254324465990067}
  //  334: {"x":0.5278557538986206,"y":0.5575304627418518,"z":-0.016914816573262215}

  // Transform 1
  const trans1 = [-landmarks[0].x, -landmarks[0].y, -landmarks[0].z];

  // Rotate
  const rotate = new THREE.Euler();

  // Transform 2
  const trans2 = [0.48297885060310364, 0.693518340587616, -0.00966000184416771];
  // *********************************

  // setAttribute force upload to GPU on hook
  if (geometry !== undefined)
    geometry.dispose();
  geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(dbPoints, itemSize, false));
  //geometry.setAttribute("normal",  new THREE.BufferAttribute(normals, itemSize, true));
  geometry.setAttribute("color",  new THREE.BufferAttribute(colors, itemSize, false));

  //extend({ CustomShaderMaterial });


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
      <group scale={[-envXscale * expand, expand, expand]} position={envPosition} rotation={envRotation}>
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