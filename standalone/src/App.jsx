import './Scene.css';
import MediapipeCameraWrapper from "./MediapipeCameraWrapper";
import Facemesh from './facemesh/Facemesh';
import { useState, Suspense } from 'react';
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from '@react-three/drei';

export default function App() {

  const [landmarks, setLandmarks] = useState(undefined);

  function onResults(results) {
    if (results.multiFaceLandmarks) {
      setLandmarks(results.multiFaceLandmarks[0]);
      //console.log(results.multiFaceLandmarks[0][0]);
    }
  }

  return (
    <>
      <div>RIGHT CLICK AREA</div>
      <MediapipeCameraWrapper onResults={onResults}/>
      <Canvas>
        <OrbitControls />
        <ambientLight intensity={0.1} />
        <spotLight position={[10, 15, 20]} angle={0.5} intensity={0.8}/>
        <spotLight position={[-10, 15, 20]} angle={0.5} intensity={0.4}/>

        <Suspense fallback={null}>
          <Facemesh landmarks={landmarks} />
        </Suspense>
      </Canvas>
  </>
  );
}