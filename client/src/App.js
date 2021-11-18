import React, {useEffect, useState, Suspense} from 'react';
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from '@react-three/drei';
import './Scene.css';
import * as THREE from 'three';
import Facemesh from './facemesh/Facemesh';
import Square from './meshes/Square';
import Landmarks_to_triangles from './facemesh/landmarks2triangle';

const l2t = new Landmarks_to_triangles();

const server_url = 'ws://127.0.0.1:5001';

export default function App() {

  const [landmarks, setLandmarks] = useState();

  // websocket part
  useEffect(() => {
    const client = new WebSocket(server_url);
    client.onopen = (() => {
      console.log('WebSocket Client Connected');
    });

    //client.send(JSON.stringify({body: "nothing"}));

    client.onmessage = ((msg) => {
      const data = JSON.parse(msg.data);
      //console.log(data.frame);
      setLandmarks(data.payload.landmarks);
      //console.log(data.payload.landmarks.length)
    });
  }, []);

  return (
    <>
      <div>RIGHT CLICK AREA</div>
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


