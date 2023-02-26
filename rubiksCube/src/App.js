import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import React, { useState, useEffect, useRef } from 'react';
let camera, scene, renderer;
camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
camera.position.z = 2;
scene = new THREE.Scene();
//const positionAttribute = geometry.getAttribute( 'position' );
let colors = [];
let cubeOffSet = 0.23
const color = new THREE.Color();
const group = new THREE.Group()

for(let k = 0; k < 3; k++){//layer from starting camera pov
  for(let i = 0; i < 3; i++){//row from starting camera pov
    for(let j  = 0; j < 3; j++){//column from starting camera pov
      //let left = "black", front = "black", right = "black", bottom = "black", top = "black", back = "black" //All the sides of the cube
      let colorVals = Array(6).fill("black")
      let xPos = 0, yPos = 0, zPos = 0
      if(j == 0){//leftmost column
        //left = "orange"
        xPos = cubeOffSet*-1
        colorVals[1] = "orange"
      }
      if(j == 2){//rightmost column
        //right = "red"
        xPos = cubeOffSet
        colorVals[0] = "red"
      }
      if(i == 0){//top row
        //top = "white"
        yPos = cubeOffSet
        colorVals[2] = "white"
      }
      if(i == 2){//bottom row
        //bottom = "blue"
        yPos = cubeOffSet*-1
        colorVals[3] = "blue"
      }
      if(k == 0){//front face
        //front = "green"
        colorVals[4] = "green"
        zPos = cubeOffSet
      }
      if(k == 2){//back face
        //back = "yellow"
        colorVals[5] = "yellow"
        zPos = cubeOffSet*-1
      }

      for ( let i = 0; i < 6; i ++ ) {
        color.set(colorVals[i])
        colors.push( color.r, color.g, color.b );
        colors.push( color.r, color.g, color.b );
        colors.push( color.r, color.g, color.b );

        colors.push( color.r, color.g, color.b );
        colors.push( color.r, color.g, color.b );
        colors.push( color.r, color.g, color.b );    
      }
      const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 ).toNonIndexed();
      const material = new THREE.MeshBasicMaterial( { vertexColors: true } ); 
      geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
      let mesh = new THREE.Mesh( geometry, material );
      mesh.position.x = xPos
      mesh.position.y = yPos
      mesh.position.z = zPos
      group.add(mesh)
      colors = []
    }
  }
}

renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


const controls = new OrbitControls( camera, renderer.domElement ); 
document.addEventListener("keydown", cubeAction, false);
function cubeAction(event){
  let keyCode = event.which
  if(keyCode == 40){//arrow down
    group.rotation.x += Math.PI / 2 //90 degrees
    //console.log("down")
  }
  else if(keyCode == 39){//arrow right
    group.rotation.y += Math.PI / 2 //90 degrees
    //console.log("right")
  }
  else if(keyCode == 38){//arrow up
    group.rotation.x -= Math.PI / 2 //90 degrees
    //console.log("up")
  }
  else if(keyCode == 37){//arrow left
    group.rotation.y -= Math.PI / 2 //90 degrees
    //console.log("left")
  }
}

function animate(){
    requestAnimationFrame( animate );
	  renderer.render( scene, camera );
    
}

function App() {
  useEffect(()=>{
    scene.add(group)
    animate()
  },[])
  return (
    <>

    </>
  );
}

export default App;
