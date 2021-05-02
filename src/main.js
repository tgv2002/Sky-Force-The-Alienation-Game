var scene, camera, renderer;

// Limits of screen
var LOWER_BOUND_x = -840;
var UPPER_BOUND_x = 840;
var LOWER_BOUND_y = -365;
var UPPER_BOUND_y = 410;

// Health and score for HUD
var HEALTH = 7;
var SCORE = 0;

// sound effect variables
var collected_star_sound, explosion_sound, missile_launch_sound, you_lost_sound, you_won_sound, space_bgm_sound, plane_got_hit_sound;

// Intervals for plane missiles
var previous_plane_missile_launch_time = new Date();
var minimum_time_gap_between_plane_missile_launch = 0.8

// Intervals for enemy missiles
var previous_enemy_missile_launch_time = new Date();
var minimum_time_gap_between_enemy_missile_launch = 3

// Intervals for enemy display
var previous_enemies_spawned_time = new Date();
var minimum_time_gap_between_enemies_spawning = 5

// Scene motion
var camera_speed = 0.7

// Screen
var WIDTH  = window.innerWidth;
var HEIGHT = window.innerHeight;
var SPEED = 0.01;

// Game objects
var plane = null, plane_missiles = [], enemy_missiles = [], stars = [];
var enemies = [];

// Velocities of objects
var plane_vx = 5;
var plane_vy = 5;
var enemy_vx = [];
var enemy_rotation_vx = 0.01;
var enemy_rotation_vy = 0.01;
var enemy_rotation_vz = 0.01;
var missile_vy = 6;
var missile_rotation_vy = 0.01;

// checks game status
var game_over = 0;
var player_won = 0;


function init() {
    scene = new THREE.Scene();

    initMesh();
    initCamera();
    initSoundEffects();
    initLights();
    initRenderer();

    document.body.appendChild(renderer.domElement);
}

function initCamera() {
    // camera = new THREE.PerspectiveCamera(70, WIDTH / HEIGHT, 1, 10);
    camera = new THREE.OrthographicCamera( WIDTH / - 2, WIDTH / 2, HEIGHT / 2, HEIGHT / - 2, 1, 100000);
    camera.position.set(0, 0, 500);
    camera.lookAt(scene.position);

}

function initSoundEffects() {
    // create listener and add to camera
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // add sound source for collecting star
    collected_star_sound = new THREE.Audio( listener );
    // load sound source for collecting star
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load( '../sound_effects/collected_star.mp3', function( buffer ) {
        collected_star_sound.setBuffer( buffer );
        collected_star_sound.setLoop( false );
        collected_star_sound.setVolume( 0.5 );
    });

    // add sound source for explosion
    explosion_sound = new THREE.Audio( listener );
    // load sound source for explosion
    const audioLoader1 = new THREE.AudioLoader();
    audioLoader1.load( '../sound_effects/explosion.mp3', function( buffer ) {
        explosion_sound.setBuffer( buffer );
        explosion_sound.setLoop( false );
        explosion_sound.setVolume( 0.5 );
    });

    // add sound source for missile launch
    missile_launch_sound = new THREE.Audio( listener );
    // load sound source for missile launch
    const audioLoader2 = new THREE.AudioLoader();
    audioLoader2.load( '../sound_effects/missile_launch.mp3', function( buffer ) {
        missile_launch_sound.setBuffer( buffer );
        missile_launch_sound.setLoop( false );
        missile_launch_sound.setVolume( 0.16 );
    });

    // add sound source for plane getting hit
    plane_got_hit_sound = new THREE.Audio( listener );
    // load sound source for plane getting hit
    const audioLoader3 = new THREE.AudioLoader();
    audioLoader3.load( '../sound_effects/plane_got_hit.mp3', function( buffer ) {
        plane_got_hit_sound.setBuffer( buffer );
        plane_got_hit_sound.setLoop( false );
        plane_got_hit_sound.setVolume( 0.5 );
    });

    // add sound source for space bgm
    space_bgm_sound = new THREE.Audio( listener );
    // load sound source for space bgm
    const audioLoader4 = new THREE.AudioLoader();
    audioLoader4.load( '../sound_effects/space_bgm.mp3', function( buffer ) {
        space_bgm_sound.setBuffer( buffer );
        space_bgm_sound.setLoop( true );
        space_bgm_sound.setVolume( 0.5 );
        space_bgm_sound.play();
    });

    // add sound source for losing
    you_lost_sound = new THREE.Audio( listener );
    // load sound source for losing
    const audioLoader5 = new THREE.AudioLoader();
    audioLoader5.load( '../sound_effects/you_lost.mp3', function( buffer ) {
        you_lost_sound.setBuffer( buffer );
        you_lost_sound.setLoop( false );
        you_lost_sound.setVolume( 0.5 );
    });

    // add sound source for winning
    you_won_sound = new THREE.Audio( listener );
    // load sound source for winning
    const audioLoader6 = new THREE.AudioLoader();
    audioLoader6.load( '../sound_effects/you_won.mp3', function( buffer ) {
        you_won_sound.setBuffer( buffer );
        you_won_sound.setLoop( false );
        you_won_sound.setVolume( 0.5 );
    });
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
}

