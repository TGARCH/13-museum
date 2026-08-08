import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'

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

// Pionowe ekrany YouTube Shorts w narożniku zaznaczonym na podglądzie.
const videoScreens = []
const screenFrameMaterial = new THREE.MeshStandardMaterial({
    color: 0x173449,
    emissive: 0x2de5ff,
    emissiveIntensity: 1.7,
    roughness: 0.16,
    metalness: 0.78,
    transparent: true,
    opacity: 0.72,
    depthWrite: false
})

const screenGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0x42e9ff,
    transparent: true,
    opacity: 0.11,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
})

function createYouTubeScreen(videoId, position, rotationY) {
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.62, 2.82, 0.055),
        screenFrameMaterial
    )
    frame.position.copy(position)
    frame.rotation.y = rotationY
    frame.castShadow = true
    scene.add(frame)

    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.92, 3.12), screenGlowMaterial.clone())
    glow.position.copy(position)
    glow.rotation.y = rotationY

    const element = document.createElement('div')
    element.className = 'youtube-screen'
    element.innerHTML = `
        <iframe
            title="Film Rysunek z Fabryczką"
            data-src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0&playsinline=1&modestbranding=1"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
        ></iframe>
        <div class="youtube-screen__hint">Esc — zwolnij kursor i uruchom film</div>
    `

    const screen = new CSS3DObject(element)
    screen.position.copy(position)
    screen.rotation.y = rotationY
    screen.scale.setScalar(0.0035)

    // Przesunięcie powierzchni odtwarzacza przed czarną ramę.
    const normal = new THREE.Vector3(0, 0, 1).applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        rotationY
    )
    screen.position.addScaledVector(normal, 0.045)
    glow.position.addScaledVector(normal, -0.02)
    scene.add(glow)
    scene.add(screen)

    videoScreens.push({
        object: screen,
        frame,
        glow,
        iframe: element.querySelector('iframe'),
        normal,
        baseY: position.y,
        phase: videoScreens.length * 1.37,
        loaded: false
    })
}

// Cztery lewitujące ekrany: po dwa na każdej z prostopadłych ścian.
createYouTubeScreen(
    'sTjfavBiKaw',
    new THREE.Vector3(10.55, 1.78, -13.48),
    0
)
createYouTubeScreen(
    'w8Gev2XEjEw',
    new THREE.Vector3(13.48, 1.78, -10.55),
    -Math.PI * 0.5
)
createYouTubeScreen(
    'U51P0KtXeDA',
    new THREE.Vector3(12.35, 1.78, -13.48),
    0
)
createYouTubeScreen(
    '8cuxCmHW_4A',
    new THREE.Vector3(13.48, 1.78, -12.35),
    -Math.PI * 0.5
)


/**
 * Sounds----------------------------------------------------------------------------------------------------
 */



/**
 * Models----------------------------------------------------------------------------------------------------
 */
//imported models

const gltfLoader = new GLTFLoader()

let mixer = null

gltfLoader.load('/models/model3d24_gltf/model3d24_light.gltf', (gltf) => {
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

// Subtle dust suspended in the gallery air. All particles share one geometry
// and one material, so the atmosphere costs a single draw call.
const dustCount = 480
const dustPositions = new Float32Array(dustCount * 3)
const dustSpeeds = new Float32Array(dustCount)
for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = THREE.MathUtils.randFloat(-13.5, 13.5)
    dustPositions[i * 3 + 1] = THREE.MathUtils.randFloat(0.25, 5.5)
    dustPositions[i * 3 + 2] = THREE.MathUtils.randFloat(-13.5, 13.5)
    dustSpeeds[i] = THREE.MathUtils.randFloat(0.018, 0.055)
}

const dustCanvas = document.createElement('canvas')
dustCanvas.width = dustCanvas.height = 32
const dustContext = dustCanvas.getContext('2d')
const dustGradient = dustContext.createRadialGradient(16, 16, 0, 16, 16, 16)
dustGradient.addColorStop(0, 'rgba(255, 246, 220, 0.9)')
dustGradient.addColorStop(0.25, 'rgba(255, 246, 220, 0.45)')
dustGradient.addColorStop(1, 'rgba(255, 246, 220, 0)')
dustContext.fillStyle = dustGradient
dustContext.fillRect(0, 0, 32, 32)

const dustGeometry = new THREE.BufferGeometry()
dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
const dustTexture = new THREE.CanvasTexture(dustCanvas)
const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({
    color: 0xfff4d6,
    map: dustTexture,
    size: 0.045,
    transparent: true,
    opacity: 0.38,
    alphaTest: 0.02,
    depthWrite: false,
    sizeAttenuation: true
}))
scene.add(dust)

