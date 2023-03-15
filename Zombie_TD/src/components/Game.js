import { isVisible } from '@testing-library/user-event/dist/utils';
import { useEffect } from 'react';
import * as THREE from 'three';
import { Color, Vector2, Vector3 } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import grass1 from '../sprites/grass1.png'
import road1 from '../sprites/road1.png'
import playerRifle from '../sprites/playerRifle0.png'
import skeletonSheet from '../sprites/skeleton_spritesheet.png'
import bulletSheet from '../sprites/bulletSheet.png'





const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//Using this mesh for raycast, tried using gridhelper but was not working
const planeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        visible: false
    })
)
planeMesh.rotateX(-Math.PI/2)
planeMesh.position.set(19.75, 0.01, 19.75)
scene.add(planeMesh)


const Game = () =>{
    let enemyList = []
    let turretList = []
    const interval = 1/60
    let delta = 0
    let clock = new THREE.Clock()
    let v1 = new THREE.Vector2();
    let v2 = new THREE.Vector3();
    let buyTurret = false
    let turretSelection = playerRifle

    class Enemy{
        health;
        x; 
        y;
        map;
        material;
        sprite;
        loader;
        speed = 0.03;

        //Animation variables
        currentTile = 0
        offsetX;
        tilesHoriz = 17
        constructor(level, x, z){
            this.health = level*2
            this.loader = new THREE.TextureLoader()
            this.map = this.loader.load( skeletonSheet );
            this.map.repeat.set(1/this.tilesHoriz, 1)
            this.material = new THREE.SpriteMaterial( { map: this.map } );
            this.sprite = new THREE.Sprite( this.material );
            this.sprite.position.set(x, 0.01, z)
            this.sprite.scale.set(0.7, 0.7, 0.7)
            scene.add(this.sprite)
        }
        getPosition(){
            return this.sprite.position;
        }
        animate(){
                this.offsetX = (this.currentTile%this.tilesHoriz)/this.tilesHoriz
                this.map.offset.x = this.offsetX
                this.currentTile++
                if(this.currentTile == this.tilesHoriz){
                    this.currentTile = 0
                }
                if(this.sprite.position.z == 19 && this.sprite.position.x < 17.5){//line1
                    this.sprite.position.x += this.speed
                }
                else if(this.sprite.position.x >= 17.5 && this.sprite.position.x <= 18 && this.sprite.position.z == 19){
                    this.sprite.material.rotation -= Math.PI/2
                    this.sprite.position.z += this.speed
                    this.sprite.position.x = 17.5
                }
                else if(this.sprite.position.x == 17.5 && this.sprite.position.z < 21){//line2
                    this.sprite.position.z += this.speed
                }
                else if(this.sprite.position.z >= 21 && this.sprite.position.x == 17.5){
                    this.sprite.material.rotation += Math.PI/2
                    this.sprite.position.x += this.speed
                    this.sprite.position.z = 21
                }   
                else if(this.sprite.position.z == 21 && this.sprite.position.x < 20){//line3
                    this.sprite.position.x += this.speed
                }
                else if(this.sprite.position.x >= 20 && this.sprite.position.z == 21){
                    this.sprite.material.rotation += Math.PI/2
                    this.sprite.position.z -= this.speed
                    this.sprite.position.x = 20
                }
                else if(this.sprite.position.x == 20 && this.sprite.position.z <= 21 && this.sprite.position.z > 16.5){//line4
                    this.sprite.position.z -= this.speed
                }
                else if(this.sprite.position.z <= 16.5 && this.sprite.position.x == 20){
                    this.sprite.material.rotation -= Math.PI/2
                    this.sprite.position.x += this.speed
                    this.sprite.position.z = 16.5
                }
                else if(this.sprite.position.z == 16.5 && this.sprite.position.x < 21){//line5
                    this.sprite.position.x += this.speed
                }
                else if(this.sprite.position.z == 16.5 && this.sprite.position.x >= 21){
                    this.sprite.material.rotation -= Math.PI/2
                    this.sprite.position.z += this.speed
                    this.sprite.position.x = 21
                }
                else if(this.sprite.position.x == 21 && this.sprite.position.z < 19.5){//line6
                    this.sprite.position.z += this.speed
                }
                else if(this.sprite.position.x == 21){
                    this.sprite.material.rotation += Math.PI/2
                    this.sprite.position.x += this.speed
                    this.sprite.position.z = 19.5
                }
                else if(this.sprite.position.z == 19.5){
                    this.sprite.position.x += this.speed
                }
                if(this.sprite.position.x >= 24.5){
                    scene.remove(this.sprite)
                    return true
                }
            
            return false
            
        }
    }
    class turret{
        fireRate;
        damage;
        map;
        material;
        sprite;
        range;
        constructor(type, x, z){
            if(type == "rifle"){
                this.range = 3.5
                this.fireRate = 0.25
                this.damage = 1
                this.map = new THREE.TextureLoader().load( playerRifle );
                this.material = new THREE.SpriteMaterial( { map: this.map } );
                this.sprite = new THREE.Sprite( this.material );
                this.sprite.position.set(x, 0.01, z)
                this.sprite.scale.set(0.7, 0.7, 0.7)
                scene.add(this.sprite)
            }
        }
        animate(){
            for(let i = enemyList.length-1; i >= 0; i--){
                if((Math.abs(this.sprite.position.x-enemyList[i].sprite.position.x)+Math.abs(this.sprite.position.z-enemyList[i].sprite.position.z)) <= this.range){
                    v1 = new THREE.Vector2(this.sprite.position.z, this.sprite.position.x)
                    v2 = new THREE.Vector2(enemyList[i].sprite.position.z, enemyList[i].sprite.position.x)
                    v1.sub(v2)
                    this.sprite.material.rotation = v1.angle()+Math.PI/2
                    break
                }
            }
            
            
        }
    }
    const gridSize = 20, tileSize = 0.5, tileOffset = 0.25 //Tilemap dimensions
    const mapOffset = 15 //Moved my map to the right so i can deal with only positive numbers for positioning
    //0 = grass, 1 = road
    const mapGrid = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                    [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
                    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]
    
    
    const enemySpeed = 1
    let helperGrid = new THREE.GridHelper(10, gridSize,"red", "red");
    helperGrid.position.set(19.75, 0.01, 19.75)
    scene.add(helperGrid)
    camera.position.set(19.75, 7, 19.75)
    camera.lookAt(new THREE.Vector3(19.75, 0, 19.75))
    
    //const controls = new OrbitControls( camera, renderer.domElement );
    

    const tileGeo = new THREE.PlaneGeometry(tileSize, tileSize)
    const grass1Mat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(grass1) })
    const road1Mat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(road1) })
    //const playerRifle = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(road1) })
    let newTurret = new turret("rifle", 19.5, 20)
    turretList.push(newTurret)
    
    /*
    const newTile = new THREE.Mesh(
        tileGeo,
        tileMat
    )
    newTile.rotateX(-Math.PI/2)
    newTile.position.set(15, 0, 15)
    scene.add(newTile)*/


    
    

    function createMap(){
        for(let i = 0; i < gridSize; i++){
            for(let j = 0; j < gridSize; j++){
                if(mapGrid[i][j] == 0){
                    const newTile = new THREE.Mesh(
                        tileGeo,
                        grass1Mat
                    )
                    newTile.rotateX(-Math.PI/2)
                    newTile.position.set((j*0.5)+mapOffset, 0, (i*0.5)+mapOffset)
                    scene.add(newTile)
                }
                else if(mapGrid[i][j] == 1){
                    const newTile = new THREE.Mesh(
                        tileGeo,
                        road1Mat
                    )
                    newTile.rotateX(-Math.PI/2)
                    newTile.position.set((j*0.5)+mapOffset, 0, (i*0.5)+mapOffset)
                    scene.add(newTile)
                }
            }
        }
    }
    const buyMap = new THREE.TextureLoader().load( playerRifle );
    const buyMaterial = new THREE.SpriteMaterial( { map: buyMap } );
    const buySprite = new THREE.Sprite( buyMaterial );
    buySprite.position.set(0, 0.01, 0)
    buySprite.scale.set(0.7, 0.7, 0.7)
    scene.add( buySprite );
    const raycaster = new THREE.Raycaster();
    window.addEventListener( 'mousemove', onPointerMove );
    function onPointerMove( event ) {
        if(buyTurret){
            pointer.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1
            pointer.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1
            // Perform raycast
            raycaster.setFromCamera( pointer, camera );

            // See if the ray from the camera into the world hits our mesh
            const intersects = raycaster.intersectObject( planeMesh );

            // Check if an intersection took place
            if ( intersects.length > 0 ) {
                let posX = (Math.round(intersects[0].point.x*2))/2;
                let posZ = (Math.round(intersects[0].point.z*2))/2;
                //console.log(posX, posZ);
                buySprite.position.set(posX, 0.01, posZ)
            }

        }
        

    }
    let pointer = new THREE.Vector2()
    window.addEventListener( 'click', onPointerClick );
    function onPointerClick(event){
        pointer.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1
        pointer.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1
        // Perform raycast
        raycaster.setFromCamera( pointer, camera );
        const intersectGrid = raycaster.intersectObject( planeMesh );
        if(buyTurret && intersectGrid.length > 0 && turretSelection == playerRifle){
            turretList.push(new turret("rifle", buySprite.position.x, buySprite.position.z))
        }

        // See if the ray from the camera into the world hits our mesh
        const intersectsRifle = raycaster.intersectObject( rifleSprite );

        // Check if an intersection took place
        if ( intersectsRifle.length > 0 ) {
            buyTurret = true
            turretSelection = playerRifle
        }
    }
    const map = new THREE.TextureLoader().load( playerRifle );
    const material = new THREE.SpriteMaterial( { map: map } );
    const rifleSprite = new THREE.Sprite( material );
    rifleSprite.position.set(27, 0.01, 16)
    scene.add( rifleSprite );


    document.addEventListener("keydown", keyclick);
    function keyclick(e){
        let keyCode = e.which
        if(keyCode == 32){
            let newEnemy = new Enemy(1, 15, 19)
            enemyList.push(newEnemy)
        }
        else if(keyCode == 27){
            buyTurret = false
            buySprite.position.set(0, 0.01, 0)
        }
    }


    function animate(){
        delta += clock.getDelta()
        if(delta > interval){
            let updatedEnemyList = []
            for(let i = 0; i < enemyList.length; i++){
                if(!enemyList[i].animate()){ //animate returns true if removed from scene
                    updatedEnemyList.push(enemyList[i])
                }
            }
            enemyList = updatedEnemyList
            for(let i = 0; i < turretList.length; i++){
                turretList[i].animate()
            }
            renderer.render( scene, camera );
        }
        
        requestAnimationFrame( animate );
    }
    useEffect(()=>{
        animate()
        createMap()
    },[])
    
}

export default Game;