function initLights() {
    var light = new THREE.AmbientLight(0xffffff);
    scene.add(light);
}

function initMesh() {

    // Initial setup
    const loader = new THREE.TextureLoader();
    loader.load('../assets/night_bg.jpg' , function(texture) {
        texture.minFilter = THREE.LinearFilter;
        scene.background = texture;  
    });

    console.log("Night bg loaded")

    var objLoader = new THREE.OBJLoader();
    var matLoader = new THREE.MTLLoader();
    matLoader.load('../assets/plane.mtl', function(materials) {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load('../assets/plane.obj', function (root) {
            plane = root;
            plane.scale.x = plane.scale.y = plane.scale.z = 0.07;
            plane.rotation.y -= Math.PI;
            plane.position.y -= 300;
            plane.rotation.x += (Math.PI/2);
            scene.add(plane);
            console.log("Plane added to scene")
        });
    });
}

// Collision detection between any 2 objects
function collision_did_occur(obj1, obj2) {

    if(!obj1 || !obj2)
        return false

    // Object 1 cuboidal edges
    let box1 = new THREE.Box3().setFromObject(obj1);

    let y11 = box1.min.y;
    let y12 = box1.max.y;

    let x11 = box1.min.x;
    let x12 = box1.max.x;

    let z11 = box1.min.z;
    let z12 = box1.max.z;


    // Object 2 cuboidal edges
    let box2 = new THREE.Box3().setFromObject(obj2);

    let y21 = box2.min.y;
    let y22 = box2.max.y;

    let x21 = box2.min.x;
    let x22 = box2.max.x;

    let z21 = box2.min.z;
    let z22 = box2.max.z;

    return (y12 >= y21 && x12 >= x21 && y11 <= y22 && x11 <= x22 && z11 <= z22 && z12 >= z21);
}

// Checks if non-plane objects have crossed the border
function crossed_borders(obj) {
    if(!obj)
        return false
    // Object cuboidal edges
    let box = new THREE.Box3().setFromObject(obj);
    let y1 = box.min.y;
    let y2 = box.max.y;
    let x1 = box.min.x;
    let x2 = box.max.x;
    return (x2 < LOWER_BOUND_x || x1 > UPPER_BOUND_x || y2 < LOWER_BOUND_y || y1 > UPPER_BOUND_y)
}

// CAMERA 
// Moves forward with plane along y

function moveSceneUp(){
    if (!plane || !camera)
        return
    camera.position.y += camera_speed;
    // camera.lookAt(scene.position);
    console.log("Plane moving up")
    plane.position.y += camera_speed;
    LOWER_BOUND_y += camera_speed;
    UPPER_BOUND_y += camera_speed;
}

// delete objects not currently visible
function discard_obsolete_objects(given_list, indices_to_delete) {
    for (let i=0;i<indices_to_delete.length;i++) {
        given_list.splice(indices_to_delete[i] - i, 1);
    }
    return given_list
}

// PLANE
// Movement with arrow keys
// Moves up with camera with same speed
// All possible collisions - enemy, enemy missiles, stars
// Score, health

