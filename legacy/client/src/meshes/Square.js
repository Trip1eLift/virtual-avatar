import { extend } from "@react-three/fiber";
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import glsl from 'babel-plugin-glsl/macro';

export default function Square() {
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

    const SquareShaderMaterial = shaderMaterial(
        // Uniform -> Allow to pass data from react component to glsl
        {
            uColor: new THREE.Color(0.0, 0.0, 1.0)
        },
        // Vertex Shader -> Corner points of polygons
        glsl`
            attribute vec3 color;
            varying lowp vec3 vColor;
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                vColor = color;
            }
        `,
        // Fragment Shader -> Color the polygon surface
        glsl`
            uniform vec3 uColor;
            varying lowp vec3 vColor;
            void main() {
                gl_FragColor = vec4(vColor, 1.0);
            }
        `
    );
      
    extend({ SquareShaderMaterial });
    
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
        <squareShaderMaterial uColor="hotpink"/>
        
        
      </mesh>
    );
}

/**
 * Documentation: https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
 * 
 * default vertex attributes provided by Geometry and BufferGeometry
 * attribute vec3 position;
 * attribute vec3 normal;
 * attribute vec2 uv;
 * 
 * 
 * Alternative way of setting mesh:
 * 
 * const geometry = new THREE.BufferGeometry();
 * geometry.setAttribute("position", new THREE.BufferAttribute(dbPoints, 3, false));
 * const mat = new THREE.MeshStandardMaterial({color:"hotpink", flatShading:true});
 * 
 * return (
 *    <mesh
 *      geometry={geometry}
 *      material={mat}
 *    />
 * )
 */