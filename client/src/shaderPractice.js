/**
 * Texture mapping:
 * https://docs.pmnd.rs/react-three-fiber/tutorials/loading-textures
 * 
 * Shader tutorial: 11:50
 * https://www.youtube.com/watch?v=kxXaIHi1j4w
 */

import React, { useRef } from 'react';
import { extend, useFrame, useLoader } from "@react-three/fiber";
import { shaderMaterial } from '@react-three/drei';

import * as THREE from 'three';
import glsl from 'babel-plugin-glsl/macro';

export default function  ShaderPractice() {
    const WaveShaderMaterial = shaderMaterial(
      // Uniform -> Allow to pass data from react component to glsl
      {
        uTime: 0,
        uColor: new THREE.Color(0.0, 0.0, 1.0),
        uTexture: new THREE.Texture(),
      },
      // Vertex Shader -> Corner points of polygons
      glsl`
        precision mediump float;
        varying vec2 vUv;
        varying float vWave;
        uniform float uTime;

        #pragma glslify: snoise3 = require(glsl-noise/simplex/3d);

        void main() {
          vUv = uv;
          vec3 pos = position;
          float noiseFreq = 1.5;
          float noiseAmp = 0.05;
          vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y, pos.z);
          pos.z += snoise3(noisePos) * noiseAmp;
          vWave = pos.z;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      // Fragment Shader -> Color the polygon surface
      glsl`
        precision mediump float;
        uniform vec3 uColor;
        uniform float uTime;
        uniform sampler2D uTexture;
        varying vec2 vUv;
        varying float vWave;

        void main() {
          float wave = vWave * 0.1;
          vec3 texture = texture2D(uTexture, vUv + wave).rgb;
          gl_FragColor = vec4(texture, 1.0);
        }
      `
    );
    
    extend({ WaveShaderMaterial });

    const ref = useRef();
    useFrame(({clock}) => {ref.current.uTime = clock.getElapsedTime()});

    const [image] = useLoader(THREE.TextureLoader, [
      "https://images.unsplash.com/photo-1604011092346-0b4346ed714e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1534&q=80",
    ])

    // Put wireframe attribute in shaderMaterial to show polygons lines 
    return (
      <mesh>
        <planeBufferGeometry args={[0.4, 0.6, 16, 16]} />
        <waveShaderMaterial uColor="hotpink" ref={ref} uTexture={image}/>
      </mesh>
    )
  }