// Handle arrow keys
document.addEventListener("keydown", onMovingPlane, false);
function onMovingPlane(event) {
    if(!plane)
        return   
    var keyCode = event.which;
    // console.log(keyCode)
    if (keyCode == 38) {
        // up
        plane.position.y += plane_vy;
    }
    if (keyCode == 40) {
        // down
        plane.position.y -= plane_vy;
    }
    if (keyCode == 37) {
        // left
        plane.position.x -= plane_vx;
    }
    if (keyCode == 39) {
        // right
        plane.position.x += plane_vx;
    }
    if (keyCode == 70){
        // plane fires missile
        spawn_plane_missile(plane.position.x, plane.position.y, plane.position.z)
    }

    if (plane.position.y >= UPPER_BOUND_y)
        plane.position.y = UPPER_BOUND_y
    if (plane.position.y <= LOWER_BOUND_y)
        plane.position.y = LOWER_BOUND_y
    if (plane.position.x >= UPPER_BOUND_x)
        plane.position.x = UPPER_BOUND_x
    if (plane.position.x <= LOWER_BOUND_x)
        plane.position.x = LOWER_BOUND_x
    // console.log(plane.position.x, plane.position.y)
};

function handle_plane_collisions() {
    // check if plane collided with any game object
    if(!plane)
        return
    // collision with enemies
    for(let i=0;i<enemies.length;i++) {
        if(collision_did_occur(plane, enemies[i])) {
            // update health
            if(explosion_sound.isPlaying)
                explosion_sound.stop()
            explosion_sound.play();
            HEALTH = 0;
            break;
        }
    }

    let indices_to_delete = []
    if (HEALTH != 0) {
        // collision with stars
        for(let i=0;i<stars.length;i++) {
            if(collision_did_occur(plane, stars[i])) {
                // update score, health
                if(collected_star_sound.isPlaying)
                    collected_star_sound.stop()
                collected_star_sound.play();
                SCORE += 10
                HEALTH += 3
                scene.remove(stars[i]);
                indices_to_delete.push(i);
            }
        }
        stars = discard_obsolete_objects(stars, indices_to_delete)

        // collision with enemy missiles
        indices_to_delete = []
        for(let i=0;i<enemy_missiles.length;i++) {
            if(collision_did_occur(plane, enemy_missiles[i])) {
                // update health
                if(plane_got_hit_sound.isPlaying)
                    plane_got_hit_sound.stop()
                plane_got_hit_sound.play();
                HEALTH -= 3
                scene.remove(enemy_missiles[i]);
                indices_to_delete.push(i);
            }
        }
    }

    if(HEALTH <= 0 || SCORE >= 400) {
        // check if game is over based on score and health
        game_over = 1
        player_won = (HEALTH <= 0) ? 0 : 1
        space_bgm_sound.stop()
        if (player_won == 1) {
            you_won_sound.play()
        }
        else {
           you_lost_sound.play()
        }
    }
    enemy_missiles = discard_obsolete_objects(enemy_missiles, indices_to_delete)    
}


// PLANE MISSILES
// Spawn when button clicked and possible
// Move all of them up with some vy
// Delete when out of view
// All possible collisions - enemy

function spawn_plane_missile(plane_x, plane_y, plane_z) {
    // Fire missile from plane when F is clicked
    var curr_date = new Date()
    var time_elapsed_since_last_launch = Math.abs(curr_date - previous_plane_missile_launch_time) / 1000;
    if (time_elapsed_since_last_launch < minimum_time_gap_between_plane_missile_launch) {
        return
    }
    var objLoader4 = new THREE.OBJLoader();
    var matLoader4 = new THREE.MTLLoader();
    matLoader4.load('../assets/plane_missile.mtl', function(materials) {
        materials.preload();
        objLoader4.setMaterials(materials);
        objLoader4.load('../assets/plane_missile.obj', function (root) {
            let new_plane_missile = root;
            // new_plane_missile.scale.x = new_plane_missile.scale.y = new_plane_missile.scale.z = 0.03;
            new_plane_missile.scale.x = new_plane_missile.scale.y = new_plane_missile.scale.z = 300.0;
            new_plane_missile.position.set(plane_x, plane_y, plane_z);
            new_plane_missile.rotation.z -= (Math.PI/5.5);
            new_plane_missile.rotation.y += (Math.PI/2);
            scene.add(new_plane_missile);
            if(missile_launch_sound.isPlaying)
                missile_launch_sound.stop()
            missile_launch_sound.play();
            plane_missiles.push(new_plane_missile);
            previous_plane_missile_launch_time = new Date()
        });
    });
}

