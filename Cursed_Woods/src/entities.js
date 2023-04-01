import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import global from './globals.js'

const spawnOffset = 50
export class Zombie1{
    speed = 0.07;
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
    }
    load(){
        return new Promise(resolve=>{
            let loaded = 0
            const loader = new FBXLoader()
            loader.load('models/zombie1.fbx', (fbx)=>{
                fbx.scale.set(.015, .015, .015)
                fbx.traverse(c =>{
                    c.castShadow = true
                })
                //global.scene.add(fbx)
            this.mixer = new THREE.AnimationMixer(fbx)
            const anim = new FBXLoader()
            //const listener = new THREE.AudioListener();
            const sound = new THREE.PositionalAudio( global.listener );
            const audioLoader = new THREE.AudioLoader();
            audioLoader.load( 'sfx/Zombie/Zombie_Breathing.ogg', function( buffer ) { //zombie sounds
                sound.setBuffer( buffer );
                sound.setRefDistance( 1.3 );
                sound.setVolume(1.5)
                sound.setLoop(true)
                sound.play()
                loaded++
                if(loaded == 3){
                    resolve()
                }
            });
            
            anim.load('animations/Zombie_Walk1.fbx', (anim)=>{
                this.walking = this.mixer.clipAction(anim.animations[0])
                this.walking.name = "walking"
                //this.animationActions.push(this.walking)
                this.walking.play()
                loaded++
                if(loaded == 3){
                    resolve()
                }
            })
            anim.load('animations/Drop_Kick.fbx', (anim)=>{
                this.action = this.mixer.clipAction(anim.animations[0])
                this.action.name = "action"
                loaded++
                if(loaded == 3){
                    resolve()
                }
                //this.animationActions.push(action)
                //this.action.setLoop(THREE.LoopOnce)
            })
            this.fbx = fbx
            //global.monsters.push(fbx)
            this.fbx.position.x += spawnOffset
            global.mixers.push(this.mixer)
            global.scene.add(fbx)
            fbx.add(sound)
        })
        }
        )}
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
            let posZ, posX = -200
            while(posX > -100 && posX < 100 && posZ > -100 && posZ < 100){//make sure roaming to position within boundary
                let min = this.fbx.position.x - this.roamOffset
                let max = this.fbx.position.x + this.roamOffset
                posX = Math.random() * (max - min) + min
                min = this.fbx.position.z - this.roamOffset
                max = this.fbx.position.z + this.roamOffset
                posZ = Math.random() * (max - min) + min
            }
            
            this.roamingTo = new THREE.Vector3(posX, 0, posZ)
            //console.log(roamingTo)
        }
        else{
            this.move(this.roamingTo)
        }
    }

}


export class Zombie2{
    speed = 0.07;
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
    }
    load(){
        return new Promise(resolve=>{
            let loaded = 0
            const loader = new FBXLoader()
            loader.load('models/zombie2.fbx', (fbx)=>{
                fbx.scale.set(.015, .015, .015)
                fbx.traverse(c =>{
                    c.castShadow = true
                })
                //global.scene.add(fbx)
            this.mixer = new THREE.AnimationMixer(fbx)
            const anim = new FBXLoader()
            //const listener = new THREE.AudioListener();
            const sound = new THREE.PositionalAudio( global.listener );
            const audioLoader = new THREE.AudioLoader();
            audioLoader.load( 'sfx/Zombie/Zombie_Breathing.ogg', function( buffer ) { //zombie sounds
                sound.setBuffer( buffer );
                sound.setRefDistance( 1 );
                sound.setVolume(1.5)
                sound.setLoop(true)
                sound.play()
                loaded++
                if(loaded == 3){
                    resolve()
                }
            });
            anim.load('animations/Zombie_Walk1.fbx', (anim)=>{
                this.walking = this.mixer.clipAction(anim.animations[0])
                this.walking.name = "walking"
                //this.animationActions.push(this.walking)
                this.walking.play()
                loaded++
                if(loaded == 3){
                    resolve()
                }
            })
            anim.load('animations/Drop_Kick.fbx', (anim)=>{
                this.action = this.mixer.clipAction(anim.animations[0])
                this.action.name = "action"
                loaded++
                if(loaded == 3){
                    resolve()
                }
                //this.animationActions.push(action)
                //this.action.setLoop(THREE.LoopOnce)
            })
            this.fbx = fbx
            //global.monsters.push(fbx)
            this.fbx.position.x -= spawnOffset
            global.mixers.push(this.mixer)
            global.scene.add(fbx)
            fbx.add(sound)
        })
        }
        )}
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
            let posZ, posX = -200
            while(posX < -100 || posX > 100 || posZ < -100 || posZ > 100){//make sure roaming to position within boundary
                let min = this.fbx.position.x - this.roamOffset
                let max = this.fbx.position.x + this.roamOffset
                posX = Math.random() * (max - min) + min
                min = this.fbx.position.z - this.roamOffset
                max = this.fbx.position.z + this.roamOffset
                posZ = Math.random() * (max - min) + min
            }
            
            this.roamingTo = new THREE.Vector3(posX, 0, posZ)
            //console.log(roamingTo)
        }
        else{
            this.move(this.roamingTo)
        }
    }

}

