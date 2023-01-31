const floatView = new Float32Array(1);
const int32View = new Int32Array(floatView.buffer);

function Float32ToFloat16(float32) {
  // Assume no NaN, expo overflow
  // Assume Inf is just max number plus 1, treat it as normal number

  floatView[0] = float32;
  const bits = int32View[0];

  const sign = (bits >> 16) & 0x8000;
  const mant = (bits >> 13) & 0x3ff;
  const expo_bit = (bits >> 23) & 0xff; // extract the exponent bits
  if (expo_bit == 0) {
    // zero special case
    return sign | 0x0 | 0x0;
  }
  const expo_int = expo_bit - 0x7f; // exponent of float32 in integer representation
  if (expo_int < -14) {
    // expo underflow
    return sign | 0x0 | 0x0;
  }
  const expo = (((expo_int) + 0xf) & 0x1f) << 10;

  return sign | expo | mant;
  // Please store the bytes in Uint16Array(1);
}

function Float16ToFloat32(float16) {
  // Assume no NaN and Inf is just max number plus 1, treat it as normal number
  // Expect float16 to be Uint16Array(1);
  const sign = (float16 & 0x8000) << 16;
  const mant = (float16 & 0x3ff) << 13;
  const expo_bit = (float16 >> 10) & 0x1f; // extract the exponent bits
  if (expo_bit == 0) {
    // zero special case
    int32View[0] = sign | 0x0 | 0x0;
    return floatView[0];
  }
  const expo = ((expo_bit - 0xf) + 0x7f) << 23;

  int32View[0] = sign | expo | mant;
  return floatView[0];
}

const testCase = [0, 0.5, 1, 15, -13, 123.3, 53.234, 0.00034, 0.0000000000000009346];
testCase.forEach((num) => {
  console.log(num, Float32ToFloat16(num), Float16ToFloat32((Float32ToFloat16(num))));
});

// node ./src/facemesh/float16.js