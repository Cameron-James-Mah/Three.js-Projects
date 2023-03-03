import { useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import "./Game.css"
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import bgm from '../media/CubeRunnerMusic.mp3'


let playerSpeed = 0.6
let playerTurnSpeed = 0.3
let spawnRate = 70
const playerSize = 0.6
let rotationSpeed = parseFloat(process.env.REACT_APP_CAMERA_ROTATION_SPEED)

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, -80, 5);
camera.lookAt(0, 0, 0);
const renderer = new THREE.WebGLRenderer();
//renderer.setClearColor( 0xffffff );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 3, 3, 3 );
const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );

//const playerGeometry = new THREE.BoxGeometry( 1, 1, 1 );
const playerMaterial = new THREE.MeshBasicMaterial( {color: "white"} );
//const player = new THREE.Mesh( playerGeometry, playerMaterial );

const shape = new THREE.Shape();

const x = 0;
const y = 0;

shape.moveTo(x - playerSize, y - playerSize);
shape.lineTo(x + playerSize, y - playerSize);
shape.lineTo(x, y + playerSize);

const playerGeometry = new THREE.ShapeGeometry(shape);

const player = new THREE.Mesh( playerGeometry, playerMaterial );


player.position.set(0, -73, 0)
scene.add(player)
let spawn = 0 //counter for knowing when to spawn next gen of cubes, incremented every game loop


let leftInput = false
let rightInput = false

let collidableMeshList = []


let difficultyColors = ["green","skyblue", "red", "purple", "white"]

let clock = new THREE.Clock()
let delta = 0
let interval = 1/60 //60 fps