// Ten sam proceduralny „niezidentyfikowany obiekt” co w scenie 03.
const specterGroup = new THREE.Group()
const specterBasePosition = new THREE.Vector3(0, 2.0, 0)
specterGroup.position.copy(specterBasePosition)
scene.add(specterGroup)

const specterGeometry = new THREE.IcosahedronGeometry(0.62, 3)
const specterPositionAttribute = specterGeometry.attributes.position
const specterBaseVertices = new Float32Array(specterPositionAttribute.array)
const specterMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(0x57f6ff) },
        uColorB: { value: new THREE.Color(0xb45cff) }
    },
    vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDirection;
        varying vec3 vLocalPosition;
        void main() {
            vLocalPosition = position;
            vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vViewDirection = normalize(-viewPosition.xyz);
            gl_Position = projectionMatrix * viewPosition;
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        varying vec3 vNormal;
        varying vec3 vViewDirection;
        varying vec3 vLocalPosition;
        void main() {
            float fresnel = pow(1.0 - abs(dot(vNormal, vViewDirection)), 2.2);
            float energyBand = 0.5 + 0.5 * sin(vLocalPosition.y * 13.0 - uTime * 2.2 + vLocalPosition.x * 5.0);
            float colorShift = 0.5 + 0.5 * sin(uTime * 0.75 + vLocalPosition.x * 4.0 + vLocalPosition.z * 3.0);
            vec3 color = mix(uColorA, uColorB, colorShift);
            float alpha = 0.055 + fresnel * 0.5 + energyBand * 0.09;
            gl_FragColor = vec4(color, alpha);
        }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
})

const specterCore = new THREE.Mesh(specterGeometry, specterMaterial)
specterGroup.add(specterCore)

const specterWireMaterial = new THREE.MeshBasicMaterial({
    color: 0x8dfbff,
    transparent: true,
    opacity: 0.3,
    wireframe: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
})
const specterWire = new THREE.Mesh(specterGeometry, specterWireMaterial)
specterWire.scale.setScalar(1.018)
specterGroup.add(specterWire)

const specterRingMaterialA = new THREE.MeshBasicMaterial({
    color: 0x63f5ff,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
    blending: THREE.AdditiveBlending
})
const specterRingMaterialB = new THREE.MeshBasicMaterial({
    color: 0xc16dff,
    transparent: true,
    opacity: 0.26,
    depthWrite: false,
    blending: THREE.AdditiveBlending
})
const specterRings = [
    new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.009, 8, 96), specterRingMaterialA),
    new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.007, 8, 96), specterRingMaterialB),
    new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.006, 8, 96), specterRingMaterialA)
]
specterRings[0].rotation.set(1.15, 0.25, 0.1)
specterRings[1].rotation.set(0.45, 1.1, 0.7)
specterRings[2].rotation.set(0.2, 0.75, 1.25)
for (const ring of specterRings) specterGroup.add(ring)

const specterElectronGeometry = new THREE.SphereGeometry(0.026, 12, 12)
const specterElectrons = []
const electronConfigurations = [
    { ringIndex: 0, radius: 0.92, speed: 1.45, phase: 0.2, color: 0xbffcff },
    { ringIndex: 0, radius: 0.92, speed: -0.92, phase: 2.5, color: 0xffffff },
    { ringIndex: 0, radius: 0.92, speed: 2.1, phase: 4.4, color: 0x73f4ff },
    { ringIndex: 1, radius: 1.08, speed: 0.72, phase: 1.3, color: 0xe4b6ff },
    { ringIndex: 1, radius: 1.08, speed: -1.28, phase: 4.0, color: 0xffffff },
    { ringIndex: 2, radius: 0.78, speed: 2.55, phase: 0.8, color: 0x9efcff },
    { ringIndex: 2, radius: 0.78, speed: -1.75, phase: 3.1, color: 0xd59cff },
    { ringIndex: 2, radius: 0.78, speed: 1.08, phase: 5.2, color: 0xffffff }
]

