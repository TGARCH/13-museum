import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * Debug----------------------------------------------------------------------------------------------------
 */

/**
 * Base----------------------------------------------------------------------------------------------------
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


/**
 * Sounds----------------------------------------------------------------------------------------------------
 */



/**
 * Models----------------------------------------------------------------------------------------------------
 */
//imported models

const gltfLoader = new GLTFLoader()

let mixer = null

gltfLoader.load('/models/model3d24_gltf/model3d24.gltf', (gltf) => {
    gltf.scene.scale.set(1, 1, 1);
    scene.add(gltf.scene);
    console.log(gltf)

    //mixer = new THREE.AnimationMixer(gltf.scene)
        //const action = mixer.clipAction(gltf.animations[0])
        //action.play()
    

    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true; // Włącz rzucanie cieni dla obiektu GLTF
            child.receiveShadow = true; // Włącz przyjmowanie cieni dla obiektu GLTF (opcjonalne)

            const edgesGeometry = new THREE.EdgesGeometry(child.geometry);
            const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x696969, linewidth: 1 });
            const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
            child.add(edges);
       }
    });

});


/**
 * Textures----------------------------------------------------------------------------------------------------
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
/*
const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])
*/

// Collision rectangles match the gallery walls. The visitor is represented
// by a circle in plan, so movement stays stable and never bounces.
const collisionWalls = [
    { x: 0, z: 15, halfX: 30, halfZ: 1 },
    { x: 0, z: -15, halfX: 30, halfZ: 1 },
    { x: 15, z: 0, halfX: 1, halfZ: 30 },
    { x: -15, z: 0, halfX: 1, halfZ: 30 },
    { x: 7, z: 5, halfX: 5, halfZ: 0.5 },
    { x: -7, z: 5, halfX: 5, halfZ: 0.25 },
    { x: 7, z: -5, halfX: 5, halfZ: 0.25 },
    { x: -7, z: -5, halfX: 5, halfZ: 0.25 },
    { x: 0, z: -10, halfX: 3.5, halfZ: 0.25 },
    { x: 0, z: 10, halfX: 3.5, halfZ: 0.25 },
    { x: -7, z: 10, halfX: 0.25, halfZ: 3.5 },
    { x: 7, z: 10, halfX: 0.25, halfZ: 3.5 },
    { x: 7, z: 0, halfX: 0.25, halfZ: 3.5 },
    { x: -7, z: 0, halfX: 0.25, halfZ: 3.5 },
    { x: -7, z: -10, halfX: 0.25, halfZ: 3.5 },
    { x: 7, z: -10, halfX: 0.25, halfZ: 3.5 }
]

/**
 * Lights
 */

//const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
//scene.add(ambientLight)
/*
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)
*/

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2)
scene.add(ambientLight)
//gui.add(ambientLight, 'intensity').min(0).max(1).step(0.01)

//const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.2)
//directionalLight.position.set(1,3,2)
//directionalLight.castShadow = true
//scene.add(directionalLight)

const hemisphereLight = new THREE.HemisphereLight(
    0xaafffb,0xffffaa,
    2)
scene.add(hemisphereLight)

//const pointLight = new THREE.PointLight(0xffffff, 10)
//pointLight.position.set(0,5,0)
//scene.add(pointLight)
//pointLight.castShadow = true

//const rectAreaLight = new THREE.RectAreaLight(0xffffff,5,5,5)
//rectAreaLight.position.set(0,5,0)
//rectAreaLight.lookAt(0,0,0)
//scene.add(rectAreaLight)


//const spotLight = new THREE.SpotLight(0xffffff, 10,20, 0.15*Math.PI, 0.8, 0.02)
//spotLight.position.set(1,5,0)
//spotLight.target.position.set(2,4.5,0)
//spotLight.lookAt(new THREE.Vector3(0, 0, 0));
//spotLight.castShadow = false
//gui.add(spotLight, 'intensity',0,50,0.01)
//gui.add(spotLight, 'distance',0,20,0.1)
//gui.add(spotLight, 'angle',0,0.2*Math.PI,0.001)
//gui.add(spotLight, 'penumbra',0,1,0.01)
//gui.add(spotLight, 'decay',0,1,0.01)
//gui.add(spotLight.position, 'x',-15,15,0.01)
//gui.add(spotLight.position, 'z',-15,15,0.01)
//gui.add(spotLight.target.position, 'x',-15,15,0.01)
//gui.add(spotLight.target.position, 'y',-15,15,0.01)
//gui.add(spotLight.target.position, 'z',-15,15,0.01)
//scene.add(spotLight)



