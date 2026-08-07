import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import CANNON from 'cannon' 
//import * as CANNON from 'cannon-es'
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

/**
 * Physics----------------------------------------------------------------------------------------------------
 */
const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true
world.gravity.set(0, - 9.82, 0)

// Default material
const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.7
    }
)
world.defaultContactMaterial = defaultContactMaterial

// Floor
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5) 
world.addBody(floorBody)



/**
 * Utils
 */
const objectsToUpdate = []

// Create sphere
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    //envMap: environmentMapTexture,
    envMapIntensity: 0.5
})

const createSphere = (radius, position) =>
{
    // Three.js mesh
    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
    mesh.castShadow = true
    mesh.scale.set(radius, radius, radius)
    mesh.position.copy(position)
    scene.add(mesh)

    // Cannon.js body
    const shape = new CANNON.Sphere(radius)

    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
        material: defaultMaterial
    })
    body.position.copy(position)
    body.addEventListener('collide', playHitSound)
    world.addBody(body)

    // Save in objects
    objectsToUpdate.push({ mesh, body })
}

// Create box
/*
const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5
})
const createBox = (width, height, depth, position) =>
{
    // Three.js mesh
    const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
    mesh.scale.set(width, height, depth)
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh)

    // Cannon.js body
    const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))

    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
        material: defaultMaterial
    })
    body.position.copy(position)
    //body.addEventListener('collide', playHitSound)
    world.addBody(body)

    // Save in objects
    objectsToUpdate.push({ mesh, body })
}

createBox(1, 1.5, 2, { x: 0, y: 3, z: 0 })
*/

// Walls-------------------------------------------------------------------------------------------------------------
// External walls----------------------------------------------------------------------------------------------------
const Wall1Shape = new CANNON.Box (new CANNON.Vec3(30, 20, 1))
const Wall1Body = new CANNON.Body()
Wall1Body.mass = 0
Wall1Body.addShape(Wall1Shape)
Wall1Body.position.set(0,0,15)
world.addBody(Wall1Body)

const Wall2Shape = new CANNON.Box (new CANNON.Vec3(30, 20, 1))
const Wall2Body = new CANNON.Body()
Wall2Body.mass = 0
Wall2Body.addShape(Wall2Shape)
Wall2Body.position.set(0,0,-15)
world.addBody(Wall2Body)

const Wall3Shape = new CANNON.Box (new CANNON.Vec3(1, 20, 30))
const Wall3Body = new CANNON.Body()
Wall3Body.mass = 0
Wall3Body.addShape(Wall3Shape)
Wall3Body.position.set(15,0,0)
world.addBody(Wall3Body)

const Wall4Shape = new CANNON.Box (new CANNON.Vec3(1, 20, 30))
const Wall4Body = new CANNON.Body()
Wall4Body.mass = 0
Wall4Body.addShape(Wall4Shape)
Wall4Body.position.set(-15,0,0)
world.addBody(Wall4Body)

// Internal walls
const Wall5Shape = new CANNON.Box (new CANNON.Vec3(5, 20, 0.5))
const Wall5Body = new CANNON.Body()
Wall5Body.mass = 0
Wall5Body.addShape(Wall5Shape)
Wall5Body.position.set(7,0,5)
world.addBody(Wall5Body)

const Wall6Shape = new CANNON.Box (new CANNON.Vec3(5, 20, 0.25))
const Wall6Body = new CANNON.Body()
Wall6Body.mass = 0
Wall6Body.addShape(Wall6Shape)
Wall6Body.position.set(-7,0,5)
world.addBody(Wall6Body)

const Wall7Shape = new CANNON.Box (new CANNON.Vec3(5, 20, 0.25))
const Wall7Body = new CANNON.Body()
Wall7Body.mass = 0
Wall7Body.addShape(Wall7Shape)
Wall7Body.position.set(7,0,-5)
world.addBody(Wall7Body)

const Wall8Shape = new CANNON.Box (new CANNON.Vec3(5, 20, 0.25))
const Wall8Body = new CANNON.Body()
Wall8Body.mass = 0
Wall8Body.addShape(Wall8Shape)
Wall8Body.position.set(-7,0,-5)
world.addBody(Wall8Body)

// Internal wall2----------------------------------------------------------------------------------------------------
const Wall9Shape = new CANNON.Box (new CANNON.Vec3(3.5, 20, 0.25))
const Wall9Body = new CANNON.Body()
Wall9Body.mass = 0
Wall9Body.addShape(Wall9Shape)
Wall9Body.position.set(0,0,-10)
world.addBody(Wall9Body)

const Wall10Shape = new CANNON.Box (new CANNON.Vec3(3.5, 20, 0.25))
const Wall10Body = new CANNON.Body()
Wall10Body.mass = 0
Wall10Body.addShape(Wall10Shape)
Wall10Body.position.set(0,0,10)
world.addBody(Wall10Body)

// Internal wall3----------------------------------------------------------------------------------------------------
const Wall11Shape = new CANNON.Box (new CANNON.Vec3(0.25, 20, 3.5))
const Wall11Body = new CANNON.Body()
Wall11Body.mass = 0
Wall11Body.addShape(Wall11Shape)
Wall11Body.position.set(-7,0,10)
world.addBody(Wall11Body)

const Wall12Shape = new CANNON.Box (new CANNON.Vec3(0.25, 20, 3.5))
const Wall12Body = new CANNON.Body()
Wall12Body.mass = 0
Wall12Body.addShape(Wall12Shape)
Wall12Body.position.set(7,0,10)
world.addBody(Wall12Body)

const Wall13Shape = new CANNON.Box (new CANNON.Vec3(0.25, 20, 3.5))
const Wall13Body = new CANNON.Body()
Wall13Body.mass = 0
Wall13Body.addShape(Wall13Shape)
Wall13Body.position.set(7,0,0)
world.addBody(Wall13Body)

const Wall14Shape = new CANNON.Box (new CANNON.Vec3(0.25, 20, 3.5))
const Wall14Body = new CANNON.Body()
Wall14Body.mass = 0
Wall14Body.addShape(Wall14Shape)
Wall14Body.position.set(-7,0,0)
world.addBody(Wall14Body)

const Wall15Shape = new CANNON.Box (new CANNON.Vec3(0.25, 20, 3.5))
const Wall15Body = new CANNON.Body()
Wall15Body.mass = 0
Wall15Body.addShape(Wall15Shape)
Wall15Body.position.set(-7,0,-10)
world.addBody(Wall15Body)

const Wall16Shape = new CANNON.Box (new CANNON.Vec3(0.25, 20, 3.5))
const Wall16Body = new CANNON.Body()
Wall16Body.mass = 0
Wall16Body.addShape(Wall16Shape)
Wall16Body.position.set(7,0,-10)
world.addBody(Wall16Body)

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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 3, 3, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

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

    // Update physics
    world.step(1 / 60, deltaTime, 3)
    
    for(const object of objectsToUpdate)
    {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
    }

    //if(mixer)
    //{
    //    mixer.update(deltaTime)
    //}

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
