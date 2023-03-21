import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { useEffect } from 'react';
import * as THREE from 'three';
import grass1 from '../sprites/grass1.png'
import road1 from '../sprites/road1.png'
import playerRifle from '../sprites/playerRifle0.png'
import playerShotgun from '../sprites/playerShotgun0.png'
import playerHandgun from '../sprites/playerHandgun0.png'
import goldCoin from '../sprites/goldCoin.png'
import heart from '../sprites/heart.png'
import upgrade from '../sprites/upgrade.png'

import {Enemy, turret, muzzleFlash, bullet} from '../entities.js'
import global from '../globals.js'
import "./Game.css";

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//const controls = new OrbitControls( camera, renderer.domElement );

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
    //fps
    const interval = 1/60 
    let delta = 0 
    let clock = new THREE.Clock()

    let buyTurret = false //If any turret is currently selected from shop
    let turretSelection = playerRifle //Current turret selection
    let selectedTurret; //Current selected turret object
    let buySpriteRange = 4 //Range of current selected buyTurret, radius of selected shop turret
    let gold = 15
    let health = 20 

    //Selected turret info
    let damageInfo = 0
    let rangeInfo = 0
    let fireRateInfo = 0

    //Turret costs
    const shotgunCost = 20
    const handgunCost = 5
    const rifleCost = 15

    //Round info
    let currentRound = 0 
    let roundInProgress = false

    let roundSpawns = [
        [{type: "skeleton", delay: 100}, {type: "skeleton", delay: 100}, {type: "skeleton", delay: 110}, {type: "skeleton", delay: 110}, {type: "skeleton", delay: 110}],

        [{type: "skeleton", delay: 60}, {type: "skeleton", delay: 60}, {type: "skeleton", delay: 60}, {type: "skeleton", delay: 60}, {type: "skeleton", delay: 60}],

        [{type: "skeleton", delay: 60}, {type: "skeleton", delay: 30}, {type: "skeleton", delay: 60}, {type: "skeleton", delay: 30}, {type: "skeleton", delay: 30}, {type: "skeleton", delay: 60}, {type: "skeleton", delay: 30}, {type: "skeleton", delay: 60}, {type: "skeleton", delay: 30}, {type: "skeleton", delay: 60}],

        [{type: "skeleton", delay: 30}, {type: "zombie", delay: 60}, {type: "skeleton", delay: 30}, {type: "skeleton", delay: 60}, {type: "skeleton", delay: 60}, {type: "zombie", delay: 60}, {type: "zombie", delay: 30}, {type: "skeleton", delay: 30}, {type: "zombie", delay: 30}, {type: "skeleton", delay: 60},{type: "skeleton", delay: 30}, {type: "skeleton", delay: 30}, {type: "zombie", delay: 30}, {type: "skeleton", delay: 60}, {type: "zombie", delay: 60}], 

        [{type: "skeleton", delay: 30}, {type: "zombie", delay: 30}, {type: "skeleton", delay: 30}, {type: "skeleton", delay: 50}, {type: "skeleton", delay: 30}, {type: "zombie", delay: 60}, {type: "zombie", delay: 40}, {type: "skeleton", delay: 30}, {type: "zombie", delay: 30}, {type: "skeleton", delay: 40},{type: "skeleton", delay: 30}, {type: "skeleton", delay: 30}, {type: "zombie", delay: 30}, {type: "skeleton", delay: 60}, {type: "zombie", delay: 60}], 

        [{type: "skeleton", delay: 20}, {type: "zombie", delay: 20}, {type: "skeleton", delay: 30}, {type: "zombie", delay: 40}, {type: "skeleton", delay: 30}, {type: "zombie", delay: 50}, {type: "zombie", delay: 40}, {type: "skeleton", delay: 30}, {type: "zombie", delay: 30}, {type: "zombie", delay: 40},{type: "skeleton", delay: 30}, {type: "skeleton", delay: 30}, {type: "zombie", delay: 30}, {type: "skeleton", delay: 20}, {type: "zombie", delay: 40}, {type: "skeleton", delay: 40}, {type: "skeleton", delay: 30}, {type: "skeleton", delay: 10}, {type: "zombie", delay: 30}, {type: "zombie", delay: 60}], 

        [{type: "skeleton", delay: 10}, {type: "zombie", delay: 10}, {type: "skeleton", delay: 20}, {type: "zombie", delay: 30}, {type: "skeleton", delay: 30}, {type: "zombie", delay: 50}, {type: "zombie", delay: 30}, {type: "skeleton", delay: 30}, {type: "zombie", delay: 30}, {type: "zombie", delay: 40},{type: "zombie", delay: 30}, {type: "skeleton", delay: 30}, {type: "zombie", delay: 20}, {type: "skeleton", delay: 20}, {type: "zombie", delay: 40}, {type: "skeleton", delay: 40}, {type: "zombie", delay: 20}, {type: "skeleton", delay: 10}, {type: "zombie", delay: 30}, {type: "zombie", delay: 60}], 

    ]
    
    let currentSpawn = [] //Current round spawns
    let spawnIndex = 0 //Current enemy spawn of current round
    let remainingEnemies = 0 //Remaining enemies in round, helps to figure out when round is over

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
    
    /*
    let helperGrid = new THREE.GridHelper(10, gridSize,"red", "red");//helpergrid just for development purposes
    helperGrid.position.set(19.75, 0.01, 19.75)
    global.scene.add(helperGrid)*/
    camera.position.set(23, 7, 19.75)
    camera.lookAt(new THREE.Vector3(23, 0, 19.75))

    const tileGeo = new THREE.PlaneGeometry(tileSize, tileSize) //tilemap tile geometry
    const grass1Mat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(grass1) })
    const road1Mat = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(road1) })

    function createMap(){//Creating tilemap
        for(let i = 0; i < gridSize; i++){
            for(let j = 0; j < gridSize; j++){
                if(mapGrid[i][j] == 0){ //grass
                    const newTile = new THREE.Mesh(
                        tileGeo,
                        grass1Mat
                    )
                    newTile.rotateX(-Math.PI/2)
                    newTile.position.set((j*0.5)+mapOffset, 0, (i*0.5)+mapOffset)
                    global.scene.add(newTile)
                }
                else if(mapGrid[i][j] == 1){ //road
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
                rangeIndicator.position.x = buySprite.position.x
                rangeIndicator.position.z = buySprite.position.z
            }

        }
        

    }
    
    window.addEventListener( 'click', onPointerClick );
    function onPointerClick(event){
        pointer.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1
        pointer.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1
        // Perform raycast
        raycaster.setFromCamera( pointer, camera );
        const intersectsRifle = raycaster.intersectObject( selectionMeshRifle );
        const intersectsShotgun = raycaster.intersectObject( selectionMeshShotgun );
        const intersectsHandgun = raycaster.intersectObject( selectionMeshHandgun );
        const intersectGrid = raycaster.intersectObject( planeMesh );
        const intersectUpgrade1 = raycaster.intersectObject( upgradeSprite1 );
        const intersectUpgrade2 = raycaster.intersectObject( upgradeSprite2 );
        const intersectUpgrade3 = raycaster.intersectObject( upgradeSprite3 );
        const intersectStart = raycaster.intersectObject( startMesh );

        //Clear top UI
        hideInfoUI()
        /*
        upgradeSprite1.visible = false
        upgradeSprite2.visible = false
        upgradeSprite3.visible = false*/
        

        if(buyTurret && intersectGrid.length > 0 && turretSelection == playerRifle && tileAvailable() && gold >= rifleCost){ //Place new rifle turret
            global.turretList.push(new turret("rifle", buySprite.position.x, buySprite.position.z))
            gold -= rifleCost
            currentGoldText.textContent = `Gold: ${gold}`
            clearSelection()
        }
        else if(buyTurret && intersectGrid.length > 0 && turretSelection == playerShotgun && tileAvailable() && gold >= shotgunCost){//Place new shotgun turret
            global.turretList.push(new turret("shotgun", buySprite.position.x, buySprite.position.z))
            gold -= shotgunCost
            currentGoldText.textContent = `Gold: ${gold}`
            clearSelection()
        } 
        else if(buyTurret && intersectGrid.length > 0 && turretSelection == playerHandgun && tileAvailable() && gold >= handgunCost){//Place new handgun turret
            global.turretList.push(new turret("handgun", buySprite.position.x, buySprite.position.z))
            gold -= handgunCost
            currentGoldText.textContent = `Gold: ${gold}`
            clearSelection()
        }
        else if( intersectsRifle.length > 0 && gold >= rifleCost) { //If clicked on buy rifle turret sprite
            buyTurret = true
            turretSelection = playerRifle
            buySprite.material = rifleMaterial
            buySpriteRange = 3.5 //Change this later to be actual turret range
            rangeIndicator.geometry.dispose()
            rangeIndicator.geometry = new THREE.CircleGeometry(buySpriteRange , 32 );
            rangeIndicator.material.needsUpdate = true
        }
        else if( intersectsShotgun.length > 0 && gold >= shotgunCost) { //If clicked on buy shotgun turret sprite
            buyTurret = true
            turretSelection = playerShotgun 
            buySprite.material = shotgunMaterial
            buySpriteRange = 3 //Change this later to be actual turret range
            rangeIndicator.geometry.dispose()
            rangeIndicator.geometry = new THREE.CircleGeometry(buySpriteRange , 32 );
            rangeIndicator.material.needsUpdate = true
        }
        else if( intersectsHandgun.length > 0 && gold >= handgunCost) { //If clicked on buy handgun turret sprite
            buyTurret = true
            turretSelection = playerHandgun
            buySprite.material = handgunMaterial
            buySpriteRange = 2.5 //Change this later to be actual turret range
            rangeIndicator.geometry.dispose()
            rangeIndicator.geometry = new THREE.CircleGeometry(buySpriteRange , 32 );
            rangeIndicator.material.needsUpdate = true
        }
        //turret upgrades
        else if(intersectUpgrade1.length > 0 && gold >= 10){
            selectedTurret.upgradeDamage()
            gold -= 10
            showInfoUI()
        }
        else if(intersectUpgrade2.length > 0 && gold >= 10){
            selectedTurret.upgradeRange()
            gold -= 10
            showInfoUI()
        }
        else if(intersectUpgrade3.length > 0 && gold >= 10){
            selectedTurret.upgradeFireRate()
            gold -= 10
            showInfoUI()
        }
        else if(intersectStart.length > 0){ //Clicked start round
            if(!roundInProgress){ 
                roundInProgress = true
                currentSpawn = roundSpawns[currentRound]
                remainingEnemies = currentSpawn.length
                startMesh.visible = false
                startText.textContent = ""
                //
            }
        }
        else{ //Check if clicked on turret
            for(let turret of global.turretList){ //Hide all turret ranges
                turret.hideRange()
            }
            for(let turret of global.turretList){ //Show turret range for selected turret
                const intersectsTurret = raycaster.intersectObject( turret.sprite );
                if ( intersectsTurret.length > 0 ) { 
                    turret.showRange()
                    if(turret.type == 'rifle'){
                        currentInfoSprite.material = rifleMaterial
                    }
                    else if(turret.type == 'shotgun'){
                        currentInfoSprite.material = shotgunMaterial
                    }
                    else if(turret.tpye == 'handgun'){
                        currentInfoSprite.material = handgunMaterial
                    }
                    turretInfo.textContent = `Damage: ${turret.damage}\n\nRange: ${turret.range}\n\nFire Rate: ${turret.fireRate}`
                    selectedTurret = turret
                    showInfoUI()
                }
            }
            
        }
        

    }

    document.addEventListener("keydown", keyclick);
    function keyclick(e){
        let keyCode = e.which
        /*
        if(keyCode == 32){ //SPACE button, For development purposes, spawn basic enemy
            let newEnemy = new Enemy("zombie",1, 15, 19)
            global.enemyList.push(newEnemy)
        }*/
        if(keyCode == 27){ //ESC button, cancel turret selection
            clearSelection()
        }
    }

    //Info UI for selected turret
    function hideInfoUI(){
        infoMesh.visible = false
        currentInfoSprite.visible = false
        turretInfoObj.visible = false
        upgradeGoldSprite1.visible = false
        upgradeGoldSprite2.visible = false
        upgradeGoldSprite3.visible = false
        upgradeObj1.visible = false
        upgradeObj2.visible = false
        upgradeObj3.visible = false
        //Remove from scene so cant be clicked on
        global.scene.remove(upgradeSprite1)
        global.scene.remove(upgradeSprite2)
        global.scene.remove(upgradeSprite3)
    }
    //Info UI for selected turret
    function showInfoUI(){
        currentGoldText.textContent = `Gold: ${gold}`
        turretInfo.textContent = `Damage: ${selectedTurret.damage}\n\nRange: ${selectedTurret.range}\n\nFire Rate: ${selectedTurret.fireRate}`
        infoMesh.visible = true
        currentInfoSprite.visible = true
        turretInfoObj.visible = true
        upgradeGoldSprite1.visible = true
        upgradeGoldSprite2.visible = true
        upgradeGoldSprite3.visible = true
        upgradeObj1.visible = true
        upgradeObj2.visible = true
        upgradeObj3.visible = true
        
        global.scene.add(upgradeSprite1)
        global.scene.add(upgradeSprite2)
        global.scene.add(upgradeSprite3)
    }

    function clearSelection(){
        buyTurret = false
        buySprite.position.set(0, 0.01, 0)
        rangeIndicator.position.x = buySprite.position.x
        rangeIndicator.position.z = buySprite.position.z
    }

    //UI sprites for purchase
    const map = new THREE.TextureLoader().load( playerRifle );
    const rifleMaterial = new THREE.SpriteMaterial( { map: map } );
    const rifleSprite = new THREE.Sprite( rifleMaterial );
    rifleSprite.position.set(28.8, 0.04, 21)
    global.scene.add( rifleSprite );

    const map2 = new THREE.TextureLoader().load( playerShotgun );
    const shotgunMaterial = new THREE.SpriteMaterial( { map: map2 } );
    const shotgunSprite = new THREE.Sprite( shotgunMaterial );
    shotgunSprite.position.set(25.6, 0.04, 21)
    global.scene.add( shotgunSprite );

    const map3 = new THREE.TextureLoader().load( playerHandgun );
    const handgunMaterial = new THREE.SpriteMaterial( { map: map3 } );
    const handgunSprite = new THREE.Sprite( handgunMaterial );
    handgunSprite.position.set(25.6, 0.04, 23.5)
    global.scene.add( handgunSprite );

    const UIMesh0 = new THREE.Mesh(
        new THREE.PlaneGeometry(6.5, 4.5),
        new THREE.MeshBasicMaterial({
            color: "grey",
            side: THREE.DoubleSide,
        })
    )
    UIMesh0.rotateX(-Math.PI/2)
    UIMesh0.position.set(28.2, 0.0, 17)
    global.scene.add(UIMesh0)

    //UI selection buttons
    const UIMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(6.5, 5),
        new THREE.MeshBasicMaterial({
            color: "grey",
            side: THREE.DoubleSide,
        })
    )
    UIMesh.rotateX(-Math.PI/2)
    UIMesh.position.set(28.2, 0.0, 22.25)
    global.scene.add(UIMesh)

    const selectionMeshShotgun = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 2.3),
        new THREE.MeshBasicMaterial({
            color: "LightBlue",
            side: THREE.DoubleSide,
        })
    )
    selectionMeshShotgun.rotateX(-Math.PI/2)
    selectionMeshShotgun.position.set(26.6, 0.01, 21)
    global.scene.add(selectionMeshShotgun )

    const selectionMeshHandgun = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 2.3),
        new THREE.MeshBasicMaterial({
            color: "LightBlue",
            side: THREE.DoubleSide,
        })
    )
    selectionMeshHandgun.rotateX(-Math.PI/2)
    selectionMeshHandgun.position.set(26.6, 0.01, 23.5)
    global.scene.add(selectionMeshHandgun)

    const selectionMeshRifle = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 2.3),
        new THREE.MeshBasicMaterial({
            color: "LightBlue",
            side: THREE.DoubleSide,
        })
    )
    selectionMeshRifle.rotateX(-Math.PI/2)
    selectionMeshRifle.position.set(29.8, 0.01, 21)
    global.scene.add(selectionMeshRifle )

    //sprite for grid placement
    const buyMap = new THREE.TextureLoader().load( playerRifle );
    const buyMaterial = new THREE.SpriteMaterial( { map: buyMap } );
    const buySprite = new THREE.Sprite( buyMaterial ); 
    buySprite.position.set(0, 0.01, 0)
    buySprite.scale.set(0.7, 0.7, 0.7)
    global.scene.add( buySprite );
    //Range indicator for sprite
    const rangeGeometry = new THREE.CircleGeometry(buySpriteRange , 32 );
    const rangeMaterial = new THREE.MeshBasicMaterial( { color: "white" } );
    let rangeIndicator = new THREE.Mesh( rangeGeometry, rangeMaterial );
    rangeIndicator.position.set(0, 0.02, 0)
    rangeIndicator.material.transparent = true
    rangeIndicator.rotateX(-Math.PI/2)
    rangeIndicator.material.opacity = 0.4
    global.scene.add(rangeIndicator)
    
    const container = document.getElementById("container");
    var labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = "absolute";
    labelRenderer.domElement.style.top = "0px";
    document.body.appendChild(labelRenderer.domElement);

    //Gold sprite
    const goldMap = new THREE.TextureLoader().load( goldCoin );
    const goldMaterial = new THREE.SpriteMaterial( { map: goldMap } );
    

    //Shop ui text
    //Shotgun
    let atr1 = document.createElement("div");
    atr1.className = 'selectionAttributes'
    atr1.textContent = "Damage: 1\n"
    atr1.textContent += "Range: 3\n"
    atr1.textContent += "Fire rate: 0.20"
    let attributeObj1 = new CSS2DObject(atr1);
    attributeObj1.position.set(27, 0.01, 21)
    global.scene.add(attributeObj1)

    let title1 = document.createElement("div");
    title1.className = 'selectionTitle'
    title1.textContent = "Shotgun Turret"
    let titleObj1 = new CSS2DObject(title1);
    titleObj1.position.set(26.5, 0.01, 20.1)
    global.scene.add(titleObj1)

    let desc1 = document.createElement("div");
    desc1.className = 'selectionDescription'
    desc1.textContent = "Shoots slower then a rifle turret, \nbut shoots many pellets per shot."
    let adescriptionObj1 = new CSS2DObject(desc1);
    adescriptionObj1.position.set(26.6, 0.01, 21.8)
    global.scene.add(adescriptionObj1)

    let gold1 = document.createElement("div");
    gold1.className = 'turretCost'
    gold1.textContent = `${shotgunCost}`
    let goldObj1 = new CSS2DObject(gold1);
    goldObj1.position.set(25.5, 0.01, 20.1)
    global.scene.add(goldObj1)

    const goldSprite1 = new THREE.Sprite( goldMaterial );
    goldSprite1.position.set(25.3, 0.02, 20.1)
    goldSprite1.scale.set(0.3, 0.3, 0.3)
    global.scene.add( goldSprite1 );

    //Handgun
    let atr2 = document.createElement("div");
    atr2.className = 'selectionAttributes'
    atr2.textContent = "Damage: 1\n"
    atr2.textContent += "Range: 2.5\n"
    atr2.textContent += "Fire rate: 0.25"
    let attributeObj2 = new CSS2DObject(atr2);
    attributeObj2.position.set(27, 0.01, 23.5)
    global.scene.add(attributeObj2)

    let title2 = document.createElement("div");
    title2.className = 'selectionTitle'
    title2.textContent = "Handgun Turret"
    let titleObj2 = new CSS2DObject(title2);
    titleObj2.position.set(26.5, 0.01, 22.6)
    global.scene.add(titleObj2)

    let desc2 = document.createElement("div");
    desc2.className = 'selectionDescription'
    desc2.textContent = "Basic turret, weaker then\nits rifle and shotgun counterpart."
    let adescriptionObj2 = new CSS2DObject(desc2);
    adescriptionObj2.position.set(26.6, 0.01, 24.2)
    global.scene.add(adescriptionObj2)

    let gold2 = document.createElement("div");
    gold2.className = 'turretCost'
    gold2.textContent = `${handgunCost}`
    let goldObj2 = new CSS2DObject(gold2);
    goldObj2.position.set(25.5, 0.01, 22.6)
    global.scene.add(goldObj2)

    const goldSprite2 = new THREE.Sprite( goldMaterial );
    goldSprite2.position.set(25.3, 0.02, 22.6)
    goldSprite2.scale.set(0.3, 0.3, 0.3)
    global.scene.add( goldSprite2 );
    
    
    //Rifle
    let atr3 = document.createElement("div");
    atr3.className = 'selectionAttributes'
    atr3.textContent = "Damage: 1\n"
    atr3.textContent += "Range: 3.5\n"
    atr3.textContent += "Fire rate: 0.55"
    let attributeObj3 = new CSS2DObject(atr3);
    attributeObj3.position.set(30.2, 0.01, 21)
    global.scene.add(attributeObj3)

    let title3 = document.createElement("div");
    title3.className = 'selectionTitle'
    title3.textContent = "Rifle Turret"
    let titleObj3 = new CSS2DObject(title3);
    titleObj3.position.set(29.7, 0.01, 20.1)
    global.scene.add(titleObj3)

    let desc3 = document.createElement("div");
    desc3.className = 'selectionDescription'
    desc3.textContent = "Increased fire rate and range over\n a shotgun turret but only single fire."
    let adescriptionObj3 = new CSS2DObject(desc3);
    adescriptionObj3.position.set(29.8, 0.01, 21.8)
    global.scene.add(adescriptionObj3)

    let gold3 = document.createElement("div");
    gold3.className = 'turretCost'
    gold3.textContent = `${rifleCost}`
    let goldObj3 = new CSS2DObject(gold3);
    goldObj3.position.set(28.7, 0.01, 20.1)
    global.scene.add(goldObj3)

    const goldSprite3 = new THREE.Sprite( goldMaterial );
    goldSprite3.position.set(28.5, 0.02, 20.1)
    goldSprite3.scale.set(0.3, 0.3, 0.3)
    global.scene.add( goldSprite3 );

    //Top UI
    let roundText = document.createElement("div");
    roundText.className = 'round'
    roundText.textContent = `Round ${currentRound}`
    let roundObj = new CSS2DObject(roundText);
    roundObj.position.set(28, 0.01, 15)
    global.scene.add(roundObj)

    let startText = document.createElement("div");
    startText.className = 'round'
    startText.textContent = "Start Round"
    let startObj = new CSS2DObject(startText);
    startObj.position.set(28, 0.03, 18.7)
    global.scene.add(startObj)

    const startMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.3, 0.8),
        new THREE.MeshBasicMaterial({
            color: "LimeGreen",
        })
    )
    startMesh.rotateX(-Math.PI/2)
    startMesh.position.set(28, 0.01, 18.7)
    global.scene.add(startMesh )
    

    let currentGoldText = document.createElement("div");
    currentGoldText.className = 'currentGold'
    currentGoldText.textContent = `Gold: ${gold}`
    let currentGoldObj = new CSS2DObject(currentGoldText);
    currentGoldObj.position.set(30.6, 0.01, 19)
    global.scene.add(currentGoldObj)

    const currentGoldSprite = new THREE.Sprite( goldMaterial );
    currentGoldSprite.position.set(29.8, 0.02, 19)
    currentGoldSprite.scale.set(0.5, 0.5, 0.5)
    global.scene.add( currentGoldSprite );

    let currentHealthText = document.createElement("div");
    currentHealthText.className = 'currentHealth'
    currentHealthText.textContent = `Health: ${health}`
    let currentHealthObj = new CSS2DObject(currentHealthText);
    currentHealthObj.position.set(30.6, 0.01, 15)
    global.scene.add(currentHealthObj)

    const heartMap = new THREE.TextureLoader().load( heart );
    const heartMaterial = new THREE.SpriteMaterial( { map: heartMap } );
    
    const currentHealthSprite = new THREE.Sprite( heartMaterial );
    currentHealthSprite.position.set(29.8, 0.02, 15)
    currentHealthSprite.scale.set(0.3, 0.3, 0.3)
    global.scene.add( currentHealthSprite );

    //Selected turret info
    let turretInfo = document.createElement("div");
    turretInfo.className = 'selectionTitle'
    turretInfo.textContent = `Damage: ${damageInfo}\n\nRange: ${rangeInfo}\n\nFire Rate: ${fireRateInfo}`
    let turretInfoObj = new CSS2DObject(turretInfo);
    turretInfoObj.position.set(28.5, 0.02, 17)
    global.scene.add(turretInfoObj)
    //turretInfoObj.visible = false

    const currentInfoSprite = new THREE.Sprite( rifleMaterial );
    currentInfoSprite.position.set(27, 0.02, 17)
    currentInfoSprite.scale.set(1,1,1)
    global.scene.add( currentInfoSprite );

    const infoMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(4.8, 2.3),
        new THREE.MeshBasicMaterial({
            color: "LightBlue",
        })
    )
    infoMesh.rotateX(-Math.PI/2)
    infoMesh.position.set(28, 0.01, 17)
    global.scene.add(infoMesh )

    const upgradeMap = new THREE.TextureLoader().load( upgrade );
    const upgradeMaterial = new THREE.SpriteMaterial( { map: upgradeMap } );

    //Upgrade selected turret icons
    const upgradeSprite1 = new THREE.Sprite( upgradeMaterial ); 
    upgradeSprite1.position.set(29.5, 0.02, 16.4)
    upgradeSprite1.scale.set(0.3, 0.3, 0.3)
    global.scene.add(upgradeSprite1)
    
    const upgradeSprite2 = new THREE.Sprite( upgradeMaterial ); 
    upgradeSprite2.position.set(29.5, 0.02, 17)
    upgradeSprite2.scale.set(0.3, 0.3, 0.3)
    global.scene.add(upgradeSprite2)

    const upgradeSprite3 = new THREE.Sprite( upgradeMaterial ); 
    upgradeSprite3.position.set(29.5, 0.02, 17.55)
    upgradeSprite3.scale.set(0.3, 0.3, 0.3)
    global.scene.add(upgradeSprite3)

    const upgradeGoldSprite1 = new THREE.Sprite( goldMaterial );
    upgradeGoldSprite1.position.set(29.9, 0.02, 16.4)
    upgradeGoldSprite1.scale.set(0.4, 0.4, 0.4)
    global.scene.add( upgradeGoldSprite1 );

    let goldUpgradeText1 = document.createElement("div");
    goldUpgradeText1.className = 'turretCost'
    goldUpgradeText1.textContent = `10`
    let upgradeObj1 = new CSS2DObject(goldUpgradeText1);
    upgradeObj1.position.set(30.2, 0.01, 16.4)
    global.scene.add(upgradeObj1)

    const upgradeGoldSprite2 = new THREE.Sprite( goldMaterial );
    upgradeGoldSprite2.position.set(29.9, 0.02, 17)
    upgradeGoldSprite2.scale.set(0.4, 0.4, 0.4)
    global.scene.add( upgradeGoldSprite2 );

    let goldUpgradeText2 = document.createElement("div");
    goldUpgradeText2.className = 'turretCost'
    goldUpgradeText2.textContent = `10`
    let upgradeObj2 = new CSS2DObject(goldUpgradeText2);
    upgradeObj2.position.set(30.2, 0.01, 17)
    global.scene.add(upgradeObj2)

    const upgradeGoldSprite3 = new THREE.Sprite( goldMaterial );
    upgradeGoldSprite3.position.set(29.9, 0.02, 17.55)
    upgradeGoldSprite3.scale.set(0.4, 0.4, 0.4)
    global.scene.add( upgradeGoldSprite3 );

    let goldUpgradeText3 = document.createElement("div");
    goldUpgradeText3.className = 'turretCost'
    goldUpgradeText3.textContent = `10`
    let upgradeObj3 = new CSS2DObject(goldUpgradeText3);
    upgradeObj3.position.set(30.2, 0.01, 17.55)
    global.scene.add(upgradeObj3)

    //Hide until selected
    hideInfoUI()

    function tileAvailable(){ //Returns true if tile is available for turret placement(no existing turret in tile)
        for(let turret in global.turretList){
            if(turret.position == buySprite.position){
                return false
            }
        }
        return true
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
            if(roundInProgress && spawnIndex < currentSpawn.length){ //Round in progress
                if(currentSpawn[spawnIndex].delay <= 0){
                    global.enemyList.push(new Enemy(currentSpawn[spawnIndex].type,1, 15, 19))
                    spawnIndex++
                }
                else{
                   currentSpawn[spawnIndex].delay-- 
                }
            }
            if(roundInProgress && remainingEnemies == 0 && spawnIndex == currentSpawn.length){ //Round ended
                spawnIndex = 0
                currentRound++
                roundText.textContent = `Round ${currentRound}`
                roundInProgress = false
                startMesh.visible = true
                startText.textContent = "Start Round"
            }
            let updatedEnemyList = []
            for(let enemy of global.enemyList){ //Loop through enemy list and do animations/actions
                if(!enemy.animate()){ //animate returns true if removed from global.scene
                    updatedEnemyList.push(enemy)
                }
                else{ //Enemy made it to end
                    health--
                    currentHealthText.textContent = `Health: ${health}`
                    remainingEnemies--
                    if(health <= 0){ //NO REMAINING HEALTH GAMEOVER

                    }
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
                        let res = global.enemyList[j].takeDamage(bullet.damage);
                        if(res > 0){//returns gold value if dead
                            gold += res
                            global.enemyList.splice(j, 1)
                            j--;
                            remainingEnemies--
                            currentGoldText.textContent = `Gold: ${gold}`
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
            labelRenderer.render( global.scene, camera );
        }
        
        requestAnimationFrame( animate );
    }
    useEffect(()=>{
        animate()
        createMap()
    },[])
    
}

export default Game;