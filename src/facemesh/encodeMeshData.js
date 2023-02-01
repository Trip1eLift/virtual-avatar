import vertices_mapping from './facemesh_vertices_mapping.json';
import { Quaternion } from 'three';
import { Float16ToFloat32 as float32, Float32ToFloat16 as float16 } from './float16';

function encodeFacemesh(skin, manualTransformation, calibrateTransformation, landmarks) {
  // let points_buffer = new Float32Array(15 + vertices_mapping.length * 3 * 3); // Point buffer:     Size 7683 index -> 30732 bytes
  // let buffer = new Float32Array(15 + landmarks.length * 3);                   // Landmarks buffer: Size 1419 index -> 5676  bytes
  let buffer = new Uint16Array(15 + landmarks.length * 3);                       // float16 buffer:   Size 1419 index -> 2838  bytes
  // [skin, MT.trans(3), MT.rotate(4), CT.trans(3), CT.rotate(4), landmarks...]

  buffer[0] = float16(skin);

  buffer[1] = float16(manualTransformation.trans[0]);
  buffer[2] = float16(manualTransformation.trans[1]);
  buffer[3] = float16(manualTransformation.trans[2]);

  buffer[4] = float16(manualTransformation.rotate._x);
  buffer[5] = float16(manualTransformation.rotate._y);
  buffer[6] = float16(manualTransformation.rotate._z);
  buffer[7] = float16(manualTransformation.rotate._w);

  buffer[8] = float16(calibrateTransformation.trans[0]);
  buffer[9] = float16(calibrateTransformation.trans[1]);
  buffer[10] = float16(calibrateTransformation.trans[2]);

  buffer[11] = float16(calibrateTransformation.rotate._x);
  buffer[12] = float16(calibrateTransformation.rotate._y);
  buffer[13] = float16(calibrateTransformation.rotate._z);
  buffer[14] = float16(calibrateTransformation.rotate._w);

  for (var i = 0; i < landmarks.length; i++) {
    const gap = i * 3;
    buffer[gap + 15] = float16(landmarks[i].x);
    buffer[gap + 16] = float16(landmarks[i].y);
    buffer[gap + 17] = float16(landmarks[i].z);
  }
  
  return buffer;
}

function decodeFacemesh(buffer) {
  buffer = new Uint16Array(buffer); // Float16

  const skin = float32(buffer[0]);

  const manualTransformation     = {};
  manualTransformation.trans     = [float32(buffer[1]), float32(buffer[2]), float32(buffer[3])];
  manualTransformation.rotate    = new Quaternion(float32(buffer[4]), float32(buffer[5]), float32(buffer[6]), float32(buffer[7]));

  const calibrateTransformation  = {};
  calibrateTransformation.trans  = [float32(buffer[8]), float32(buffer[9]), float32(buffer[10])];
  calibrateTransformation.rotate = new Quaternion(float32(buffer[11]), float32(buffer[12]), float32(buffer[13]), float32(buffer[14]));

  var points = new Float32Array(vertices_mapping.length * 3 * 3);
  for (var i = 0; i < vertices_mapping.length; i++) {
    const gap = i * 9;
    points[gap + 0] = float32(buffer[15 + 3 * vertices_mapping[i][0] + 0]);
    points[gap + 1] = float32(buffer[15 + 3 * vertices_mapping[i][0] + 1]);
    points[gap + 2] = float32(buffer[15 + 3 * vertices_mapping[i][0] + 2]);

    points[gap + 3] = float32(buffer[15 + 3 * vertices_mapping[i][1] + 0]);
    points[gap + 4] = float32(buffer[15 + 3 * vertices_mapping[i][1] + 1]);
    points[gap + 5] = float32(buffer[15 + 3 * vertices_mapping[i][1] + 2]);

    points[gap + 6] = float32(buffer[15 + 3 * vertices_mapping[i][2] + 0]);
    points[gap + 7] = float32(buffer[15 + 3 * vertices_mapping[i][2] + 1]);
    points[gap + 8] = float32(buffer[15 + 3 * vertices_mapping[i][2] + 2]);
  }

  return {skin: skin, manualTransformation: manualTransformation, calibrateTransformation: calibrateTransformation, points: points};
}

export { encodeFacemesh, decodeFacemesh };

