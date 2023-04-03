import * as THREE from 'three';
export default{
    scene: new THREE.Scene(),
    monsters: [],
    mixers: [],
    camera: new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ),
    inSafeZone: false,
    dead: false,
    listener: new THREE.AudioListener(),
    hunted: false,
    volumeOffset: 0.4
}