/**
 * Helper
 */
//const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2)
//scene.add(hemisphereLightHelper)

//const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2)
//scene.add(directionalLightHelper)

//const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2)
//scene.add(pointLightHelper)

//const spotLightHelper = new THREE.SpotLightHelper(spotLight)
//scene.add(spotLightHelper)

//const rectAreaLightHelper = new THREE.RectAreaLightHelper(rectAreaLight)
//scene.add(rectAreaLightHelper)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(65, sizes.width / sizes.height, 0.1, 60)
const eyeHeight = 1.65
const visitorRadius = 0.25
const walkSpeed = 5
camera.position.set(-3, eyeHeight, 3)
scene.add(camera)

// Museum walk controls
let yaw = 0
let pitch = 0
const pressedKeys = new Set()
const movement = new THREE.Vector3()
const forward = new THREE.Vector3()
const right = new THREE.Vector3()
const startPanel = document.querySelector('.start-panel')
const startButton = document.querySelector('.start-button')

const collidesAt = (x, z) => collisionWalls.some((wall) => {
    const nearestX = THREE.MathUtils.clamp(x, wall.x - wall.halfX, wall.x + wall.halfX)
    const nearestZ = THREE.MathUtils.clamp(z, wall.z - wall.halfZ, wall.z + wall.halfZ)
    const dx = x - nearestX
    const dz = z - nearestZ
    return dx * dx + dz * dz < visitorRadius * visitorRadius
})

const requestMuseumControls = () => canvas.requestPointerLock()
startButton.addEventListener('click', requestMuseumControls)
canvas.addEventListener('click', () => {
    if (document.pointerLockElement !== canvas) requestMuseumControls()
})

document.addEventListener('pointerlockchange', () => {
    const active = document.pointerLockElement === canvas
    startPanel.classList.toggle('hidden', active)
    if (!active) pressedKeys.clear()
})

document.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement !== canvas) return
    yaw -= event.movementX * 0.002
    pitch -= event.movementY * 0.002
    pitch = THREE.MathUtils.clamp(pitch, -Math.PI * 0.47, Math.PI * 0.47)
})

window.addEventListener('keydown', (event) => {
    pressedKeys.add(event.code)
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
        event.preventDefault()
    }
})
window.addEventListener('keyup', (event) => pressedKeys.delete(event.code))
window.addEventListener('blur', () => pressedKeys.clear())

const updateWalkControls = (deltaTime) => {
    camera.rotation.set(pitch, yaw, 0, 'YXZ')
    if (document.pointerLockElement !== canvas) return

    const forwardInput = Number(pressedKeys.has('KeyW') || pressedKeys.has('ArrowUp'))
        - Number(pressedKeys.has('KeyS') || pressedKeys.has('ArrowDown'))
    const sideInput = Number(pressedKeys.has('KeyD') || pressedKeys.has('ArrowRight'))
        - Number(pressedKeys.has('KeyA') || pressedKeys.has('ArrowLeft'))
    if (!forwardInput && !sideInput) return

    forward.set(-Math.sin(yaw), 0, -Math.cos(yaw))
    right.set(Math.cos(yaw), 0, -Math.sin(yaw))
    movement.copy(forward).multiplyScalar(forwardInput).addScaledVector(right, sideInput).normalize()
    movement.multiplyScalar(walkSpeed * Math.min(deltaTime, 0.05))

    // Resolve axes separately: a blocked visitor stops in front of the wall,
    // while a diagonal movement can continue naturally along it.
    const nextX = camera.position.x + movement.x
    if (!collidesAt(nextX, camera.position.z)) camera.position.x = nextX
    const nextZ = camera.position.z + movement.z
    if (!collidesAt(camera.position.x, nextZ)) camera.position.z = nextZ
    camera.position.y = eyeHeight
}

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    //if(mixer)
    //{
    //    mixer.update(deltaTime)
    //}

    updateWalkControls(deltaTime)

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