for (const configuration of electronConfigurations) {
    const electronGroup = new THREE.Group()
    const electronCore = new THREE.Mesh(
        specterElectronGeometry,
        new THREE.MeshBasicMaterial({
            color: configuration.color,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        })
    )
    const electronGlow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: dustTexture,
        color: configuration.color,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }))
    electronGlow.scale.setScalar(0.19)
    electronGroup.add(electronCore, electronGlow)
    specterRings[configuration.ringIndex].add(electronGroup)
    specterElectrons.push({ group: electronGroup, glow: electronGlow, ...configuration })
}

const specterLight = new THREE.PointLight(0x7f8cff, 4.2, 5, 2)
specterGroup.add(specterLight)
const specterTag = document.querySelector('.fabryczka-tag')
const specterTagWorld = new THREE.Vector3()
let specterTagFocused = false


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
    cssRenderer.setSize(sizes.width, sizes.height)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(65, sizes.width / sizes.height, 0.1, 60)
const eyeHeight = 1.45
const visitorRadius = 0.16
const walkSpeed = 2.6
const fastWalkSpeed = 5.2
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
const soundButton = document.querySelector('.sound-button')
let hasEnteredMuseum = false

let audioContext = null
let ambientGain = null
let musicStarted = false
let musicMuted = false

const startAmbientMusic = () => {
    if (musicStarted) {
        audioContext?.resume()
        return
    }
    musicStarted = true
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    ambientGain = audioContext.createGain()
    ambientGain.gain.setValueAtTime(0.0001, audioContext.currentTime)
    ambientGain.gain.exponentialRampToValueAtTime(0.075, audioContext.currentTime + 1.2)
    ambientGain.connect(audioContext.destination)

    // Original, jaunty 2/4 workshop-cartoon motif at 104 BPM. The melody uses
    // playful pauses and small rhythmic stumbles without quoting any theme.
    const arpeggio = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.00, 0,
        783.99, 659.25, 587.33, 523.25, 659.25, 783.99, 1046.50, 0,
        880.00, 783.99, 698.46, 587.33, 0, 659.25, 783.99, 659.25,
        523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 0]
    const bassNotes = [130.81, 174.61, 196.00, 146.83]
    let arpeggioStep = 0
    window.setInterval(() => {
        if (!audioContext || audioContext.state !== 'running' || musicMuted) return
        const step = arpeggioStep
        const frequency = arpeggio[step % arpeggio.length]
        arpeggioStep++
        const now = audioContext.currentTime

        if (step % 8 === 0) {
            const bass = audioContext.createOscillator()
            const bassGain = audioContext.createGain()
            bass.type = 'triangle'
            bass.frequency.value = bassNotes[Math.floor(step / 8) % bassNotes.length]
            bassGain.gain.setValueAtTime(0.0001, now)
            bassGain.gain.exponentialRampToValueAtTime(0.046, now + 0.012)
            bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)
            bass.connect(bassGain).connect(ambientGain)
            bass.start(now)
            bass.stop(now + 0.28)
        }
        if (!frequency) return

        const oscillator = audioContext.createOscillator()
        const sparkle = audioContext.createOscillator()
        const gain = audioContext.createGain()
        const sparkleGain = audioContext.createGain()
        oscillator.type = 'sine'
        sparkle.type = 'sine'
        oscillator.frequency.value = frequency
        sparkle.frequency.value = frequency * 2
        gain.gain.setValueAtTime(0.0001, now)
        gain.gain.exponentialRampToValueAtTime(0.044, now + 0.008)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
        sparkleGain.gain.setValueAtTime(0.0001, now)
        sparkleGain.gain.exponentialRampToValueAtTime(0.008, now + 0.006)
        sparkleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11)
        oscillator.connect(gain).connect(ambientGain)
        sparkle.connect(sparkleGain).connect(ambientGain)
        oscillator.start(now)
        sparkle.start(now)
        oscillator.stop(now + 0.22)
        sparkle.stop(now + 0.14)
    }, 214)
}

