import './Scene.css';
import MediapipeCameraWrapper from "./MediapipeCameraWrapper";
import Facemesh from './facemesh/Facemesh';
import { useState, Suspense, useEffect } from 'react';
import { Canvas } from "@react-three/fiber";
import TopBar from './TopBar';
import * as THREE from 'three';
//import { OrbitControls } from '@react-three/drei';

export default function App() {

  const [landmarks, setLandmarks] = useState(undefined);
  const [firstUdf, setFirstUdf] = useState(true);
  const [calibrate, setCalibrate] = useState(false);
  const [manualTransformation, setManualTransformation] = useState({trans: [0, 0, 0], rotate: new THREE.Quaternion()});
  const [manualTransformationControl, setManualTransformationControl] = useState({x_pos: 50, y_pos: 50, yaw: 50, pitch:50});

  if (firstUdf === true && landmarks !== undefined) {
    setFirstUdf(false);
    setCalibrate(true);
  }

  function onResults(results) {
    if (results.multiFaceLandmarks) {
      setLandmarks(results.multiFaceLandmarks[0]);
      //console.log(results.multiFaceLandmarks[0][0]);
    }
  }

  return (
    <>
      <TopBar setCalibrate={setCalibrate} setManualTransformation={setManualTransformation} MTC={{getter: manualTransformationControl, setter: setManualTransformationControl}}/>

      <MediapipeCameraWrapper onResults={onResults}/>
      <Canvas>
        {/*<OrbitControls />*/}
        <ambientLight intensity={0.1} />
        <spotLight position={[10, 15, 20]} angle={0.5} intensity={0.8}/>
        <spotLight position={[-10, 15, 20]} angle={0.5} intensity={0.4}/>

        <Suspense fallback={null}>
          <Facemesh landmarks={landmarks} calibrate={calibrate} setCalibrate={setCalibrate} manualTransformation={manualTransformation} />
        </Suspense>
      </Canvas>
  </>
  );
}