function manage_plane_missiles() {
    // Move missiles and discard missiles launched by plane which are not in visible range
    if(plane_missiles.length == 0)
        return
    let indices_to_delete = []
    for (let i=0;i<plane_missiles.length;i++){
        if (crossed_borders(plane_missiles[i])) {
            scene.remove(plane_missiles[i]);
            indices_to_delete.push(i)
        }
        else {
            plane_missiles[i].position.y += missile_vy
            plane_missiles[i].rotation.y += missile_rotation_vy;
        }
    }
    plane_missiles = discard_obsolete_objects(plane_missiles, indices_to_delete)
}

function handle_plane_missile_collisions() {
    // Check if plane missiles destroyed enemies
    if (plane_missiles.length == 0)
        return

    let ind1 = [], ind2 = [];
    for(let i=0;i<plane_missiles.length;i++) {
        for(let j=0;j<enemies.length;j++) {
            if(collision_did_occur(plane_missiles[i], enemies[j])) {
                if(explosion_sound.isPlaying)
                    explosion_sound.stop()
                explosion_sound.play()
                spawn_star(enemies[j].position.x, enemies[j].position.y, enemies[j].position.z)
                scene.remove(plane_missiles[i]);
                ind1.push(i)
                scene.remove(enemies[j]);
                ind2.push(j)
                // increase score
                SCORE += 5
            }
        }
    }
    ind1 = Array.from(new Set(ind1)).sort()
    ind2 = Array.from(new Set(ind2)).sort()
    plane_missiles = discard_obsolete_objects(plane_missiles, ind1)
    enemies = discard_obsolete_objects(enemies, ind2)
    enemy_vx = discard_obsolete_objects(enemy_vx, ind2)
}

// ENEMIES
// Spawned at (need not be) random places at random yet regular intervals
// Move along x happily
// Delete when out of view

function randomIntegerNumber(p, q) { 
    p = Math.ceil(p);
    q = Math.floor(q);
    return Math.floor(Math.random() * (q - p + 1)) + p;
} 

function randomFloatNumber(p, q) {
    return Math.random() * (q - p) + p;
}

function choice_did_succeed(p) {
    let q = Math.random();
    return q < p;
}

function createEnemies() {
    // Create enemies randomly at random intervals of time, to appear on screen
    var curr_date = new Date()
    var time_elapsed_since_last_enemy_spawn = Math.abs(curr_date - previous_enemies_spawned_time) / 1000;
    if (time_elapsed_since_last_enemy_spawn < minimum_time_gap_between_enemies_spawning) {
        return
    }
    if(choice_did_succeed(0.65)) {
        let rand_x = randomIntegerNumber(0, 1)
        let v_x = 2
        if (rand_x == 0) {
            rand_x = LOWER_BOUND_x + 5
        }
        else {
            rand_x = UPPER_BOUND_x - 5
            v_x = -2
        }
        let rand_y = randomFloatNumber(UPPER_BOUND_y - 52, UPPER_BOUND_y)
        spawn_enemy(rand_x, rand_y, v_x)
    }
    if(choice_did_succeed(0.8)) {
        let rand_x = randomIntegerNumber(0, 1)
        let v_x = 2
        if (rand_x == 0) {
            rand_x = LOWER_BOUND_x + 5
        }
        else {
            rand_x = UPPER_BOUND_x - 5
            v_x = -2
        }
        let rand_y = randomFloatNumber(UPPER_BOUND_y - 177, UPPER_BOUND_y - 127)
        spawn_enemy(rand_x, rand_y, v_x)
    }
    if(choice_did_succeed(0.5)) {
        let rand_x = randomIntegerNumber(0, 1)
        let v_x = 2
        if (rand_x == 0) {
            rand_x = LOWER_BOUND_x + 5
        }
        else {
            rand_x = UPPER_BOUND_x - 5
            v_x = -2
        }
        let rand_y = randomFloatNumber(UPPER_BOUND_y - 300, UPPER_BOUND_y - 250)
        spawn_enemy(rand_x, rand_y, v_x)
    }
    if(choice_did_succeed(0.35)) {
        let rand_x = randomIntegerNumber(0, 1)
        let v_x = 2
        if (rand_x == 0) {
            rand_x = LOWER_BOUND_x + 5
        }
        else {
            rand_x = UPPER_BOUND_x - 5
            v_x = -2
        }        
        let rand_y = randomFloatNumber(UPPER_BOUND_y - 425, UPPER_BOUND_y - 375)
        spawn_enemy(rand_x, rand_y, v_x)
    }

    if(choice_did_succeed(0.15)) {
        let rand_x = randomIntegerNumber(0, 1)
        let v_x = 2
        if (rand_x == 0) {
            rand_x = LOWER_BOUND_x + 5
        }
        else {
            rand_x = UPPER_BOUND_x - 5
            v_x = -2
        }        
        let rand_y = randomFloatNumber(UPPER_BOUND_y - 552, UPPER_BOUND_y - 500)
        spawn_enemy(rand_x, rand_y, v_x)
    }
    // Update the last instant at which enemies appeared on the screen
    previous_enemies_spawned_time = new Date()
    let p = Math.random()
    if (p < 0.5)
        minimum_time_gap_between_enemies_spawning = 17
    else if(p < 0.8)
        minimum_time_gap_between_enemies_spawning = 15
    else
        minimum_time_gap_between_enemies_spawning = 20 
}