soundButton.addEventListener('click', (event) => {
    event.stopPropagation()
    startAmbientMusic()
    musicMuted = !musicMuted
    ambientGain.gain.exponentialRampToValueAtTime(musicMuted ? 0.0001 : 0.075, audioContext.currentTime + 0.25)
    soundButton.textContent = musicMuted ? 'Włącz muzykę' : 'Wycisz muzykę'
})

const collidesAt = (x, z) => collisionWalls.some((wall) => {
    const nearestX = THREE.MathUtils.clamp(x, wall.x - wall.halfX, wall.x + wall.halfX)
    const nearestZ = THREE.MathUtils.clamp(z, wall.z - wall.halfZ, wall.z + wall.halfZ)
    const dx = x - nearestX
    const dz = z - nearestZ
    return dx * dx + dz * dz < visitorRadius * visitorRadius
})

const requestMuseumControls = () => canvas.requestPointerLock()
startButton.addEventListener('click', () => {
    hasEnteredMuseum = true
    startAmbientMusic()
    requestMuseumControls()
})
canvas.addEventListener('click', () => {
    if (document.pointerLockElement === canvas && specterTagFocused) {
        window.open('https://rysunekzfabryczka.pl/#e-booki', '_blank', 'noopener,noreferrer')
        return
    }
    if (document.pointerLockElement !== canvas) requestMuseumControls()
})

