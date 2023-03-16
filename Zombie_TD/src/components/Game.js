import { isVisible } from '@testing-library/user-event/dist/utils';
import { useEffect } from 'react';
import * as THREE from 'three';
import grass1 from '../sprites/grass1.png'
import road1 from '../sprites/road1.png'
import playerRifle from '../sprites/playerRifle0.png'
import playerShotgun from '../sprites/playerShotgun0.png'
import {Enemy, turret, muzzleFlash, bullet} from '../entities.js'
import global from '../globals.js'

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
global.scene.add(planeMesh)


const Game = () =>{
    const interval = 1/60 //fps
    let delta = 0
    let clock = new THREE.Clock()
    let buyTurret = false //If any turret is currently selected from shop
    let turretSelection = playerRifle //Current turret selection

    
    const gridSize = 20, tileSize = 0.5, tileOffset = 0.25 //Tilemap dimensions  
    const mapOffset = 15 //Moved my map to the right so i can deal with only positive numbers for positioning
    //Grid representation of map, used to build tilemap
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
    let helperGrid = new THREE.GridHelper(10, gridSize,"red", "red");//helpergrid just for development purposes
    helperGrid.position.set(19.75, 0.01, 19.75)
    global.scene.add(helperGrid)
    camera.position.set(19.75, 7, 19.75)
    camera.lookAt(new THREE.Vector3(19.75, 0, 19.75))
    
    //const controls = new OrbitControls( camera, renderer.domElement );
    

    const tileGeo = new THREE.PlaneGeometry(tileSize, tileSize) //tilemap tile geometry
    const grass1Mat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(grass1) })
    const road1Mat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(road1) })
    
    
    /*
    const newTile = new THREE.Mesh(
        tileGeo,
        tileMat
    )
    newTile.rotateX(-Math.PI/2)
    newTile.position.set(15, 0, 15)
    global.scene.add(newTile)*/

    function createMap(){//Creating tilemap
        for(let i = 0; i < gridSize; i++){
            for(let j = 0; j < gridSize; j++){
                if(mapGrid[i][j] == 0){
                    const newTile = new THREE.Mesh(
                        tileGeo,
                        grass1Mat
                    )
                    newTile.rotateX(-Math.PI/2)
                    newTile.position.set((j*0.5)+mapOffset, 0, (i*0.5)+mapOffset)
                    global.scene.add(newTile)
                }
                else if(mapGrid[i][j] == 1){
                    const newTile = new THREE.Mesh(
                        tileGeo,
                        road1Mat
                    )
                    newTile.rotateX(-Math.PI/2)
                    newTile.position.set((j*0.5)+mapOffset, 0, (i*0.5)+mapOffset)
                    global.scene.add(newTile)
                }
            }
        }
    }
    //sprite for grid placement
    const buyMap = new THREE.TextureLoader().load( playerRifle );
    const buyMaterial = new THREE.SpriteMaterial( { map: buyMap } );
    const buySprite = new THREE.Sprite( buyMaterial ); 
    buySprite.position.set(0, 0.01, 0)
    buySprite.scale.set(0.7, 0.7, 0.7)
    global.scene.add( buySprite );

    const raycaster = new THREE.Raycaster();
    let pointer = new THREE.Vector2()//Mouse pointer vector
    window.addEventListener( 'mousemove', onPointerMove );
    function onPointerMove( event ) {//Used for placing new turrets
        if(buyTurret){
            pointer.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1
            pointer.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1
            // Perform raycast
            raycaster.setFromCamera( pointer, camera );

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
    
    window.addEventListener( 'click', onPointerClick );
    function onPointerClick(event){
        pointer.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1
        pointer.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1
        // Perform raycast
        raycaster.setFromCamera( pointer, camera );
        const intersectGrid = raycaster.intersectObject( planeMesh );
        if(buyTurret && intersectGrid.length > 0 && turretSelection == playerRifle){ //Place new rifle turret
            global.turretList.push(new turret("rifle", buySprite.position.x, buySprite.position.z))
        }
        else if(buyTurret && intersectGrid.length > 0 && turretSelection == playerShotgun){
            global.turretList.push(new turret("shotgun", buySprite.position.x, buySprite.position.z))
        }
        const intersectsRifle = raycaster.intersectObject( rifleSprite );
        if ( intersectsRifle.length > 0 ) { //If clicked on buy rifle turret sprite
            buyTurret = true
            turretSelection = playerRifle
            buySprite.material = rifleMaterial
        }
        const intersectsShotgun = raycaster.intersectObject( shotgunSprite );
        if ( intersectsShotgun.length > 0 ) { //If clicked on buy rifle turret sprite
            buyTurret = true
            turretSelection = playerShotgun
            buySprite.material = shotgunMaterial
        }

    }
    //UI sprites for purchase
    const map = new THREE.TextureLoader().load( playerRifle );
    const rifleMaterial = new THREE.SpriteMaterial( { map: map } );
    const rifleSprite = new THREE.Sprite( rifleMaterial );
    rifleSprite.position.set(27, 0.01, 16)
    global.scene.add( rifleSprite );

    const map2 = new THREE.TextureLoader().load( playerShotgun );
    const shotgunMaterial = new THREE.SpriteMaterial( { map: map2 } );
    const shotgunSprite = new THREE.Sprite( shotgunMaterial );
    shotgunSprite.position.set(27, 0.01, 20)
    global.scene.add( shotgunSprite );


    document.addEventListener("keydown", keyclick);
    function keyclick(e){
        let keyCode = e.which
        if(keyCode == 32){ //SPACE button, For development purposes, spawn basic enemy
            let newEnemy = new Enemy(1, 15, 19)
            global.enemyList.push(newEnemy)
        }
        else if(keyCode == 27){ //ESC button, cancel turret selection
            buyTurret = false
            buySprite.position.set(0, 0.01, 0)
        }
    }

    function checkCollision(sprite1, sprite2){
        //Check if sprites collide...just going to check using distance instead of raycasting for now
        if((Math.abs(sprite1.position.x-sprite2.position.x)+Math.abs(sprite1.position.z-sprite2.position.z)) <= 0.5){
            return true
        }
        return false
    }

    function animate(){
        delta += clock.getDelta()
        if(delta > interval){//limit fps
            let updatedEnemyList = []
            for(let enemy of global.enemyList){ //Loop through enemy list and do animations/actions
                if(!enemy.animate()){ //animate returns true if removed from global.scene
                    updatedEnemyList.push(enemy)
                }
            }
            global.enemyList = updatedEnemyList //Update list to not include enemies removed from global.scene(made it to end of map/killed by turret)
            for(let turret of global.turretList){ //Loop through turret list and do animations/actions
                turret.animate()
            }
            let updatedBulletList = []
            for(let bullet of global.bulletList){ //Loop through bullet list and do animations/actions
                if(!bullet.animate()){ //animate returns true if removed from global.scene
                    updatedBulletList.push(bullet)
                }
            }
            global.bulletList = updatedBulletList
            let updatedBulletList2 = []
            for(let bullet of global.bulletList){ //Check for bullet collisions with enemies
                let bulletAlive = true
                for(let j = 0; j < global.enemyList.length; j++){
                    if(checkCollision(bullet.sprite, global.enemyList[j].sprite)){//If there was a collision between current bullet and enemy
                        if(global.enemyList[j].takeDamage(bullet.damage)){//returns true if dead
                            global.enemyList.splice(j, 1)
                            j--;
                        }
                        if(bullet.hit()){//return true if bullet out of piercing
                            bulletAlive = false
                        }
                        break
                    }
                }
                if(bulletAlive){
                    updatedBulletList2.push(bullet)
                }
            }
            global.bulletList = updatedBulletList2
            for(let extra of global.extras){ //extra animations ex(muzzleflash)
                extra.animate()
            }
            renderer.render( global.scene, camera );
        }
        
        requestAnimationFrame( animate );
    }
    useEffect(()=>{
        animate()
        createMap()
    },[])
    
}

export default Game;