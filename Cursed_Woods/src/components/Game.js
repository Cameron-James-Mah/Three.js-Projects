import { useEffect, useState } from "react";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import * as THREE from "three"
import Grass from './Grass'
import './Game.css'



const Game = () =>{
    let clock = new THREE.Clock()
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    
    
    document.body.appendChild( renderer.domElement );
    const controls = new PointerLockControls(camera, renderer.domElement)
    
    const moveSpeed = 0.1

    //Enemy variables, refactor later
    const monsterSpeed1 = 0.05
    const monsterRange1 = 20
    const roamOffset = 30
    let roaming = false
    let roamingTo = new THREE.Vector3()
    
    //wasd input
    let moveLeft = false
    let moveRight = false
    let moveForward = false
    let moveBack = false
    

    window.addEventListener('click', function(){ //Pointerlock controls
        controls.lock()  
    })
    document.addEventListener("keydown", movePlayer);
    document.addEventListener("keyup", stopPlayer);
    function movePlayer(event) {//keydown, move
        let keyCode = event.which
        if(keyCode == 87){//w
            moveForward = true
            moveBack = false
        }
        else if(keyCode == 65){//a
            moveLeft = true
            moveRight = false
        }
        else if(keyCode == 83){//s
            moveForward = false
            moveBack = true
        }
        else if(keyCode == 68){//d
            moveLeft = false
            moveRight = true
        }
    }

    function stopPlayer(event){//Keyup, stop movement
        let keyCode = event.which
        if(keyCode == 87){//w
            moveForward = false
        }
        else if(keyCode == 65){//a
            moveLeft = false
        }
        else if(keyCode == 83){//s
            moveBack = false
        }
        else if(keyCode == 68){//d
            moveRight = false
        }
        else{
            walking.fadeOut(0.2)
            action.play()
        }
    }

    function handleMovement(){ //Called in animation loop
        //Add halve the movement if moving in 2 directions at same time(ex: forward and left)
        if(moveLeft){
            controls.moveRight(moveSpeed*-1)
        }
        if(moveRight){
            controls.moveRight(moveSpeed)
        }
        if(moveForward){
            controls.moveForward(moveSpeed)
        }
        if(moveBack){
            controls.moveForward(moveSpeed*-1)
        }
    }

    const grass = new Grass(500, 150000)
    scene.add(grass)


    const spotLight = new THREE.SpotLight(0xffffff, 1.0, 10, Math.PI*0.6, 0, 1)
    camera.add( spotLight );
    camera.add(spotLight.target)
    spotLight.target.position.z = -8
    scene.add(camera)

    let mixer;
    let idle;
    let action;
    let walking

    let animationActions = []
    let monsters = []

    camera.position.y = 2.5
    camera.position.z = 15;
    
    const al = new THREE.AmbientLight('white', 2)
    scene.add(al)
	

    const loader = new FBXLoader()
        loader.load('models/zombie.fbx', (fbx)=>{
            fbx.scale.set(.01, .01, .01)
            fbx.traverse(c =>{
                c.castShadow = true
            })
            //scene.add(fbx)
        mixer = new THREE.AnimationMixer(fbx)
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
            idle = mixer.clipAction(anim.animations[0])
            idle.name = "idle"
            animationActions.push(idle)
            //idle.play()
        })
        anim.load('animations/Walking.fbx', (anim)=>{
            walking = mixer.clipAction(anim.animations[0])
            walking.name = "walking"
            animationActions.push(walking)
            walking.play()
        })
        anim.load('animations/Flying_Kick.fbx', (anim)=>{
            action = mixer.clipAction(anim.animations[0])
            action.name = "action"
            animationActions.push(action)
            action.setLoop(THREE.LoopOnce)
        })
        mixer.addEventListener('finished', function(e){
            //console.log(e)
            for(let animation of animationActions){
                //console.log(animation)
                if(e.action.name == animation.name){
                    mixer.stopAllAction()
                    walking.play()
                }
            }
        })
        monsters.push(fbx)
        scene.add(fbx)
        camera.add(listener)
        fbx.add(sound)
    
    })
    
    let clock2 = new THREE.Clock()
    let delta2 = 0
    let interval = 1/60 //60 fps
    

    function move(monster, pos){
        let movePos = new THREE.Vector3(pos.x, 0, pos.z)
        //let norm = new THREE.Vector3(playerPos.x-monster.position.x, 0, playerPos.z-monster.position.z)
        monster.lookAt(movePos)
        monster.translateZ(monsterSpeed1)
        if(roaming && monster.position.distanceTo(pos) < 2){//if roaming and made it to roam position
            //console.log("Finding new roam position")
            roaming = false
        }
    }

    function monsterAction(monster){
        if(monster.position.distanceTo(camera.position) < monsterRange1){
            move(monster, camera.position)
            roaming = false
        }
        else{
            roam(monster)
        }
    }

    function roam(monster){
        //Later on need to make sure roam point is within the map
        console.log(roaming)
        if(!roaming){
            roaming = true
            let min = monster.position.x - roamOffset
            let max = monster.position.x + roamOffset
            let posX = Math.random() * (max - min) + min
            min = monster.position.z - roamOffset
            max = monster.position.z + roamOffset
            let posZ = Math.random() * (max - min) + min
            roamingTo = new THREE.Vector3(posX, 0, posZ)
            //console.log(roamingTo)
        }
        else{
            move(monster, roamingTo)
        }
    }
    useEffect(()=>{
        const menuPanel = document.getElementById('menuPanel')
        controls.addEventListener('lock', () => (menuPanel.style.display = 'none'))
        controls.addEventListener('unlock', () => (menuPanel.style.display = 'block'))
        menuPanel.style.display = 'none'
        animate()
        function animate() {
            delta2 += clock2.getDelta()
            if(delta2 > interval && menuPanel.style.display != 'block'){
                renderer.render( scene, camera );
                const delta = clock.getDelta();
                handleMovement()
                if ( mixer ) mixer.update( delta );
                for(let monster of monsters){
                    monsterAction(monster)           
                }
                
            }
            requestAnimationFrame( animate );
        
        }
    },[])
    return(
        <>
        <div id="menuPanel">
            <p id="startButton">Click anywhere to continue</p>
        </div>
 
        </>
    )
}   

export default Game;