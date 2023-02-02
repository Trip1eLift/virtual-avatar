import * as THREE from 'three';
import mock_data from './landmarks-mock.json';
import Landmarks_to_triangles from './landmarks2triangle';
import {useEffect, useState} from 'react';
//import CustomShaderMaterial from './shader';
//import { extend } from "@react-three/fiber";

const l2t = new Landmarks_to_triangles();

function FacemeshControl({landmarks, CT, Cal, MT, Skin}) {
  const calibrate = Cal.getter;
  const setCalibrate = Cal.setter;
  const manualTransformation = MT.getter;
  const transformation = CT.getter;
  const setTransformation = CT.setter;

  useEffect(() => {
    if (calibrate === false)
      return;
    console.log("Calibration reset.");
    const [up, right] = orientationVectors(landmarks[0], landmarks[158], landmarks[385]);
    //console.log(up, right);
    const trans = [-landmarks[0].x, -landmarks[0].y+0.02, -landmarks[0].z];
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors( up, new THREE.Vector3(0, 1, 0) );
    const quaternion2 = new THREE.Quaternion();
    quaternion2.setFromUnitVectors( right, new THREE.Vector3(1, 0, 0.0) );
    quaternion.multiply(quaternion2);

    setTransformation({trans: trans, rotate: quaternion});
    setCalibrate(false);
  }, [calibrate, landmarks, setCalibrate, setTransformation]);

  if (landmarks === undefined) {
    landmarks = mock_data;
  }
  
  const points = l2t.map2meshPoints(landmarks);

  return (
    <Facemesh manualTransformation={manualTransformation} transformation={transformation} points={points} skin={Skin.getter} />
  );
}

function Facemesh({manualTransformation, transformation, points, skin, itemSize=3}) {
  
  // setAttribute force upload to GPU on hook
  const [geometry, ] = useState(new THREE.BufferGeometry());
  
  const dbPoints = l2t.doubleSidedPoints(points);
  const colors = l2t.generateColor(skin, dbPoints.length / 3);
  geometry.dispose();
  geometry.setAttribute("position", new THREE.BufferAttribute(dbPoints, itemSize, false));
  //geometry.setAttribute("normal",  new THREE.BufferAttribute(normals, itemSize, true));
  geometry.setAttribute("color",  new THREE.BufferAttribute(colors, itemSize, false));

  //extend({ CustomShaderMaterial });

  const expand = 20;
  return (
    <group scale={[-1.5*expand, expand, expand]}>
      <group position={manualTransformation.trans}>
        <group rotation={new THREE.Euler().setFromQuaternion( manualTransformation.rotate )} >
          <group rotation={new THREE.Euler().setFromQuaternion( transformation.rotate )} >
            <group position={transformation.trans}>
              <mesh geometry={geometry}>
                <meshStandardMaterial attach="material" color="hotpink" flatShading={true} vertexColors={true} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

export {FacemeshControl, Facemesh};

// <customShaderMaterial />
// <meshStandardMaterial attach="material" color="hotpink" flatShading={true} vertexColors={true} />

function orientationVectors(nose, leye, reye) {
  const right = new THREE.Vector3(reye.x-leye.x, reye.y-leye.y, reye.z-leye.z);
  const up = new THREE.Vector3((reye.x+leye.x)/2 - nose.x, (reye.y+leye.y)/2 - nose.y, (reye.z+leye.z)/2 - nose.z);
  return [up.normalize(), right.normalize()];
}