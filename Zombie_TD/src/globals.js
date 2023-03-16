import * as THREE from 'three';
export default{
    enemyList: [], //Array of all bullets in play
    turretList: [], //Array of all turrets in play
    bulletList: [], //Array of all bullets in play
    extras: [], //Extra sprites, can treat them all the same as I only need them to play their animations until removal. ex(muzzleFlash)
    scene: new THREE.Scene()
}
//globals file so my classes can access the same variables