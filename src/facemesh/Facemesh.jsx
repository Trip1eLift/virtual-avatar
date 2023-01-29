import * as THREE from 'three';
import mock_data from './landmarks-mock.json';
import Landmarks_to_triangles from './landmarks2triangle';
import {useEffect} from 'react';
//import CustomShaderMaterial from './shader';
//import { extend } from "@react-three/fiber";

const l2t = new Landmarks_to_triangles();
let local_geometry;
let remote_geometry;

function Facemesh({landmarks, CT, Cal, MT, Skin, WSP}) {
  const calibrate = Cal.getter;
  const setCalibrate = Cal.setter;
  const manualTransformation = MT.getter;
  const transformation = CT.getter;
  const setTransformation = CT.setter;

  useEffect(() => {
    if (calibrate === false)
      return;
    console.log("Calibration reset.")
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
  }, [calibrate]);

  if (landmarks === undefined) {
    landmarks = mock_data;
    const defaultTrans = {
      trans: [-mock_data[0].x, -mock_data[0].y+0.04, -mock_data[0].z],
      rotate: new THREE.Quaternion(0.9980121, -0.0152293, -0.0399953, 0.0462641),
      //rotate: new THREE.Euler(3.0500366164090065, -0.0813303473740931, 0.026789092118113494, 'XYZ')
    };
    if (JSON.stringify(transformation) !== JSON.stringify(defaultTrans))
      setTransformation(defaultTrans);
  }

  const [dbPoints, normals, colors, itemSize, count] = l2t.map2DoublePoints(landmarks, Skin.getter);

  if (WSP !== undefined) {
    // TODO: Send transform/skin data every 5 seconds only
    // Fast encoder doc: https://gist.github.com/enepomnyaschih/72c423f727d395eeaa09697058238727
    // https://tutorialspots.com/webrtc-error-rtcdatachannel-send-queue-is-full-7200.html
    const pack = JSON.stringify({dbPoints: dbPoints, manualTransformation: manualTransformation, transformation: transformation, skin: Skin.getter});
    // https://stackoverflow.com/questions/20706783/put-byte-array-to-json-and-vice-versa
    const bytes = btoa(pack);
    console.log(bytes);
    WSP.sendFacemeshData("hello");
  }
  
  return (
    <FacemeshDisplay manualTransformation={manualTransformation} transformation={transformation} dbPoints={dbPoints} colors={colors} itemSize={itemSize} />
  );
}

function FacemeshDisplay({manualTransformation, transformation, dbPoints, colors, itemSize, local=true}) {
  var geometry = local_geometry;
  if (local === false) {
    geometry = remote_geometry;
  }
  // setAttribute force upload to GPU on hook
  if (geometry !== undefined)
    geometry.dispose();
  geometry = new THREE.BufferGeometry();
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

export {Facemesh, FacemeshDisplay};

// <customShaderMaterial />
// <meshStandardMaterial attach="material" color="hotpink" flatShading={true} vertexColors={true} />

function orientationVectors(nose, leye, reye) {
  const right = new THREE.Vector3(reye.x-leye.x, reye.y-leye.y, reye.z-leye.z);
  const up = new THREE.Vector3((reye.x+leye.x)/2 - nose.x, (reye.y+leye.y)/2 - nose.y, (reye.z+leye.z)/2 - nose.z);
  return [up.normalize(), right.normalize()];
}