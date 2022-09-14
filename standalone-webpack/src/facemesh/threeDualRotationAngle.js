import * as THREE from 'three';

class Three_dual_rotation_angle {
    constructor(vec1, vec2) {
        // Vectors of target coordinates
        this.vec1 = vec1.normalize();
        this.vec2 = this.perpendicularize(vec1, vec2).normalize();
    }

    perpendicularize(vec1, vec2) {
        // find new vec2' such that vec2' is perpendicular to vec1
        // vec2 - norm(vec1) * [vec1 dot vec2]
        return vec2.add( vec1.normalize().addScaler( -vec1.dot(vec2) ) );
    }

    angle(vec1p, vec2p) {
        // calculate the euler angle that rotates vec1p, vec2p to this.vec1, this.vec2

        vec1p = vec1p.normalize();
        vec2p = this.perpendicularize(vec1p, vec2p).normalize();

        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors( this.vec1, vec1p );

        vec2p.applyQuaternion( quaternion );
        const quaternion2 = new THREE.Quaternion();
        quaternion2.setFromUnitVectors( this.vec2, vec2p );

        quaternion.multiplyQuaternions(quaternion2);
        const euler = new THREE.Euler();

        euler.setFromQuaternion(quaternion);
        return euler;
    }

}