function spawn_enemy(enemy_x, enemy_y, enemy_x_speed) {
    // create individual enemy
    var objLoader3 = new THREE.OBJLoader();
    var matLoader3 = new THREE.MTLLoader();
    matLoader3.load('../assets/enemy_ufo.mtl', function(materials) {
        materials.preload();
        objLoader3.setMaterials(materials);
        objLoader3.load('../assets/enemy_ufo.obj', function (root) {
            let new_enemy = root;
            // new_enemy.scale.x = new_enemy.scale.y = new_enemy.scale.z = 0.002;
            new_enemy.scale.x = new_enemy.scale.y = new_enemy.scale.z = 0.24;
            new_enemy.position.x = enemy_x;
            new_enemy.position.y = enemy_y;
            // new_enemy.rotation.z -= (Math.PI/2);
            new_enemy.rotation.y += (Math.PI/2);
            new_enemy.rotation.x += (Math.PI/6);
            scene.add(new_enemy);
            enemies.push(new_enemy);
            enemy_vx.push(enemy_x_speed);
        });
    });
}

function handleEnemiesMotion() {
    // Move enemies randomly
    if (enemies.length == 0)
        return
    let ind1 = [];
    for(let i=0;i<enemies.length;i++) {
        if (crossed_borders(enemies[i])) {
            scene.remove(enemies[i]);
            ind1.push(i);
        }
        else {
            enemies[i].rotation.y += enemy_rotation_vy;
            enemies[i].position.x += enemy_vx[i];
        }
    }
    enemies = discard_obsolete_objects(enemies, ind1)
    enemy_vx = discard_obsolete_objects(enemy_vx, ind1)
}



// ENEMY MISSILES
// Spawn every second when enemy is in vision 
// Move down with constant vy
// Delete when out of view

function create_enemy_missiles() {
    // Launch enemy missiles from visible enemies at regular intervals
    var curr_date = new Date()
    var time_elapsed_since_last_launch = Math.abs(curr_date - previous_enemy_missile_launch_time) / 1000;
    if (time_elapsed_since_last_launch < minimum_time_gap_between_enemy_missile_launch) {
        return
    }
    for(let i=0;i<enemies.length;i++) {
        spawn_enemy_missile(enemies[i].position.x, enemies[i].position.y, enemies[i].position.z)
    }
    previous_enemy_missile_launch_time = new Date();
}

function spawn_enemy_missile(enemy_x, enemy_y, enemy_z) {
    // Create individual enemy missile
    var objLoader5 = new THREE.OBJLoader();
    var matLoader5 = new THREE.MTLLoader();
    matLoader5.load('../assets/enemy_missile.mtl', function(materials) {
        materials.preload();
        objLoader5.setMaterials(materials);
        objLoader5.load('../assets/enemy_missile.obj', function (root) {
            let new_enemy_missile = root;
            // new_enemy_missile.scale.x = new_enemy_missile.scale.y = new_enemy_missile.scale.z = 0.03*80;
            new_enemy_missile.scale.x = new_enemy_missile.scale.y = new_enemy_missile.scale.z = 3.0;
            new_enemy_missile.position.set(enemy_x, enemy_y, enemy_z);
            new_enemy_missile.rotation.z -= (Math.PI/5.5);
            new_enemy_missile.rotation.y += (Math.PI/2);
            scene.add(new_enemy_missile);
            if(missile_launch_sound.isPlaying)
                missile_launch_sound.stop()
            missile_launch_sound.play();
            enemy_missiles.push(new_enemy_missile);
        });
    });
}

