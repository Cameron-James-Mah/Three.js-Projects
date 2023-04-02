import { useEffect } from "react";
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from "three"
import './Game.css'
import global from '../globals.js'
import {Zombie1, Zombie2, Abomination, Enemy} from '../entities.js'
import forestFloor from '../textures/forest_texture.png'
import stoneWall from '../textures/stone_tiles.png'


const Game = () =>{
    let clock = new THREE.Clock()

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    
    document.body.appendChild( renderer.domElement );
    const controls = new PointerLockControls(global.camera, renderer.domElement)
    
    const moveSpeed = 0.08

    const outerBoundaryDistance = 99

    const totalTeddies = 5
    let currentTeddies = 0
    let victory = false
    
    //wasd input
    let moveLeft = false
    let moveRight = false
    let moveForward = false
    let moveBack = false
    let lockedMovement = false //When doing action like picking up teddy or sacrificing teddy
    let holding = null

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
        else if(keyCode == 69){ //e
            if(global.inSafeZone && holding){ //Sacrificed teddy
                global.scene.remove(holding)
                console.log(holding)
                for(let child of holding.children){ //Look for positional audio child
                    if(child.name == 'whisper'){ //stop positional audio
                        child.stop()
                    }
                }
                holding = null
                
                sacSound.play()
                currentTeddies++
                if(currentTeddies == totalTeddies){
                    victory = true
                }
            }
            for(let teddy of teddies){//Loop through all teddy bears to see if close to one
                if(teddy.position.distanceTo(global.camera.position) < 3){ //Picked up teddy
                    teddies.splice(teddies.indexOf(teddy), 1)
                    holding = teddy
                    console.log('picked up teddy')
                    break
                }
            }
            
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
    }

    function handleMovement(){ //Called in animation loop
        //Add halve the movement if moving in 2 directions at same time(ex: forward and left)
        let moving = false
        if(moveLeft){
            controls.moveRight(moveSpeed*-1)
            moving = true
        }
        if(moveRight){
            controls.moveRight(moveSpeed)
            moving = true
        }
        if(moveForward){
            controls.moveForward(moveSpeed)
            moving = true
        }
        if(moveBack){
            controls.moveForward(moveSpeed*-1)
            moving = true
        }
        //Boundary checks for outer perimeter
        if(global.camera.position.x > outerBoundaryDistance){
            global.camera.position.x = outerBoundaryDistance
        }
        if(global.camera.position.z > outerBoundaryDistance){
            global.camera.position.z = outerBoundaryDistance
        }
        if(global.camera.position.x < outerBoundaryDistance*-1){
            global.camera.position.x = outerBoundaryDistance*-1
        }
        if(global.camera.position.z < outerBoundaryDistance*-1){
            global.camera.position.z = outerBoundaryDistance*-1
        }
        if(moving && Math.floor(Math.random()*20) == 0){ //Don't want to play sound everytime
            let idx = Math.floor(Math.random()*walkingSound.length)
            //console.log(idx)
            walkingSound[idx].play()
        }
        else if(!moving){ //Feels too abrupt
            for(let sound of walkingSound){
                sound.stop()
            }
        }
        
    }

    function replay(){
        document.location.reload()
    }

    //ground 
    let groundTexture = new THREE.TextureLoader().load( forestFloor );
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set( 20, 20 );
    groundTexture.anisotropy = 16;
    groundTexture.encoding = THREE.sRGBEncoding;
    let groundMaterial = new THREE.MeshStandardMaterial( { map: groundTexture } );
    let groundMesh = new THREE.Mesh( new THREE.PlaneGeometry( 200, 200 ), groundMaterial );
    groundMesh.position.y = 0.0;
    groundMesh.rotation.x = - Math.PI / 2;
    groundMesh.receiveShadow = true;
    global.scene.add( groundMesh );

    //wall materials
    let wallTexture = new THREE.TextureLoader().load( stoneWall );
    wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set( 200, 10 );
    wallTexture.anisotropy = 16;
    wallTexture.encoding = THREE.sRGBEncoding;
    let wallMaterial = new THREE.MeshStandardMaterial( { map: wallTexture } );
    wallMaterial.side = THREE.DoubleSide

    //wall meshes
    let wallMesh = new THREE.Mesh( new THREE.PlaneGeometry( 200, 10 ), wallMaterial );
    wallMesh.receiveShadow = true;
    wallMesh.position.set(100, 0, 0)
    wallMesh.rotation.y = - Math.PI / 2;
    global.scene.add( wallMesh );

    let wallMesh2 = new THREE.Mesh( new THREE.PlaneGeometry( 200, 10 ), wallMaterial );
    wallMesh2.receiveShadow = true;
    wallMesh2.rotation.y = - Math.PI / 2;
    wallMesh2.position.set(-100, 0, 0)
    global.scene.add( wallMesh2 );

    let wallMesh3 = new THREE.Mesh( new THREE.PlaneGeometry( 200, 10 ), wallMaterial );
    wallMesh3.receiveShadow = true;
    wallMesh3.position.set(0, 0, 100)
    global.scene.add( wallMesh3 );

    let wallMesh4 = new THREE.Mesh( new THREE.PlaneGeometry( 200, 10 ), wallMaterial );
    wallMesh4.receiveShadow = true;
    wallMesh4.position.set(0, 0, -100)
    global.scene.add( wallMesh4 );
    
    //Lighting
    //Camera lighting
    const spotLight = new THREE.SpotLight(0xffffff, 1, 10, Math.PI*0.6, 0, 1)
    global.camera.add( spotLight );
    global.camera.add(spotLight.target)
    spotLight.target.position.z = -8
    global.scene.add(global.camera)

    const safeLight = new THREE.PointLight( 0xff0000, 1, 40 );
    safeLight.position.set( 0, 10, 0 );
    global.scene.add( safeLight );

    global.camera.position.y = 2.5
    //global.camera.position.set(90, 2.5, 90)
    
    //Ambient light for testing purposes
    //const al = new THREE.AmbientLight('white', 2)
    //global.scene.add(al)

    //Walking sfx
    let walkingSound = [] //Contains all walking sound variants, play random one when walking
    const walkingVolume = 0.4
    const audioLoader = new THREE.AudioLoader();
    
    for(let i = 1; i < 7; i++){
        audioLoader.load( `sfx/player/walking${i}.ogg`, function( buffer ) {
            const sound = new THREE.PositionalAudio( global.listener );
            sound.setBuffer( buffer );
            sound.setRefDistance( 20 );
            sound.setLoop(false)
            sound.setVolume(walkingVolume)
            walkingSound.push(sound)
            global.camera.add(sound)
        });
    }

    const sacSound = new THREE.PositionalAudio( global.listener );
    audioLoader.load( 'sfx/Teddy_Sacrifice.ogg', function( buffer ) {
        sacSound.setBuffer( buffer );
        sacSound.setRefDistance( 20 );
        sacSound.setLoop(false);
        sacSound.setVolume(0.8)
    });


    //BG sfx
    /*
    audioLoader.load( 'sfx/BG.ogg', function( buffer ) {
        const sound = new THREE.PositionalAudio( global.listener );
        sound.setBuffer( buffer );
        sound.setRefDistance( 200 );
        sound.setLoop(true)
        sound.setVolume(1.5)
        sound.play()
    });*/
    
    
    global.listener.position.y += 2.5
    global.camera.add(global.listener)
    
    let clock2 = new THREE.Clock()
    let delta2 = 0
    let interval = 1/60 //60 fps
    
    //Safe zone 
    const gltfLoader = new GLTFLoader()
    function loadAltar(){
        return new Promise(resolve=>{
            gltfLoader.load('models/altar/altar.gltf', (altar)=>{
                altar.scene.scale.set(10, 5, 10)
                altar.scene.position.y = 1.3
                global.scene.add(altar.scene)
                resolve()
            })
        })
    }

    let teddies = []

    function loadTeddy(posX, posZ){
        return new Promise(resolve=>{
            gltfLoader.load('models/teddy/teddy.gltf', (teddy)=>{
                teddy.scene.scale.set(0.5, 0.5, 0.5)
                teddy.scene.position.x = posX
                teddy.scene.position.z = posZ
                teddy.scene.position.y = 0.1
                teddy.scene.rotation.x += Math.PI/2
                teddy.scene.rotation.y += Math.PI/2
                teddy.scene.rotation.y += Math.PI/2
                const sound = new THREE.PositionalAudio( global.listener );
                audioLoader.load( 'sfx/whisper.ogg', function( buffer ) { //zombie sounds
                    sound.setBuffer( buffer );
                    sound.setRefDistance( 0.8 );
                    sound.setRolloffFactor(1.5)
                    sound.setVolume(7.0)
                    sound.setLoop(true)
                    sound.name = 'whisper'
                    sound.play()
                });
                teddy.scene.add(sound)
                global.scene.add(teddy.scene)
                teddies.push(teddy.scene)
                resolve()
            })
        })
    }
    /*
    gltfLoader.load('models/altar.gltf', (altar)=>{
        altar.scene.scale.set(10, 10, 10)
        global.scene.add(altar.scene)
    })*/
    //Instantiate monsters
    //global.monsters.push(new Zombie1())
    //global.monsters.push(new Zombie2())
    //global.monsters.push(new Abomination())
    let loaded = false
    let e1 = new Zombie1()
    let e2 = new Zombie2()
    let e3 = new Abomination()
    let promises = [e1.load(), e2.load(), e3.load(), loadAltar(), loadTeddy(0, 15), loadTeddy(50, 10), loadTeddy(50, 50), loadTeddy(30, 60), loadTeddy(70, 90)]

    Promise.all(promises).then(()=>{
        //console.log(1)
        global.monsters.push(e1)
        global.monsters.push(e2)
        global.monsters.push(e3)
        loaded = true
    })

    useEffect(()=>{
        const menuPanel = document.getElementById('menuPanel')
        const menuPanel2 = document.getElementById('menuPanel2')
        const loadingPanel = document.getElementById('loadingPanel')
        const BGaudio = document.querySelector("audio");
        const actionDiv = document.getElementById('actionText')
        const actionText = document.getElementById('actionText')
        const startButton = document.getElementById('startButton')
        const scoreText = document.getElementById('scoreText')
        BGaudio.volume = 0.8;
        BGaudio.loop = true
        controls.addEventListener('lock', function(){
            menuPanel.style.display = 'none'
            BGaudio.play()
        })
        controls.addEventListener('unlock', function(){ //Fired at pause screen and gameover screen
            if(!global.dead){
                menuPanel.style.display = 'block'
            }
            else{
                menuPanel2.style.display = 'block'
                BGaudio.pause()
                BGaudio.src = 'sfx/Death_Scream.ogg'
                BGaudio.volume = 0.1;
                BGaudio.loop = false
                BGaudio.play()

            }
        })
        menuPanel.style.display = 'none'
        menuPanel2.style.display = 'none'
        actionDiv.style.display = 'none'
        animate()
        function animate() {
            delta2 += clock2.getDelta()
            if(loaded){
                loadingPanel.style.display = 'none'
            }
            if(delta2 > interval && menuPanel.style.display != 'block' && loaded && !victory){
                //console.log(global.monsters.length)
                //console.log(global.camera.position)
                scoreText.innerHTML = `Sacrificed: ${currentTeddies}/${totalTeddies}`
                const delta = clock.getDelta();
                for(let mixer of global.mixers){ //Loop through all enemy mixers
                    mixer.update( delta )
                }
                for(let monster of global.monsters){ //Loop through all enemies
                    monster.monsterAction() //Unlocks pointerlockcontrols and fires event listener      
                }
                let teddyInRange = false
                for(let teddy of teddies){//Loop through all teddy bears to see if close to one
                    if(teddy.position.distanceTo(global.camera.position) < 3){//teddy in range
                        teddyInRange = true
                        break;
                    }
                }
                if(teddyInRange){
                    actionDiv.style.display = 'block'
                    actionText.innerHTML = 'Click e to pick up Teddy Bear'
                }
                else if(global.inSafeZone && holding){
                    actionDiv.style.display = 'block'
                    actionText.innerHTML = 'Click e to sacrifice Teddy Bear' 
                }
                else{
                    actionDiv.style.display = 'none'
                }
                
                if(global.dead){ //if character dead, show gameover screen
                    controls.unlock()
                }
                else{
                    handleMovement()
                    if(global.camera.position.x > -4 && global.camera.position.x < 4 && global.camera.position.z > -4 && global.camera.position.z < 4){
                        global.inSafeZone = true
                    }
                    else{
                        global.inSafeZone = false
                    }
                }
                if(holding){
                    let v = new THREE.Vector3( 0, 0, 1 );
                    v.applyQuaternion( global.camera.quaternion );
                    holding.quaternion.copy(global.camera.quaternion);
                    holding.position.copy(global.camera.position).add(v.multiplyScalar(-0.5));
                    holding.position.y -= 1
                    holding.rotation.y += Math.PI/2
                    holding.rotation.y += Math.PI/2
                    holding.rotation.y += Math.PI/2
                    holding.rotation.y += Math.PI/2
                    holding.lookAt(global.camera.position)
                }
                
            }
            if(victory){
                menuPanel2.style.backgroundColor = 'green'
                startButton.innerHTML = 'Victory'
                menuPanel2.style.display = 'block'
            }
            else{
                renderer.render( global.scene, global.camera );
                requestAnimationFrame( animate );
            }
            
        
        }
    },[])
    return(
        <>
        <div id="menuPanel">
            <p id="startButton">Click anywhere to continue</p>
        </div>
        <div id="menuPanel2" onClick={replay}>
            <p id="startButton">Gameover, click anywhere to replay</p>
        </div>
        <div id="loadingPanel">
            <p id="startButton">Loading...</p>
        </div>
        <div id = 'actionDiv'>
            <p id = "actionText">Click e to pick up Teddy Bear</p>
        </div>
        <p id = 'scoreText'>Sacrificed 0/0</p>
        <audio src = "sfx/BG.ogg" ></audio>
        </>
    )
}   

export default Game;