document.addEventListener('pointerlockchange', () => {
    const active = document.pointerLockElement === canvas
    startPanel.classList.toggle('hidden', active)
    startPanel.classList.toggle('paused', !active && hasEnteredMuseum)
    startButton.textContent = hasEnteredMuseum ? 'Wróć do zwiedzania' : 'Wejdź do muzeum'
    if (!active) {
        specterTag.hidden = true
        specterTag.classList.remove('is-near', 'is-gazed')
        specterTagFocused = false
    }
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
    const movingFast = pressedKeys.has('ShiftLeft') || pressedKeys.has('ShiftRight')
    const currentWalkSpeed = movingFast ? fastWalkSpeed : walkSpeed
    movement.multiplyScalar(currentWalkSpeed * Math.min(deltaTime, 0.05))

    // Resolve axes separately: a blocked visitor stops in front of the wall,
    // while a diagonal movement can continue naturally along it.
    const nextX = camera.position.x + movement.x
    if (!collidesAt(nextX, camera.position.z)) camera.position.x = nextX
    const nextZ = camera.position.z + movement.z
    if (!collidesAt(camera.position.x, nextZ)) camera.position.z = nextZ
    camera.position.y = eyeHeight
}

const updateDust = (deltaTime, elapsedTime) => {
    const positions = dustGeometry.attributes.position.array
    for (let i = 0; i < dustCount; i++) {
        const offset = i * 3
        positions[offset + 1] += dustSpeeds[i] * deltaTime
        positions[offset] += Math.sin(elapsedTime * 0.18 + i * 1.7) * 0.002 * deltaTime
        if (positions[offset + 1] > 5.5) positions[offset + 1] = 0.25
    }
    dustGeometry.attributes.position.needsUpdate = true
}

const updateSpecter = (elapsedTime) => {
    const positions = specterPositionAttribute.array
    for (let vertexIndex = 0; vertexIndex < specterPositionAttribute.count; vertexIndex++) {
        const arrayIndex = vertexIndex * 3
        const baseX = specterBaseVertices[arrayIndex]
        const baseY = specterBaseVertices[arrayIndex + 1]
        const baseZ = specterBaseVertices[arrayIndex + 2]
        const geometricPulse = Math.sin(elapsedTime * 1.65 + baseX * 8 + baseY * 6 - baseZ * 7) * 0.22
        const slowMorph = Math.sin(elapsedTime * 0.72 + (baseX + baseZ) * 4) * 0.13
        const scale = 1 + geometricPulse + slowMorph
        positions[arrayIndex] = baseX * scale
        positions[arrayIndex + 1] = baseY * (scale + Math.sin(elapsedTime) * 0.08)
        positions[arrayIndex + 2] = baseZ * scale
    }
    specterPositionAttribute.needsUpdate = true
    specterGeometry.computeVertexNormals()
    specterMaterial.uniforms.uTime.value = elapsedTime
    specterGroup.position.set(
        specterBasePosition.x + Math.sin(elapsedTime * 0.55) * 0.38,
        specterBasePosition.y + Math.sin(elapsedTime * 0.92) * 0.24,
        specterBasePosition.z + Math.cos(elapsedTime * 0.48) * 0.3
    )
    specterGroup.rotation.y += 0.0045
    specterGroup.rotation.x = Math.sin(elapsedTime * 0.37) * 0.22
    specterRings[0].rotation.z += 0.006
    specterRings[1].rotation.x -= 0.004
    specterRings[2].rotation.y += 0.007

    specterElectrons.forEach((electron, index) => {
        const angle = elapsedTime * electron.speed + electron.phase
        electron.group.position.set(
            Math.cos(angle) * electron.radius,
            Math.sin(angle) * electron.radius,
            Math.sin(elapsedTime * (1.4 + index * 0.09) + electron.phase) * 0.018
        )
        electron.glow.scale.setScalar(0.19 * (1 + Math.sin(elapsedTime * 5 + electron.phase) * 0.18))
    })
    specterWireMaterial.opacity = 0.24 + Math.sin(elapsedTime * 2.4) * 0.08
    specterLight.intensity = 3.6 + Math.sin(elapsedTime * 1.8) * 0.8

    specterGroup.getWorldPosition(specterTagWorld)
    specterTagWorld.y += 1.05
    specterTagWorld.project(camera)
    const walking = document.pointerLockElement === canvas
    const closeEnough = camera.position.distanceTo(specterGroup.position) < 4.25
    const inFront = specterTagWorld.z > -1 && specterTagWorld.z < 1
    const visible = walking && closeEnough && inFront
    specterTagFocused = visible && Math.abs(specterTagWorld.x) < 0.2 && Math.abs(specterTagWorld.y) < 0.2
    specterTag.classList.toggle('is-near', visible)
    specterTag.classList.toggle('is-gazed', specterTagFocused)
    specterTag.hidden = !visible
    if (visible) {
        specterTag.style.left = `${(specterTagWorld.x * 0.5 + 0.5) * sizes.width}px`
        specterTag.style.top = `${(-specterTagWorld.y * 0.5 + 0.5) * sizes.height}px`
    }
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

const cssRenderer = new CSS3DRenderer()
cssRenderer.setSize(sizes.width, sizes.height)
cssRenderer.domElement.className = 'css3d-layer'
document.body.appendChild(cssRenderer.domElement)

const updateVideoScreens = (elapsedTime) => {
    for (const screen of videoScreens) {
        const floatY = screen.baseY + Math.sin(elapsedTime * 0.72 + screen.phase) * 0.055
        screen.object.position.y = floatY
        screen.frame.position.y = floatY
        screen.glow.position.y = floatY
        screen.glow.material.opacity = 0.085 + Math.sin(elapsedTime * 1.8 + screen.phase) * 0.025
        const toCamera = new THREE.Vector3()
            .subVectors(camera.position, screen.object.position)
        const distance = toCamera.length()
        const facingCamera = screen.normal.dot(toCamera.normalize()) > 0.08
        const visible = distance < 10 && facingCamera
        screen.object.visible = visible

        // YouTube ładuje się dopiero, gdy zwiedzający zbliży się do ekranu.
        if (visible && !screen.loaded) {
            screen.iframe.src = screen.iframe.dataset.src
            screen.loaded = true
        }
    }
}
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
    updateDust(deltaTime, elapsedTime)
    updateSpecter(elapsedTime)
    updateVideoScreens(elapsedTime)

    // Render
    renderer.render(scene, camera)
    cssRenderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
