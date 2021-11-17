import { shaderMaterial } from '@react-three/drei';
import glsl from 'babel-plugin-glsl/macro';
import * as THREE from 'three';

const CustomShaderMaterial = shaderMaterial(
    // Uniform -> Allow to pass data from react component to glsl
    {
        uColor: new THREE.Color(0.0, 0.0, 1.0),
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
        varying lowp vec3 vColor;
        uniform vec3 uColor;
        void main() {
            gl_FragColor = vec4(uColor, 1.0);
        }
    `
);

export default CustomShaderMaterial;