export class Abomination{
    speed = 0.08;
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
    }
    load(){
        return new Promise(resolve=>{
            let loaded = 0
            const loader = new FBXLoader()
            loader.load('models/Abomination.fbx', (fbx)=>{
                fbx.scale.set(.015, .015, .015)
                fbx.traverse(c =>{
                    c.castShadow = true
                })
                //global.scene.add(fbx)
            this.mixer = new THREE.AnimationMixer(fbx)
            const anim = new FBXLoader()
            //const listener = new THREE.AudioListener();
            const sound = new THREE.PositionalAudio( global.listener );
            const audioLoader = new THREE.AudioLoader();
            audioLoader.load( 'sfx/Abomination/Abomination_Screaming.ogg', function( buffer ) { //zombie sounds
                sound.setBuffer( buffer );
                sound.setRefDistance( 1.2 );
                sound.setVolume(4.5)
                sound.setLoop(true)
                sound.play()
                loaded++
                if(loaded == 3){
                    resolve()
                }
                //Abomination sfx only when hes chasing you
            });
            anim.load('animations/Zombie_Walk1.fbx', (anim)=>{
                this.walking = this.mixer.clipAction(anim.animations[0])
                this.walking.name = "walking"
                //this.animationActions.push(this.walking)
                this.walking.play()
                loaded++
                if(loaded == 3){
                    resolve()
                }
            })
            anim.load('animations/Drop_Kick.fbx', (anim)=>{
                this.action = this.mixer.clipAction(anim.animations[0])
                this.action.name = "action"
                //this.animationActions.push(action)
                //this.action.setLoop(THREE.LoopOnce)
                loaded++
                if(loaded == 3){
                    resolve()
                }
            })
            
            this.mixer.addEventListener('finished', function(e){
                //console.log(e)
                for(let animation of this.animationActions){
                    //console.log(animation)
                    if(e.action.name == animation.name){
                        this.mixer.stopAllAction()
                        this.walking.play()
                    }
                }
            })
            this.fbx = fbx
            //global.monsters.push(fbx)
            this.fbx.position.x -= spawnOffset
            this.fbx.position.z -= spawnOffset
            global.mixers.push(this.mixer)
            global.scene.add(fbx)
            fbx.add(sound) 
    })
    }
    )}
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
            let posZ, posX = -200
            while(posX < -100 || posX > 100 || posZ < -100 || posZ > 100){//make sure roaming to position within boundary
                let min = this.fbx.position.x - this.roamOffset
                let max = this.fbx.position.x + this.roamOffset
                posX = Math.random() * (max - min) + min
                min = this.fbx.position.z - this.roamOffset
                max = this.fbx.position.z + this.roamOffset
                posZ = Math.random() * (max - min) + min
            }
            
            this.roamingTo = new THREE.Vector3(posX, 0, posZ)
            //console.log(roamingTo)
        }
        else{
            this.move(this.roamingTo)
        }
    }

}
