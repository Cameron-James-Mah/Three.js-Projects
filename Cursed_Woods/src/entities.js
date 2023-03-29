import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import global from './globals.js'
export class Enemy{
    speed = 0.05;
    range = 20;
    roamOffset = 30;
    roaming;
    roamingTo;
    mixer;
    idle;
    action;
    walking;
    fbx;
    animationActions = []; 
    constructor(){
        this.roaming = false
        this.roamingTo = new THREE.Vector3()
        const loader = new FBXLoader()
        
        loader.load('models/zombie.fbx', (fbx)=>{
            fbx.scale.set(.01, .01, .01)
            fbx.traverse(c =>{
                c.castShadow = true
            })
            //global.scene.add(fbx)
        this.mixer = new THREE.AnimationMixer(fbx)
        const anim = new FBXLoader()
        const listener = new THREE.AudioListener();
        const sound = new THREE.PositionalAudio( listener );
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( 'sfx/BIGT.ogg', function( buffer ) {
            sound.setBuffer( buffer );
            sound.setRefDistance( 5 );
            sound.setLoop(true)
            sound.play()
        });
        anim.load('animations/Idle.fbx', (anim)=>{
            this.idle = this.mixer.clipAction(anim.animations[0])
            this.idle.name = "idle"
            //this.animationActions.push(idle)
            //idle.play()
        })
        anim.load('animations/Walking.fbx', (anim)=>{
            this.walking = this.mixer.clipAction(anim.animations[0])
            this.walking.name = "walking"
            //this.animationActions.push(this.walking)
            this.walking.play()
        })
        anim.load('animations/Drop_Kick.fbx', (anim)=>{
            this.action = this.mixer.clipAction(anim.animations[0])
            this.action.name = "action"
            //this.animationActions.push(action)
            //this.action.setLoop(THREE.LoopOnce)
        })
        /*
        this.mixer.addEventListener('finished', function(e){
            //console.log(e)
            for(let animation of this.animationActions){
                //console.log(animation)
                if(e.action.name == animation.name){
                    this.mixer.stopAllAction()
                    this.walking.play()
                }
            }
        })*/
        this.fbx = fbx
        //global.monsters.push(fbx)
        this.fbx.position.x += 30
        global.mixers.push(this.mixer)
        global.scene.add(fbx)
        global.camera.add(listener)
        fbx.add(sound)
    })
    }
    move(pos){
        let movePos = new THREE.Vector3(pos.x, 0, pos.z)
        //let norm = new THREE.Vector3(playerPos.x-monster.position.x, 0, playerPos.z-monster.position.z)
        this.fbx.lookAt(movePos)
        this.fbx.translateZ(this.speed)
        if(this.roaming && this.fbx.position.distanceTo(pos) < 2){//if roaming and made it to roam position
            //console.log("Finding new roam position")
            this.roaming = false
        }
    }

    monsterAction(){
        if(!this.fbx){//If fbx has not loaded yet
            return
        }
        if(this.fbx.position.distanceTo(global.camera.position) < 3 && !global.inSafeZone){ //in attack range and not in safe zone
            this.walking.fadeOut(0.2)
            this.walking.stop()
            this.action.play()
            global.dead = true
        }
        else if(this.fbx.position.distanceTo(global.camera.position) < this.range && !global.inSafeZone){ //in aggro range and not in safe zone
            this.move(global.camera.position)
            this.roaming = false
        }
        else{
            this.roam()
        }
    }

    roam(){
        //Later on need to make sure roam point is within the map
        if(!this.roaming){
            this.roaming = true
            let min = this.fbx.position.x - this.roamOffset
            let max = this.fbx.position.x + this.roamOffset
            let posX = Math.random() * (max - min) + min
            min = this.fbx.position.z - this.roamOffset
            max = this.fbx.position.z + this.roamOffset
            let posZ = Math.random() * (max - min) + min
            this.roamingTo = new THREE.Vector3(posX, 0, posZ)
            //console.log(roamingTo)
        }
        else{
            this.move(this.roamingTo)
        }
    }

}

export class Enemy1{

}