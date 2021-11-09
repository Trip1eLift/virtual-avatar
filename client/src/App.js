import './App.css';
import React, {useEffect, useState} from 'react';
import mock_data from './landmarks-payload.json';
import Landmarks_to_triangles from './landmarks2triangle';
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from '@react-three/drei';
import './styles.css';
import * as THREE from 'three'
//import { useUpdate } from "@react-three/cannon";

const server_url = 'ws://127.0.0.1:5001';
export default function App() {

  const l2t = new Landmarks_to_triangles();
  const [landmarks, setLandmarks] = useState(mock_data);

  // websocket part
  useEffect(() => {
    const client = new WebSocket(server_url);
    client.onopen = (() => {
      console.log('WebSocket Client Connected');
    });

    //client.send(JSON.stringify({body: "nothing"}));

    client.onmessage = ((msg) => {
      //console.log(msg);
      //console.log(msg.data);
      const data = JSON.parse(msg.data);
      console.log(data.frame);
      setLandmarks(data.payload.landmarks);
      //console.log(data.payload.landmarks.length)
      //console.log(JSON.stringify(data.payload.landmarks));
    });
  }, []);
  

  function Facemesh() {
    const [dbPoints, itemSize, count] = l2t.map2DoublePoints(landmarks);
    
    const expand = 1.5;
    return (
      <group >
      <group scale={[1.5 * expand, expand, expand]}>
        <mesh position={[-4.83, 6.1, -2]} scale={10} rotation={new THREE.Euler(-0.3, 3.16, 3.15, 'ZYX')}>
          <bufferGeometry>
            <bufferAttribute
              attachObject={["attributes", "position"]}
              array={dbPoints}
              itemSize={itemSize}
              count={count}
            />
          </bufferGeometry>
          
          <meshStandardMaterial
            attach="material"
            color="hotpink"
            flatShading={true}
          />
        </mesh>
      </group>
      </group>
    )
  }

  function Box() {
    return (
      <mesh>
        <boxBufferGeometry attach="geometry" />
        <meshLambertMaterial attach="material" color="hotpink" />
      </mesh>
    )
  }

  return (
    <>
    <div>HELLO WORLD</div>
      <Canvas>
        <OrbitControls />
        <ambientLight intensity={0.1} />
        <spotLight position={[10, 15, 20]} angle={0.5} intensity={0.8}/>
        <spotLight position={[-10, 15, 20]} angle={0.5} intensity={0.4}/>
        <Facemesh />
      </Canvas>
    </>
  );
}

