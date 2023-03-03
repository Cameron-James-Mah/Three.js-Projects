import "./Menu.css"
import { useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import "./Game.css"
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";


let playerSpeed = 0.6
let spawnRate = 60
let spawn = 0
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, -80, 5);
camera.lookAt(0, 0, 0);
const renderer = new THREE.WebGLRenderer();
//renderer.setClearColor( 0xffffff );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 3, 3, 3 );

let collidableMeshList = []

let difficultyColors = ["green","skyblue", "red", "purple", "white"]

let clock = new THREE.Clock()
let delta = 0
let interval = 1/60 //60 fps

const Menu = () =>{
    const difficulty = useRef(0)
    const scoreRef = useRef(0)
    function clearCubes(){ //Clear past cubes from scene
        let i = 0
        for(i; i < collidableMeshList.length; i++){
            if(collidableMeshList[i].position.y < camera.position.y){ //Remove passed cubes from scene
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
    function animate(){
        delta += clock.getDelta()
        if(delta > interval){
            renderer.render( scene, camera );
            camera.position.y += playerSpeed
            scoreRef.current++
            clearCubes()
            if(spawn >= spawnRate){//Spawn next cubes 
                for(let i = 0; i < parseInt(process.env.REACT_APP_SPAWN_AMOUNT); i++){ //Spawn 50 cubes
                    const edges = new THREE.EdgesGeometry( geometry );
                    const newCube = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: difficultyColors[difficulty.current] } ) );
                    //const newCube = new THREE.Mesh(geometry, material)
                    newCube.position.y = camera.position.y + parseInt(process.env.REACT_APP_SPAWN_DISTANCE) + Math.floor(Math.random()*30) //Add variance to forward distance from player
                    newCube.position.x = Math.floor((Math.random()*parseInt(process.env.REACT_APP_SPAWN_RANGE))*(Math.round(Math.random()) ? 1 : -1))+camera.position.x //Add variance to side distance from player
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
        requestAnimationFrame( animate );
  }
  useEffect(()=>{
    playerSpeed = parseFloat(process.env.REACT_APP_PLAYER_SPEED)
    spawnRate = parseInt(process.env.REACT_APP_CUBE_SPAWN_RATE)
    animate()
  },[])

    return(
        <>
        </>
    )
}

export default Menu;