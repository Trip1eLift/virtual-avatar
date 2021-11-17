import vertices_mapping from './facemesh_vertices_mapping.json';

class Landmarks_to_triangles {
    constructor() {
        this.vmp = vertices_mapping;
    }

    printVMP() {
        console.log(this.vmp)
    }

    helloworldSquare() {
        const points = new Float32Array([
            0.0, 0.0,  0.0,
            1.0, 0.0,  0.0,
            0.0, 1.0,  0.0,
              
            1.0, 0.0,  0.0,
            1.0, 1.0,  0.0,
            0.0, 1.0,  0.0
        ]);
        return points;
    }

    testTriangle() {
        const points = new Float32Array([
            4.121029853820801, 5.969240188598633, 0.5103283524513245,
            4.131828308105469, 6.020913600921631, 0.3072405159473419,
            4.150081634521484, 5.867887496948242, 0.20225486159324646
        ]);
        return this.doubleSidedPoints(points);
    }

    map2DoublePoints(landmarks) {
        let points = new Float32Array(this.vmp.length * 3 * 3);
        const scale = 1;
        for (let i = 0;  i < this.vmp.length; i++) {
            points[i * 9 + 0] = landmarks[this.vmp[i][0]].x * scale;
            points[i * 9 + 1] = landmarks[this.vmp[i][0]].y * scale;
            points[i * 9 + 2] = landmarks[this.vmp[i][0]].z * scale;

            points[i * 9 + 3] = landmarks[this.vmp[i][1]].x * scale;
            points[i * 9 + 4] = landmarks[this.vmp[i][1]].y * scale;
            points[i * 9 + 5] = landmarks[this.vmp[i][1]].z * scale;

            points[i * 9 + 6] = landmarks[this.vmp[i][2]].x * scale;
            points[i * 9 + 7] = landmarks[this.vmp[i][2]].y * scale;
            points[i * 9 + 8] = landmarks[this.vmp[i][2]].z * scale;
        }

        return this.doubleSidedPoints(points);
    }

    doubleSidedPoints(points) {
        let doublePoints = new Float32Array(points.length * 2);
        for (let i = 0; i < points.length; i += 9) {
            for (let j = 0; j < 9; j++) {
                doublePoints[i * 2 + j] = points[i + j];
            }
            doublePoints[i * 2 +  9] = points[i + 0];
            doublePoints[i * 2 + 10] = points[i + 1];
            doublePoints[i * 2 + 11] = points[i + 2];

            doublePoints[i * 2 + 12] = points[i + 6];
            doublePoints[i * 2 + 13] = points[i + 7];
            doublePoints[i * 2 + 14] = points[i + 8];

            doublePoints[i * 2 + 15] = points[i + 3];
            doublePoints[i * 2 + 16] = points[i + 4];
            doublePoints[i * 2 + 17] = points[i + 5];
        }
        return [doublePoints, 3, doublePoints.length / 3];
    }
}

export default Landmarks_to_triangles;