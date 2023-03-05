import React from 'react';
import * as THREE from 'three';
import { useEffect, useRef, useState } from "react";
import Game from './components/Game';
import Menu from './components/Menu'
import './index.css'
import { Routes, Route} from "react-router-dom";

const App = () =>{
    const scene = new THREE.Scene()
    const renderer = new THREE.WebGLRenderer()
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
    camera.position.set(0, -80, 5);
    camera.lookAt(0, 0, 0);
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    return(
        <>
        <div>
            <Routes>
                <Route path ='/' element = {<Menu scene = {scene} renderer = {renderer} camera = {camera}/>}></Route>
                <Route path ='/Game' element = {<Game scene = {scene} renderer = {renderer} camera = {camera}/>}></Route>
            </Routes>
            </div>
        </>
    )
}

export default App