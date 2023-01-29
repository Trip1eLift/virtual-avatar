import vertices_mapping from './facemesh_vertices_mapping.json';
import { Float16Array } from "@petamoriken/float16";
import { Quaternion } from 'three';

// TODO: figure out how to use Float16Array later

function encodeFacemesh(skin, manualTransformation, calibrateTransformation, landmarks) {
  let buffer = new Float32Array(15 + vertices_mapping.length * 3 * 3);
  // [skin, MT.trans(3), MT.rotate(4), CT.trans(3), CT.rotate(4), landmarks...]

  buffer[0] = skin;

  buffer[1] = manualTransformation.trans[0];
  buffer[2] = manualTransformation.trans[1];
  buffer[3] = manualTransformation.trans[2];

  buffer[4] = manualTransformation.rotate._x;
  buffer[5] = manualTransformation.rotate._y;
  buffer[6] = manualTransformation.rotate._z;
  buffer[7] = manualTransformation.rotate._w;

  buffer[8] = calibrateTransformation.trans[0];
  buffer[9] = calibrateTransformation.trans[1];
  buffer[10] = calibrateTransformation.trans[2];

  buffer[11] = calibrateTransformation.rotate._x;
  buffer[12] = calibrateTransformation.rotate._y;
  buffer[13] = calibrateTransformation.rotate._z;
  buffer[14] = calibrateTransformation.rotate._w;

  for (var i = 0; i < vertices_mapping.length; i++) {
    const offset = i * 9;
    buffer[offset + 15] = landmarks[vertices_mapping[i][0]].x;
    buffer[offset + 16] = landmarks[vertices_mapping[i][0]].y;
    buffer[offset + 17] = landmarks[vertices_mapping[i][0]].z;

    buffer[offset + 18] = landmarks[vertices_mapping[i][1]].x;
    buffer[offset + 19] = landmarks[vertices_mapping[i][1]].y;
    buffer[offset + 20] = landmarks[vertices_mapping[i][1]].z;

    buffer[offset + 21] = landmarks[vertices_mapping[i][2]].x;
    buffer[offset + 22] = landmarks[vertices_mapping[i][2]].y;
    buffer[offset + 23] = landmarks[vertices_mapping[i][2]].z;
  }
  return buffer;
}

function decodeFacemesh(buffer) {
  buffer = new Float32Array(buffer);

  const skin = buffer[0];

  const manualTransformation     = {};
  manualTransformation.trans     = [buffer[1], buffer[2], buffer[3]];
  manualTransformation.rotate    = new Quaternion(buffer[4], buffer[5], buffer[6], buffer[7]);

  const calibrateTransformation  = {};
  calibrateTransformation.trans  = [buffer[8], buffer[9], buffer[10]];
  calibrateTransformation.rotate = new Quaternion(buffer[11], buffer[12], buffer[13], buffer[14]);

  var points = new Float32Array(vertices_mapping.length * 3 * 3);
  for (var i = 0; i < points.length; i++) {
    points[i] = buffer[i+15];
  }

  return {skin: skin, manualTransformation: manualTransformation, calibrateTransformation: calibrateTransformation, points: points};
}

export {encodeFacemesh, decodeFacemesh};