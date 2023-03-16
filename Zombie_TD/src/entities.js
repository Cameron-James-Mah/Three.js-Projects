import * as THREE from 'three';
import playerRifle from './sprites/playerRifle0.png'
import playerShotgun from './sprites/playerShotgun0.png'
import skeletonSheet from './sprites/skeleton_spritesheet.png'
import bulletSheet from './sprites/bulletSheet.png'
import muzzleFlashSheet from './sprites/muzzleFlashesSheet.png'
import global from './globals.js'
import { Vector3 } from 'three';
let v1 = new THREE.Vector2();
let v2 = new THREE.Vector3();
export class Enemy{
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
        global.scene.add(this.sprite)
    }
    getPosition(){
        return this.sprite.position;
    }
    animate(){ //Movement
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
                global.scene.remove(this.sprite)
                return true
            }
        
        return false
    }
    takeDamage(damage){
        this.health -= damage
        if(this.health <= 0){
            global.scene.remove(this.sprite)
            return true
        }
        return false
    }
}
export class turret{
    fireRate;
    damage;
    map;
    material;
    sprite;
    range;
    fireDelay = 10;
    fireTime = 10;
    piercing;
    type;
    shotgunSpray = 0.5
    constructor(type, x, z){
        if(type == "rifle"){ //Rifle type turret
            this.type = type
            this.piercing = 1
            this.range = 4
            this.fireRate = 0.4
            this.damage = 1
            this.fireDelay = 60
            this.map = new THREE.TextureLoader().load( playerRifle );
            this.material = new THREE.SpriteMaterial( { map: this.map } );
            this.sprite = new THREE.Sprite( this.material );
            this.sprite.position.set(x, 0.01, z)
            this.sprite.scale.set(0.7, 0.7, 0.7)
            global.scene.add(this.sprite)
        }
        else if(type == 'shotgun'){
            this.type = type
            this.piercing = 1
            this.range = 3.5
            this.fireRate = 0.25
            this.damage = 1
            this.fireDelay = 60
            this.map = new THREE.TextureLoader().load( playerShotgun );
            this.material = new THREE.SpriteMaterial( { map: this.map } );
            this.sprite = new THREE.Sprite( this.material );
            this.sprite.position.set(x, 0.01, z)
            this.sprite.scale.set(0.7, 0.7, 0.7)
            global.scene.add(this.sprite)
        }   
    }
    animate(){ 
        for(let i = global.enemyList.length-1; i >= 0; i--){ //Iterate through enemy list, shoot at the first enemy found in range
            if((Math.abs(this.sprite.position.x-global.enemyList[i].sprite.position.x)+Math.abs(this.sprite.position.z-global.enemyList[i].sprite.position.z)) <= this.range){ //If enemy is in range
                v1 = new THREE.Vector2(this.sprite.position.z, this.sprite.position.x)
                v2 = new THREE.Vector2(global.enemyList[i].sprite.position.z, global.enemyList[i].sprite.position.x)
                v1.sub(v2)
                this.sprite.material.rotation = v1.angle()+Math.PI/2
                this.fireTime++
                if(this.fireTime >= this.fireDelay){
                    let norm = new THREE.Vector3()
                    norm.copy(global.enemyList[i].sprite.position)
                    norm.sub(this.sprite.position)
                    if(this.type == "rifle"){ //single shot, extra piercing
                        global.bulletList.push(new bullet(this.type, this.damage, this.sprite.position.x, this.sprite.position.z, v1.angle(), norm, this.piercing))
                    }
                    else if(this.type == "shotgun"){//3 shot, no extra piercing
                        global.bulletList.push(new bullet(this.type, this.damage, this.sprite.position.x, this.sprite.position.z, v1.angle(), norm, this.piercing))
                        let temp = new Vector3(this.shotgunSpray, 0.01, this.shotgunSpray)
                        let norm2 = new THREE.Vector3()
                        norm2.copy(global.enemyList[i].sprite.position)
                        norm2.add(temp)
                        norm2.sub(this.sprite.position)
                        v1 = new THREE.Vector2(this.sprite.position.z, this.sprite.position.x)
                        v2 = new THREE.Vector2(global.enemyList[i].sprite.position.z+this.shotgunSpray, global.enemyList[i].sprite.position.x+this.shotgunSpray)
                        v1.sub(v2)
                        global.bulletList.push(new bullet(this.type, this.damage, this.sprite.position.x, this.sprite.position.z, v1.angle(), norm2, this.piercing))
                        let norm3 = new THREE.Vector3()
                        norm3.copy(global.enemyList[i].sprite.position)
                        norm3.sub(temp)
                        norm3.sub(this.sprite.position)
                        v1 = new THREE.Vector2(this.sprite.position.z, this.sprite.position.x)
                        v2 = new THREE.Vector2(global.enemyList[i].sprite.position.z-this.shotgunSpray, global.enemyList[i].sprite.position.x-this.shotgunSpray)
                        v1.sub(v2)
                        global.bulletList.push(new bullet(this.type, this.damage, this.sprite.position.x, this.sprite.position.z, v1.angle(), norm3, this.piercing))
                    }
                    this.fireTime = 0
                    global.extras.push(new muzzleFlash(this.type, this.sprite.position.x, this.sprite.position.z, v1.angle(), norm))
                }
                break
            }
        }
        
        
    }
}
export class bullet{
    type;
    damage;
    map;
    material;
    sprite;
    loader;
    speed = 0.1; //Speed of bullet
    norm; //normalized vector to give bullet direction
    piercing; //How many enemies it can pierce 
    constructor(type, damage, x, z, angle, norm, piercing){//angle = rotation of turret shot from, norm is the normalized vector from turret to enemy
        this.type = type
        this.damage = damage
        this.loader = new THREE.TextureLoader()
        this.piercing = piercing
        this.norm = norm
        if(this.type == "rifle"){ //If bullet shot from rifle turret
            this.map = this.loader.load( bulletSheet );
            this.map.repeat.set(1, 1/2)
            this.material = new THREE.SpriteMaterial( { map: this.map } );
            this.sprite = new THREE.Sprite( this.material );
        }
        else if(this.type == "shotgun"){ //If bullet shot from shotgun turret
            this.map = this.loader.load( bulletSheet );
            this.map.repeat.set(1, 1/2) 
            this.material = new THREE.SpriteMaterial( { map: this.map } );
            this.sprite = new THREE.Sprite( this.material );
        }
        this.sprite.position.set(x, 0.05, z)
        this.sprite.material.rotation = angle
        this.sprite.translateOnAxis(norm, 0.1)
        this.sprite.scale.set(0.3, 0.3, 0.3)
        global.scene.add(this.sprite)
    }
    animate(){
        if(this.sprite.position.x < 15 || this.sprite.position.x > 24.5 || this.sprite.position.z < 15 || this.sprite.position.z > 24.5){
            global.scene.remove(this.sprite)
            return true
        }
        this.sprite.translateOnAxis(this.norm, this.speed)
        return false
        
    }
    hit(){ //Bullet collided with enemy, see if piercing leftover
        this.piercing--
        if(this.piercing <= 0){
            global.scene.remove(this.sprite)
            return true
        }
    }
}
export class muzzleFlash{
    tilesHoriz = 4
    tilesVert = 6
    xTile = 1;
    yTile;
    loader;
    map;
    material;
    sprite;
    constructor(type, x, z, angle, norm){
        this.loader = new THREE.TextureLoader()
        if(type == "rifle"){//If muzzle flash from rifle shot
            this.yTile = 1
            this.map = this.loader.load( muzzleFlashSheet );
            this.map.repeat.set(1/this.tilesHoriz, 1/this.tilesVert)
            this.material = new THREE.SpriteMaterial( { map: this.map } );
            this.sprite = new THREE.Sprite( this.material );
            this.norm = norm
        }
        else if(type == "shotgun"){//If muzzle flash from shotgun shot
            this.yTile = 1
            this.map = this.loader.load( muzzleFlashSheet );
            this.map.repeat.set(1/this.tilesHoriz, 1/this.tilesVert)
            this.material = new THREE.SpriteMaterial( { map: this.map } );
            this.sprite = new THREE.Sprite( this.material );
            this.norm = norm
        }
        this.sprite.position.set(x, 0.05, z)
        this.sprite.material.rotation = angle-(Math.PI/2)
        this.sprite.translateOnAxis(norm, 0.15)
        this.sprite.scale.set(0.4, 0.4, 0.4)
        global.scene.add(this.sprite)
        
    }
    animate(){
        if(this.xTile >= this.tilesHoriz){
            global.scene.remove(this.sprite)
        }
        this.offsetX = (this.xTile%this.tilesHoriz)/this.yTile/this.tilesHoriz
        this.map.offset.x = this.offsetX
        this.xTile++
        
    }

}