import vertices_mapping from './facemesh_vertices_mapping.json';
import { Quaternion } from 'three';

// TODO: figure out how to use Float16Array later

function encodeFacemesh(skin, manualTransformation, calibrateTransformation, landmarks) {
  // let points_buffer = new Float32Array(15 + vertices_mapping.length * 3 * 3); // Point buffer:     Size 7683 index -> 30732 bytes
  let buffer = new Float32Array(15 + landmarks.length * 3);                      // Landmarks buffer: Size 1419 index -> 5676  bytes
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

  for (var i = 0; i < landmarks.length; i++) {
    const gap = i * 3;
    buffer[gap + 15] = landmarks[i].x;
    buffer[gap + 16] = landmarks[i].y;
    buffer[gap + 17] = landmarks[i].z;
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
  for (var i = 0; i < vertices_mapping.length; i++) {
    const gap = i * 9;
    points[gap + 0] = buffer[15 + 3 * vertices_mapping[i][0] + 0];
    points[gap + 1] = buffer[15 + 3 * vertices_mapping[i][0] + 1];
    points[gap + 2] = buffer[15 + 3 * vertices_mapping[i][0] + 2];

    points[gap + 3] = buffer[15 + 3 * vertices_mapping[i][1] + 0];
    points[gap + 4] = buffer[15 + 3 * vertices_mapping[i][1] + 1];
    points[gap + 5] = buffer[15 + 3 * vertices_mapping[i][1] + 2];

    points[gap + 6] = buffer[15 + 3 * vertices_mapping[i][2] + 0];
    points[gap + 7] = buffer[15 + 3 * vertices_mapping[i][2] + 1];
    points[gap + 8] = buffer[15 + 3 * vertices_mapping[i][2] + 2];
  }

  return {skin: skin, manualTransformation: manualTransformation, calibrateTransformation: calibrateTransformation, points: points};
}

export {encodeFacemesh, decodeFacemesh};