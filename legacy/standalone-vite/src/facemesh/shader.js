import { shaderMaterial } from '@react-three/drei';
import glsl from 'glslify';
import * as three from 'three';

const CustomShaderMaterial = shaderMaterial(
    // Uniform -> Allow to pass data from react component to glsl
    {
        uColor: new three.Color(0.0, 0.0, 1.0),
    },
    // Vertex Shader -> Corner points of polygons
    glsl`
        attribute vec3 color;
        varying lowp vec3 vColor;
        //varying lowp vec3 vNormal;
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vColor = color;
            //vNormal = normal;
        }
    `
    ,
    // Fragment Shader -> Color the polygon surface
    glsl`
        varying lowp vec3 vColor;
        uniform vec3 uColor;
        void main() {
            gl_FragColor = vec4(vColor, 1.0);
        }
    `
);

export default CustomShaderMaterial;

/**
 * Documentation: https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
 * 
 * default vertex attributes provided by Geometry and BufferGeometry
 * attribute vec3 position;
 * attribute vec3 normal;
 * attribute vec2 uv;
 * 
 * 
 */