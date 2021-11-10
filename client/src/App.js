import './App.css';
import React, {useEffect, useState} from 'react';
import mock_data from './landmarks-payload.json';
import Landmarks_to_triangles from './landmarks2triangle';
import { Canvas, extend } from "@react-three/fiber";
import { OrbitControls, shaderMaterial } from '@react-three/drei';
import './Scene.css';
import * as THREE from 'three';
import glsl from 'babel-plugin-glsl/macro';

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
      const data = JSON.parse(msg.data);
      console.log(data.frame);
      setLandmarks(data.payload.landmarks);
      //console.log(data.payload.landmarks.length)
    });
  }, []);
  

  function Facemesh() {
    const [dbPoints, itemSize, count] = l2t.map2DoublePoints(landmarks);
    
    const expand = 1.5;
    return (
      <group >
      <group scale={[1.5 * expand, expand, expand]}>
        <mesh position={[-4.60, 6.1, -2]} scale={10} rotation={new THREE.Euler(-0.3, 3.16, 3.12, 'ZYX')}>
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

  function Square() {
    const vertices = new Float32Array([
      0.0, 0.0,  0.0,
      1.0, 0.0,  0.0,
      0.0, 1.0,  0.0,
        
      1.0, 0.0,  0.0,
      1.0, 1.0,  0.0,
      0.0, 1.0,  0.0
    ]);

    const colors = new Float32Array([
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 0.0, 1.0,

      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 0.0, 1.0,
    ]);
    
    return (
      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attachObject={["attributes", "position"]}
            array={vertices}
            itemSize={3}
            count={6}
          />
          <bufferAttribute
            attachObject={["attributes", "color"]}
            array={colors}
            itemSize={3}
            count={6}
          />
        </bufferGeometry>
        
      </mesh>
    );
  }

  function ShaderPractice() {
    const WaveShaderMaterial = shaderMaterial(
      // Uniform
      {},
      // Vertex Shader
      glsl`
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(possition, 1.0);
        }
      `,
      // Fragment Shader
      glsl``
    );

    extend({ WaveShaderMaterial });

    return (
      <mesh>
        <planeBufferGeometry args={[3, 5]} />
        <waveShaderMaterial color="lightblue" />
      </mesh>
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
    <div>RIGHT CLICK AREA</div>
      <Canvas>
        <OrbitControls />
        <ambientLight intensity={0.1} />
        <spotLight position={[10, 15, 20]} angle={0.5} intensity={0.8}/>
        <spotLight position={[-10, 15, 20]} angle={0.5} intensity={0.4}/>
        
        <ShaderPractice />
      </Canvas>
    </>
  );
}


/**
 * Texture mapping:
 * https://docs.pmnd.rs/react-three-fiber/tutorials/loading-textures
 * 
 * Shader tutorial: 11:50
 * https://www.youtube.com/watch?v=kxXaIHi1j4w
 */