function App() {
  const [score, setScore] = useState(0)
  const scoreRef = useRef(0)
  const gameOver = useRef(false)
  const bgmAudio = new Audio(bgm)
  const difficulty = useRef(0)
  
  bgmAudio.volume = 0.1

  document.addEventListener("keydown", movePlayer, false);
  document.addEventListener("keyup", stopPlayer, false);

  function movePlayer(event){
  let keyCode = event.which
    if(keyCode == 39){//arrow right
      //player.position.x += playerTurnSpeed
      //camera.position.x += playerTurnSpeed
      rightInput = true
    }
    else if(keyCode == 37){//arrow left
      //player.position.x -= playerTurnSpeed
      //camera.position.x -= playerTurnSpeed
      leftInput = true
    }
    
  }

  function stopPlayer(event){
    let keyCode = event.which
    if(keyCode == 39){//arrow right
      rightInput = false
    }
    else if(keyCode == 37){//arrow left
      leftInput = false
    }
  }

  function checkCollision(){ //detect player mesh collision with cube collisions
      for (let vertexIndex = 0; vertexIndex < player.geometry.attributes.position.array.length; vertexIndex++){ //Check collision with list of cube meshes
        let localVertex = new THREE.Vector3().fromBufferAttribute(player.geometry.attributes.position, vertexIndex).clone();
        let globalVertex = localVertex.applyMatrix4(player.matrix);
        let directionVector = globalVertex.sub( player.position );

        let ray = new THREE.Raycaster( player.position, directionVector.clone().normalize() );
        let collisionResults = ray.intersectObjects( collidableMeshList );
        if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) 
        {
            gameOver.current = true
            //console.log("hit")
        }
    }
  }

  function clearCubes(){ //Clear past cubes from scene
    let i = 0
    for(i; i < collidableMeshList.length; i++){
      if(collidableMeshList[i].position.y < player.position.y){ //Remove passed cubes from scene
        collidableMeshList[i].geometry.dispose()
        collidableMeshList[i].material.dispose()
        scene.remove(collidableMeshList[i])
      }
      else{
        break
      }
    }
    collidableMeshList = collidableMeshList.slice(i) //Update collideable cube array
  }

  function replay(){
    document.location.reload()
  }

  function animate(){
    delta += clock.getDelta()
    if(delta > interval){
      setScore(score => score + 1)
      scoreRef.current++
      renderer.render( scene, camera );
      camera.position.y += playerSpeed
      player.position.y += playerSpeed
      checkCollision()
      clearCubes()
      if(rightInput){
        player.position.x += playerTurnSpeed
        camera.position.x += playerTurnSpeed
        if(camera.rotation.z > -0.2){
          camera.rotation.z -= rotationSpeed
        }
        
      }
      else if(leftInput){
        player.position.x -= playerTurnSpeed
        camera.position.x -= playerTurnSpeed
        if(camera.rotation.z < 0.2){
          camera.rotation.z += rotationSpeed
        }
        
      }
      else{
        if(camera.rotation.z < 0){
          camera.rotation.z += rotationSpeed
        }
        else if(camera.rotation.z > 0){
          camera.rotation.z -= rotationSpeed
        }
      }
      if(spawn >= spawnRate){//Spawn next cubes 
        for(let i = 0; i < parseInt(process.env.REACT_APP_SPAWN_AMOUNT); i++){ //Spawn 50 cubes
          const edges = new THREE.EdgesGeometry( geometry );
          const newCube = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: difficultyColors[difficulty.current] } ) );
          //const newCube = new THREE.Mesh(geometry, material)
          newCube.position.y = player.position.y + parseInt(process.env.REACT_APP_SPAWN_DISTANCE) + Math.floor(Math.random()*30) //Add variance to forward distance from player
          newCube.position.x = Math.floor((Math.random()*parseInt(process.env.REACT_APP_SPAWN_RANGE))*(Math.round(Math.random()) ? 1 : -1))+player.position.x //Add variance to side distance from player
          scene.add(newCube)
          collidableMeshList.push(newCube) //Add to list of cubes to check for collisions
        }
        spawn = 0
      }
      else{
        spawn++
      }
      if(scoreRef.current == 1000){
        difficulty.current = 1
        for(let i = 0; i < collidableMeshList.length; i++){
          collidableMeshList[i].material.color = new THREE.Color( difficultyColors[difficulty.current] )
        }
        playerSpeed += parseFloat(process.env.REACT_APP_SPEED_INCREASE)
        spawnRate = Math.ceil(spawnRate*0.8)
      }
      if(scoreRef.current == 2000){
        difficulty.current = 2
        for(let i = 0; i < collidableMeshList.length; i++){
          collidableMeshList[i].material.color = new THREE.Color( difficultyColors[difficulty.current] )
        }
        playerSpeed += parseFloat(process.env.REACT_APP_SPEED_INCREASE)
        spawnRate = Math.ceil(spawnRate*0.8)
      }
      if(scoreRef.current == 3000){
        difficulty.current = 3
        for(let i = 0; i < collidableMeshList.length; i++){
          collidableMeshList[i].material.color = new THREE.Color( difficultyColors[difficulty.current] )
        }
        playerSpeed += parseFloat(process.env.REACT_APP_SPEED_INCREASE)
        spawnRate = Math.ceil(spawnRate*0.8)
      }
      if(scoreRef.current == 4000){
        difficulty.current = 4
        for(let i = 0; i < collidableMeshList.length; i++){
          collidableMeshList[i].material.color = new THREE.Color( difficultyColors[difficulty.current] )
        }
        playerSpeed += parseFloat(process.env.REACT_APP_SPEED_INCREASE)
        spawnRate = Math.ceil(spawnRate*0.8)
      }
      delta = delta % interval;
    }
    if(!gameOver.current){
        requestAnimationFrame( animate );
      }
    
    
    
  }
  useEffect(()=>{
    playerSpeed = parseFloat(process.env.REACT_APP_PLAYER_SPEED)
    playerTurnSpeed = parseFloat(process.env.REACT_APP_PLAYER_TURN_SPEED)
    spawnRate = parseInt(process.env.REACT_APP_CUBE_SPAWN_RATE)
    bgmAudio.play()
    animate()
  },[])
  return (
    <>
    <div id = "info">
      <p>Score: {score}</p>
    </div>
    <Dialog
        open={gameOver.current}
      >
        <DialogTitle id="responsive-dialog-title" textAlign={"center"}>
          {"GameOver"} 
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Your score: ${score}`}
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{justifyContent: "center"}}>
          <Button onClick={replay}>
            Replay
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default App;