function manage_enemy_missiles() {
    // Discard invisible enemy missiles and move them
    if(enemy_missiles.length == 0)
        return
    let ind1 = []
    for (let i=0;i<enemy_missiles.length;i++){
        if (crossed_borders(enemy_missiles[i])) {
            scene.remove(enemy_missiles[i]);
            ind1.push(i);
        }
        else {
            enemy_missiles[i].position.y -= missile_vy
            enemy_missiles[i].rotation.y += missile_rotation_vy;
        }
    }
    enemy_missiles = discard_obsolete_objects(enemy_missiles, ind1)
}

// STARS 
// At the instant enemy is destroyed, keep it there stationary

function spawn_star(enemy_x, enemy_y, enemy_z) {
    // Create star at the position where enemy was destroyed
    var objLoader2 = new THREE.OBJLoader();
    var matLoader2 = new THREE.MTLLoader();
    matLoader2.load('../assets/star.mtl', function(materials) {
        materials.preload();
        objLoader2.setMaterials(materials);
        objLoader2.load('../assets/star.obj', function (root) {
            let new_star = root;
            new_star.scale.x = new_star.scale.y = new_star.scale.z = 0.16;
            // new_star.rotation.z -= (Math.PI/2);
            new_star.position.set(enemy_x, enemy_y, enemy_z);
            new_star.rotation.y -= (Math.PI/2);
            scene.add(new_star);
            stars.push(new_star);
        });
    });
}

function manage_stars() {
    // Move stars with the scene
    if (stars.length == 0)
        return
    let ind1 = []
    for(let i=0;i<stars.length;i++){
        if (crossed_borders(stars[i])) {
            scene.remove(stars[i]);
            ind1.push(i)
        }        
    }
    stars = discard_obsolete_objects(stars, ind1)
}

// Display score and health
function getHUD() {
    let init_spaces = ""
    for(let i=0;i<77;i++) {
        init_spaces = init_spaces + "&nbsp;"
    }
    document.getElementById("hud").innerHTML = init_spaces + "Score: &nbsp;&nbsp;" + SCORE + init_spaces + "Health: &nbsp;&nbsp;" + HEALTH    
}

// Reset the scene
function clear_all_from_scene() {
    scene.remove(plane)
    plane = null
    for(let i=0;i<plane_missiles.length;i++)
        scene.remove(plane_missiles[i])
    for(let i=0;i<enemy_missiles.length;i++)
        scene.remove(enemy_missiles[i])
    for(let i=0;i<stars.length;i++)
        scene.remove(stars[i])
    for(let i=0;i<enemies.length;i++)
        scene.remove(enemies[i])
    plane_missiles = [];
    enemy_missiles = [];
    stars = [];
    enemies = [];
    enemy_vx = [];
}

// checks game status
function monitor_game_status() {
    if (game_over == 1) {
        clear_all_from_scene()
        if (player_won == 0) {
            const loader = new THREE.TextureLoader();
            loader.load('../assets/you_lost.jpg' , function(texture) {
                texture.minFilter = THREE.LinearFilter;
                scene.background = texture;  
            });
        }
        else {
            const loader = new THREE.TextureLoader();
            loader.load('../assets/you_win.jpg' , function(texture) {
                texture.minFilter = THREE.LinearFilter;
                scene.background = texture;  
            });            
        }
        game_over = 0;
    }
}

function render() {
    requestAnimationFrame(render);
    moveSceneUp();

    // handle collision checks
    handle_plane_collisions();
    handle_plane_missile_collisions();

    // move them
    handleEnemiesMotion();
    manage_plane_missiles();
    manage_enemy_missiles();
    manage_stars();

    // create objects
    if (HEALTH > 0 && SCORE < 400) {
        createEnemies();
        create_enemy_missiles();
        getHUD()
    }
    else {
        document.getElementById("hud").innerHTML = ""
    }
    monitor_game_status();
    renderer.render(scene, camera);
}

init();
render();