import vertices_mapping from './facemesh_vertices_mapping.json';
import static_random_int from './randomInt.json';
import * as THREE from 'three';

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

        const dbPoint = this.doubleSidedPoints(points);
        const count = dbPoint.length / 3;
        const normals = undefined; //this.points2flatnormal(dbPoint);
        const colors = this.generateColor(count);
        //console.log("triangle counts: ", count / 3); // 1704
        return [dbPoint, normals, colors, 3, count];
    }

    points2flatnormal(points) {
        let normals = new Float32Array(points.length);
        for (let i = 0; i < points.length; i += 9) {
            // Use shader to normalize the normals
            const a = new THREE.Vector3(points[i + 0], points[i + 1], points[i + 2]);
            const b = new THREE.Vector3(points[i + 3], points[i + 4], points[i + 5]);
            const c = new THREE.Vector3(points[i + 6], points[i + 7], points[i + 8]);
            const ab = new THREE.Vector3().subVectors(b, a);
            const ac = new THREE.Vector3().subVectors(c, a);
            let normal = new THREE.Vector3().crossVectors(ab, ac);
            normal.normalize();

            for (let j = 0; j < 9; j += 3) {
                normals[i + j + 0] = normal[0];
                normals[i + j + 1] = normal[1];
                normals[i + j + 2] = normal[2];
            }
        }
        return normals;
    }

    generateColor(count, mixed = false) {
        let colors = new Float32Array(count * 3);

        const skin_1 = ["hotpink", "skyblue", "yellow", "red", "yellowgreen", "pink", "orange"];
        const skin_2 = ["orange", "yellowgreen", "yellow"];
        const skin_3 = ["hotpink", "skyblue", "pink"];
        const color_list = skin_3;

        if (mixed === false) {
            const randIntList = this.getRandomIntArray(count / 3); // aka 1704
            for (let i = 0; i < colors.length; i += 9) {
                const color = new THREE.Color(color_list[randIntList[i / 9]]);
                //const color = new THREE.Color("yellowgreen")
                colors[i + 0] = color.r;
                colors[i + 1] = color.g;
                colors[i + 2] = color.b;

                colors[i + 3] = color.r;
                colors[i + 4] = color.g;
                colors[i + 5] = color.b;

                colors[i + 6] = color.r;
                colors[i + 7] = color.g;
                colors[i + 8] = color.b;
            }
        } else {
            const randIntList = this.getRandomIntArray(count);
            for (let i = 0; i < colors.length; i += 3) {
                const color = new THREE.Color(color_list[randIntList[i]]);
                colors[i + 0] = color.r;
                colors[i + 1] = color.g;
                colors[i + 2] = color.b;
            }
        }
        return colors;
    }

    getRandomIntArray(length, max = false) {
        if (max === false) {
            if (length === static_random_int.length) {
                return static_random_int;
            } else if (length < static_random_int) {
                return static_random_int.slice(0, length);
            } else {
                let list = new Int32Array(length);
                for (let i = 0; i < length; i++) {
                    list[i] = static_random_int[i % static_random_int.length];
                }
                return list;
            }
        } else {
            // if max not false, do real time
            // lenght of facemesh is 1704
            let list = new Int32Array(length);
            for (let i = 0; i < length; i++) {
                list[i] = Math.floor(Math.random() * max);
            }
            return list;
        }
        
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
        return doublePoints;
    }
}

export default Landmarks_to_triangles;