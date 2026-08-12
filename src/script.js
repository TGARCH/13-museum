import './style.css'
import { inject } from '@vercel/analytics'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'

inject()

/**
 * Debug----------------------------------------------------------------------------------------------------
 */

/**
 * Base----------------------------------------------------------------------------------------------------
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')
// Nie traktuj laptopów z dodatkowym ekranem dotykowym jak telefonów.
// Tryb mobilny włączamy tylko wtedy, gdy głównym wskaźnikiem jest dotyk
// i urządzenie nie oferuje klasycznego najechania kursorem.
const isTouchDevice = window.matchMedia('(pointer: coarse) and (hover: none)').matches

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
        new THREE.BoxGeometry(2.916, 5.076, 0.075),
        screenFrameMaterial
    )
    frame.position.copy(position)
    frame.rotation.y = rotationY
    frame.castShadow = true
    scene.add(frame)

    const glow = new THREE.Mesh(new THREE.PlaneGeometry(3.456, 5.616), screenGlowMaterial.clone())
    glow.position.copy(position)
    glow.rotation.y = rotationY

    const element = document.createElement('div')
    element.className = 'youtube-screen'
    element.innerHTML = `
        <iframe
            title="Film Rysunek z Fabryczką"
            data-src="https://www.youtube.com/embed/${videoId}?rel=0&playsinline=1&modestbranding=1&autoplay=1&mute=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}"
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
        ></iframe>
        <div class="youtube-screen__hint">Film uruchamia się automatycznie • dźwięk w odtwarzaczu</div>
    `

    const screen = new CSS3DObject(element)
    screen.position.copy(position)
    screen.rotation.y = rotationY
    screen.scale.setScalar(0.0063)

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
        loaded: false,
        playingNearby: false
    })
}

// Cztery lewitujące ekrany: po jednym w każdym narożniku muzeum.
createYouTubeScreen(
    'sTjfavBiKaw',
    new THREE.Vector3(-12.55, 2.66, -12.55),
    Math.PI * 0.25
)
createYouTubeScreen(
    'w8Gev2XEjEw',
    new THREE.Vector3(12.55, 2.66, -12.55),
    -Math.PI * 0.25
)
createYouTubeScreen(
    'U51P0KtXeDA',
    new THREE.Vector3(-12.55, 2.66, 12.55),
    Math.PI * 0.75
)
createYouTubeScreen(
    '8cuxCmHW_4A',
    new THREE.Vector3(12.55, 2.66, 12.55),
    -Math.PI * 0.75
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
const dustCount = isTouchDevice ? 260 : 480
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
let specterTagVisibleUntil = 0


/**
 * Textures----------------------------------------------------------------------------------------------------
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

// Mały twórczy bałagan pozostawiony na podłodze po zajęciach z rysunku.
const drawingMess = new THREE.Group()
drawingMess.position.set(-10.35, 0.035, -0.4)
scene.add(drawingMess)

const paperGeometry = new THREE.PlaneGeometry(0.55, 0.78, 5, 7)
const paperPositions = paperGeometry.attributes.position
for (let index = 0; index < paperPositions.count; index++) {
    const x = paperPositions.getX(index) / 0.275
    const y = paperPositions.getY(index) / 0.39
    paperPositions.setZ(index, (Math.pow(Math.abs(x), 5) + Math.pow(Math.abs(y), 6)) * 0.006)
}
paperGeometry.computeVertexNormals()

const paperLayouts = [
    [-1.42, -0.92, -0.71], [0.38, 0.84, 1.04], [-0.76, 1.48, 0.16], [1.36, -0.28, -1.12], [-0.18, -1.22, 0.55],
    [0.94, 1.34, -0.42], [-1.55, 0.36, 1.18], [0.12, 0.08, -0.88], [1.48, 0.62, 0.36], [-0.92, -0.36, -0.18],
    [0.74, -0.86, 0.94], [-0.36, 1.12, -1.24], [1.12, 0.18, 0.08], [-1.22, 1.02, 0.72], [0.24, -0.58, -0.28],
    [-1.62, -0.18, 0.43]
]

const coverImages = [
    '0_koty.jpg', '0_jedzenie-i-rosliny-600x861.jpg', '0_ptaki-i-inne-zwierzeta.jpg'
]
const patternImages = [
    '01-psy-4-600x848.jpg', '05-czlowiek-13-600x849.jpg', '06-pojazdy-11-600x424.jpg'
]
const printedImages = [...coverImages, ...patternImages]

paperLayouts.forEach(([x, z, rotation], index) => {
    let material
    if (index < 10) {
        material = new THREE.MeshStandardMaterial({ color: 0xfffdf7, roughness: 0.92, side: THREE.DoubleSide })
    } else {
        const imageName = printedImages[index - 10]
        const map = textureLoader.load(`/textures/drawing-mess-web/${imageName}`)
        map.colorSpace = THREE.SRGBColorSpace
        if (imageName === '06-pojazdy-11-600x424.jpg') {
            map.center.set(0.5, 0.5)
            map.rotation = Math.PI * 0.5
        }
        material = new THREE.MeshStandardMaterial({ map, color: 0xffffff, roughness: 0.88, side: THREE.DoubleSide })
    }
    const paper = new THREE.Mesh(paperGeometry, material)
    paper.position.set(x, 0.008 + index * 0.0012, z)
    paper.rotation.set(-Math.PI * 0.5, 0, rotation)
    paper.castShadow = true
    paper.receiveShadow = true
    drawingMess.add(paper)
})

const crayonColors = [0xef3e42, 0xff8a32, 0xffd83d, 0x54b948, 0x24b7b0, 0x3185e5, 0x7756c5, 0xd64da1, 0x7a4b2c, 0x20262c]
const crayonBodyGeometry = new THREE.CylinderGeometry(0.026, 0.026, 0.42, 8)
const crayonWoodGeometry = new THREE.ConeGeometry(0.026, 0.11, 8)
const crayonLeadGeometry = new THREE.ConeGeometry(0.011, 0.045, 8)
const crayonWoodMaterial = new THREE.MeshStandardMaterial({ color: 0xe8c38f, roughness: 0.82 })

const createMagicCrayon = (colorIndex, scale = 1) => {
    const crayon = new THREE.Group()
    const color = crayonColors[colorIndex % crayonColors.length]
    const bodyMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.62 })
    const body = new THREE.Mesh(crayonBodyGeometry, bodyMaterial)
    body.rotation.z = Math.PI * 0.5
    const wood = new THREE.Mesh(crayonWoodGeometry, crayonWoodMaterial)
    wood.position.x = 0.265
    wood.rotation.z = -Math.PI * 0.5
    const lead = new THREE.Mesh(crayonLeadGeometry, bodyMaterial)
    lead.position.x = 0.34
    lead.rotation.z = -Math.PI * 0.5
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: dustTexture,
        color,
        transparent: true,
        opacity: 0.48,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }))
    glow.scale.setScalar(0.32)
    crayon.add(body, wood, lead, glow)
    crayon.scale.setScalar(scale)
    crayon.userData.glow = glow
    crayon.traverse((part) => { if (part.isMesh) part.castShadow = true })
    return crayon
}

const workshopMagicCrayons = []
for (let index = 0; index < 10; index++) {
    const crayon = createMagicCrayon(index, 0.5)
    drawingMess.add(crayon)
    workshopMagicCrayons.push({
        object: crayon,
        phase: index * Math.PI * 0.2,
        radius: 0.62 + (index % 4) * 0.23
    })
}

const roamingCrayonBases = [
    [-11, 2.2, -10], [-4, 3.1, -12], [4, 2.5, -11], [11, 3.4, -8],
    [-11, 3.5, 7], [-4, 2.4, 11], [4, 3.6, 10], [11, 2.2, 8],
    [-10, 2.8, 2.5], [-3, 3.7, -3], [3, 2.2, 3.2], [10, 3.2, -1]
]
const roamingMagicCrayons = roamingCrayonBases.map(([x, y, z], index) => {
    const crayon = createMagicCrayon(index + 2, 0.72)
    crayon.position.set(x, y, z)
    scene.add(crayon)
    return { object: crayon, base: new THREE.Vector3(x, y, z), phase: index * 1.73 }
})

const updateMagicCrayons = (elapsedTime) => {
    workshopMagicCrayons.forEach((crayon, index) => {
        const angle = elapsedTime * (0.48 + (index % 3) * 0.08) + crayon.phase
        crayon.object.position.set(
            Math.cos(angle) * crayon.radius,
            0.38 + Math.sin(elapsedTime * 1.7 + crayon.phase) * 0.16 + (index % 2) * 0.1,
            Math.sin(angle) * crayon.radius * 0.72 + 0.18
        )
        crayon.object.rotation.set(Math.sin(angle * 1.4) * 0.45, -angle, Math.cos(angle * 1.8) * 0.35)
        const pulse = 0.7 + Math.sin(elapsedTime * 4.6 + crayon.phase) * 0.3
        crayon.object.userData.glow.material.opacity = 0.28 + pulse * 0.42
        crayon.object.userData.glow.scale.setScalar(0.28 + pulse * 0.2)
    })

    roamingMagicCrayons.forEach((crayon, index) => {
        const time = elapsedTime + crayon.phase
        crayon.object.position.set(
            crayon.base.x + Math.sin(time * 0.34) * 1.2,
            crayon.base.y + Math.sin(time * 0.82) * 0.42,
            crayon.base.z + Math.cos(time * 0.29) * 1.0
        )
        crayon.object.rotation.set(Math.sin(time * 0.7) * 0.8, time * 0.42, Math.cos(time * 0.53) * 0.65)
        const flash = Math.pow(Math.max(0, Math.sin(time * 2.8)), 7)
        crayon.object.userData.glow.material.opacity = 0.22 + flash * 0.78
        crayon.object.userData.glow.scale.setScalar(0.34 + flash * 0.42)
    })
}
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

// Pole 1 × 1 m po przeciwnej stronie muzeum uruchamia deszcz klocków.
const blockTriggerPosition = new THREE.Vector3(10.35, 0.025, -0.4)
const blockTriggerMaterial = new THREE.MeshStandardMaterial({
    color: 0x4c2b78,
    emissive: 0x8b54ff,
    emissiveIntensity: 1.6,
    transparent: true,
    opacity: 0.74,
    roughness: 0.28,
    metalness: 0.25
})
const blockTrigger = new THREE.Mesh(new THREE.BoxGeometry(1, 0.035, 1), blockTriggerMaterial)
blockTrigger.position.copy(blockTriggerPosition)
scene.add(blockTrigger)
const blockTriggerEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(blockTrigger.geometry),
    new THREE.LineBasicMaterial({ color: 0xd8c6ff, transparent: true, opacity: 0.92 })
)
blockTrigger.add(blockTriggerEdges)

const fallingBlocks = []

let blockTriggerOccupied = false
let blockRainCount = 0
const blockColors = [0xff4d61, 0xffa62b, 0xffdf4d, 0x5bd46d, 0x46c7e8, 0x4f78ff, 0x9d5cff, 0xf05bc3]
const blockSpawnPoints = [
    [-11.5, -11], [-8.8, -7.5], [-11.2, -2.5], [-10.2, 3.8], [-11.4, 9.2],
    [-4.8, -12], [0, -12.2], [4.8, -12], [-4.2, -7.3], [0, -7.4], [4.3, -7.2],
    [-4.5, -2.5], [0, -3.4], [4.4, -2.4], [-4.3, 3.1], [0, 3.4], [4.4, 3.0],
    [9.5, -9], [11.1, -4.4], [10.4, 4.2], [11.2, 9.3]
]

const startBlockRain = () => {
    blockRainCount++

    // Zachowaj rozsądny koszt sceny po wielu uruchomieniach pola.
    while (fallingBlocks.length > 42) {
        const oldest = fallingBlocks.shift()
        scene.remove(oldest.mesh)
        oldest.mesh.material.dispose()
    }

    blockSpawnPoints.forEach(([x, z], index) => {
        const material = new THREE.MeshStandardMaterial({
            color: blockColors[index % blockColors.length],
            roughness: 0.44,
            metalness: 0.12,
            emissive: blockColors[index % blockColors.length],
            emissiveIntensity: 0.08
        })
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material)
        const offset = ((blockRainCount + index) % 3 - 1) * 0.16
        mesh.position.set(x + offset, 6.5 + (index % 6) * 1.15, z - offset)
        mesh.rotation.y = (index * 0.71) % Math.PI
        mesh.castShadow = true
        mesh.receiveShadow = true
        const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(mesh.geometry),
            new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28 })
        )
        mesh.add(edges)
        scene.add(mesh)
        fallingBlocks.push({
            mesh,
            velocity: new THREE.Vector3((index % 3 - 1) * 0.18, -0.3, ((index + 1) % 3 - 1) * 0.16),
            settled: false
        })
    })
}

const createEffectPad = (x, z, color, emissive) => {
    const material = new THREE.MeshStandardMaterial({
        color,
        emissive,
        emissiveIntensity: 1.3,
        transparent: true,
        opacity: 0.76,
        roughness: 0.25,
        metalness: 0.3
    })
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 0.035, 1), material)
    mesh.position.set(x, 0.025, z)
    const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(mesh.geometry),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.78 })
    )
    mesh.add(edges)
    scene.add(mesh)
    return { mesh, material, position: mesh.position.clone(), occupied: false }
}

const alarmPad = createEffectPad(-12.15, 7.7, 0x671c22, 0xff2638)
const discoPad = createEffectPad(12.15, 7.7, 0x163c68, 0x35d9ff)
let lightingMode = 'normal'

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

const alarmLights = [
    new THREE.PointLight(0xff142d, 0, 18, 1.4),
    new THREE.PointLight(0xff142d, 0, 18, 1.4),
    new THREE.PointLight(0xff142d, 0, 18, 1.4),
    new THREE.PointLight(0xff142d, 0, 18, 1.4)
]
alarmLights[0].position.set(-9, 4.8, -9)
alarmLights[1].position.set(9, 4.8, -9)
alarmLights[2].position.set(-9, 4.8, 9)
alarmLights[3].position.set(9, 4.8, 9)
scene.add(...alarmLights)

const discoColors = [
    0xff2d87, 0x35e6ff, 0x8d5cff, 0xffca3a, 0x4dff88,
    0xff5f38, 0x3f7cff, 0xe942ff, 0x58ffd5, 0xff7b2d
]
const discoLights = discoColors.map((color, index) => {
    const light = new THREE.SpotLight(color, 0, 34, Math.PI * 0.105, 0.5, 1.1)
    const angle = index / discoColors.length * Math.PI * 2
    light.position.set(Math.cos(angle) * 11.5, 5.2, Math.sin(angle) * 11.5)
    light.target.position.set(0, 0.4, 0)
    scene.add(light, light.target)
    return { light, phase: angle }
})

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isTouchDevice ? 1.35 : 2))
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
const mobileControls = document.querySelector('.mobile-controls')
const joystick = document.querySelector('.mobile-joystick')
const joystickKnob = document.querySelector('.mobile-joystick__knob')
const mobileRunButton = document.querySelector('.mobile-run-button')
const mobileJumpButton = document.querySelector('.mobile-jump-button')
const mobileInteractButton = document.querySelector('.mobile-interact-button')
const mobilePauseButton = document.querySelector('.mobile-pause-button')
let hasEnteredMuseum = false
let mobileControlsActive = false
let mobileForwardInput = 0
let mobileSideInput = 0
let mobileRunning = false
let joystickPointerId = null
let lookPointerId = null
let lastLookX = 0
let lastLookY = 0
let playerVerticalVelocity = 0
let playerGrounded = true

let audioContext = null
let ambientGain = null
let musicStarted = false
let musicMuted = false
let childrenAmbienceGain = null
let childrenAmbienceSource = null
let alarmSirenGain = null
let alarmSirenLow = null
let alarmSirenHigh = null

const ensureAlarmSiren = () => {
    if (!audioContext || alarmSirenGain) return
    alarmSirenGain = audioContext.createGain()
    alarmSirenGain.gain.setValueAtTime(0.0001, audioContext.currentTime)
    alarmSirenLow = audioContext.createOscillator()
    alarmSirenHigh = audioContext.createOscillator()
    alarmSirenLow.type = 'sawtooth'
    alarmSirenHigh.type = 'triangle'
    const lowGain = audioContext.createGain()
    const highGain = audioContext.createGain()
    lowGain.gain.value = 0.62
    highGain.gain.value = 0.28
    alarmSirenLow.connect(lowGain).connect(alarmSirenGain)
    alarmSirenHigh.connect(highGain).connect(alarmSirenGain)
    alarmSirenGain.connect(audioContext.destination)
    alarmSirenLow.start()
    alarmSirenHigh.start()
}

// Mixkit SFX 427 — "Laughing children indoors", Mixkit License.
// Plik jest lokalnie przefiltrowany, aby ograniczyć piski i szum tła.
const startChildrenAmbience = async () => {
    if (!audioContext || childrenAmbienceSource) return
    try {
        const response = await fetch('/audio/kids-playing-ambience-mobile.mp3')
        const encodedAudio = await response.arrayBuffer()
        const buffer = await audioContext.decodeAudioData(encodedAudio)
        childrenAmbienceGain = audioContext.createGain()
        childrenAmbienceGain.gain.setValueAtTime(0.0001, audioContext.currentTime)
        childrenAmbienceGain.connect(audioContext.destination)
        childrenAmbienceSource = audioContext.createBufferSource()
        childrenAmbienceSource.buffer = buffer
        childrenAmbienceSource.loop = true
        childrenAmbienceSource.connect(childrenAmbienceGain)
        childrenAmbienceSource.start()
    } catch (error) {
        console.warn('Nie udało się uruchomić odgłosów dzieci.', error)
    }
}

const startAmbientMusic = () => {
    if (musicStarted) {
        audioContext?.resume()
        startChildrenAmbience()
        ensureAlarmSiren()
        return
    }
    musicStarted = true
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    ambientGain = audioContext.createGain()
    ambientGain.gain.setValueAtTime(0.0001, audioContext.currentTime)
    ambientGain.gain.exponentialRampToValueAtTime(0.075, audioContext.currentTime + 1.2)
    ambientGain.connect(audioContext.destination)
    startChildrenAmbience()
    ensureAlarmSiren()

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

const collidesRadiusAt = (x, z, radius) => collisionWalls.some((wall) => {
    const nearestX = THREE.MathUtils.clamp(x, wall.x - wall.halfX, wall.x + wall.halfX)
    const nearestZ = THREE.MathUtils.clamp(z, wall.z - wall.halfZ, wall.z + wall.halfZ)
    const dx = x - nearestX
    const dz = z - nearestZ
    return dx * dx + dz * dz < radius * radius
})
const collidesAt = (x, z) => collidesRadiusAt(x, z, visitorRadius)

const setMobileNavigation = (active) => {
    mobileControlsActive = active
    mobileControls.classList.toggle('active', active)
    startPanel.classList.toggle('hidden', active)
    startPanel.classList.toggle('paused', !active && hasEnteredMuseum)
    startButton.textContent = hasEnteredMuseum ? 'Wróć do zwiedzania' : 'Wejdź do muzeum'
    cssRenderer.domElement.classList.add('interactive')
    if (!active) {
        mobileForwardInput = 0
        mobileSideInput = 0
        joystickKnob.style.transform = 'translate(0, 0)'
        specterTag.hidden = true
        mobileInteractButton.hidden = true
    }
}

const requestMuseumControls = () => {
    if (isTouchDevice) setMobileNavigation(true)
    else canvas.requestPointerLock()
}
startButton.addEventListener('click', () => {
    hasEnteredMuseum = true
    startAmbientMusic()
    requestMuseumControls()
})
canvas.addEventListener('click', () => {
    if (isTouchDevice) return
    if (document.pointerLockElement === canvas && specterTagFocused) {
        window.open('https://rysunekzfabryczka.pl/#e-booki', '_blank', 'noopener,noreferrer')
        return
    }
    if (document.pointerLockElement !== canvas) requestMuseumControls()
})

const updateJoystick = (clientX, clientY) => {
    const bounds = joystick.getBoundingClientRect()
    const centerX = bounds.left + bounds.width * 0.5
    const centerY = bounds.top + bounds.height * 0.5
    const maxDistance = bounds.width * 0.34
    let dx = clientX - centerX
    let dy = clientY - centerY
    const distance = Math.hypot(dx, dy)
    if (distance > maxDistance) {
        dx = dx / distance * maxDistance
        dy = dy / distance * maxDistance
    }
    joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`
    mobileSideInput = dx / maxDistance
    mobileForwardInput = -dy / maxDistance
}

joystick.addEventListener('pointerdown', (event) => {
    if (!mobileControlsActive) return
    joystickPointerId = event.pointerId
    joystick.setPointerCapture(event.pointerId)
    updateJoystick(event.clientX, event.clientY)
})
joystick.addEventListener('pointermove', (event) => {
    if (event.pointerId === joystickPointerId) updateJoystick(event.clientX, event.clientY)
})
const releaseJoystick = (event) => {
    if (event.pointerId !== joystickPointerId) return
    joystickPointerId = null
    mobileForwardInput = 0
    mobileSideInput = 0
    joystickKnob.style.transform = 'translate(0, 0)'
}
joystick.addEventListener('pointerup', releaseJoystick)
joystick.addEventListener('pointercancel', releaseJoystick)

canvas.addEventListener('pointerdown', (event) => {
    if (!isTouchDevice || !mobileControlsActive || lookPointerId !== null) return
    lookPointerId = event.pointerId
    lastLookX = event.clientX
    lastLookY = event.clientY
    canvas.setPointerCapture(event.pointerId)
})
canvas.addEventListener('pointermove', (event) => {
    if (event.pointerId !== lookPointerId) return
    yaw -= (event.clientX - lastLookX) * 0.0052
    pitch -= (event.clientY - lastLookY) * 0.0044
    pitch = THREE.MathUtils.clamp(pitch, -Math.PI * 0.47, Math.PI * 0.47)
    lastLookX = event.clientX
    lastLookY = event.clientY
})
const releaseLook = (event) => {
    if (event.pointerId === lookPointerId) lookPointerId = null
}
canvas.addEventListener('pointerup', releaseLook)
canvas.addEventListener('pointercancel', releaseLook)

mobileRunButton.addEventListener('pointerdown', (event) => {
    event.stopPropagation()
    mobileRunning = true
    mobileRunButton.classList.add('pressed')
})
const stopMobileRunning = () => {
    mobileRunning = false
    mobileRunButton.classList.remove('pressed')
}
mobileRunButton.addEventListener('pointerup', stopMobileRunning)
mobileRunButton.addEventListener('pointercancel', stopMobileRunning)
const requestJump = () => {
    const navigationActive = isTouchDevice ? mobileControlsActive : document.pointerLockElement === canvas
    if (!navigationActive || !playerGrounded) return
    playerVerticalVelocity = 5.05
    playerGrounded = false
}
mobileJumpButton.addEventListener('pointerdown', (event) => {
    event.stopPropagation()
    requestJump()
})
mobilePauseButton.addEventListener('click', (event) => {
    event.stopPropagation()
    setMobileNavigation(false)
})
mobileInteractButton.addEventListener('click', (event) => {
    event.stopPropagation()
    window.open('https://rysunekzfabryczka.pl/#e-booki', '_blank', 'noopener,noreferrer')
})

document.addEventListener('pointerlockchange', () => {
    const active = document.pointerLockElement === canvas
    cssRenderer.domElement.classList.toggle('interactive', !active)
    startPanel.classList.toggle('hidden', active)
    startPanel.classList.toggle('paused', !active && hasEnteredMuseum)
    startButton.textContent = hasEnteredMuseum ? 'Wróć do zwiedzania' : 'Wejdź do muzeum'
    if (!active) {
        specterTag.hidden = true
        specterTag.classList.remove('is-near', 'is-gazed')
        specterTagFocused = false
        specterTagVisibleUntil = 0
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
    if (event.code === 'Space' && !event.repeat) requestJump()
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
        event.preventDefault()
    }
})
window.addEventListener('keyup', (event) => pressedKeys.delete(event.code))
window.addEventListener('blur', () => pressedKeys.clear())

const pushBlocksByVisitor = (visitorDelta) => {
    const pushDistance = visitorDelta.length()
    if (!pushDistance) return

    if (!fallingBlocks.length) return
    for (const block of fallingBlocks) {
        if (block.mesh.position.y > 0.62) continue
        const feetY = camera.position.y - eyeHeight
        if (feetY >= block.mesh.position.y + 0.43) continue
        const dx = block.mesh.position.x - camera.position.x
        const dz = block.mesh.position.z - camera.position.z
        const distance = Math.hypot(dx, dz)
        if (distance >= 0.72) continue
        const inverseDistance = 1 / Math.max(distance, 0.001)
        const pushX = dx * inverseDistance * (pushDistance + 0.035)
        const pushZ = dz * inverseDistance * (pushDistance + 0.035)
        const nextX = block.mesh.position.x + pushX
        const nextZ = block.mesh.position.z + pushZ
        if (!collidesRadiusAt(nextX, block.mesh.position.z, 0.52)) block.mesh.position.x = nextX
        if (!collidesRadiusAt(block.mesh.position.x, nextZ, 0.52)) block.mesh.position.z = nextZ
        block.velocity.x += pushX * 5.5
        block.velocity.z += pushZ * 5.5
        block.settled = false
    }
}

const visitorCollidesWithBlock = (x, z) => {
    const feetY = camera.position.y - eyeHeight
    return fallingBlocks.some((block) => {
        const top = block.mesh.position.y + 0.5
        if (feetY >= top - 0.07) return false
        const nearestX = THREE.MathUtils.clamp(x, block.mesh.position.x - 0.5, block.mesh.position.x + 0.5)
        const nearestZ = THREE.MathUtils.clamp(z, block.mesh.position.z - 0.5, block.mesh.position.z + 0.5)
        const dx = x - nearestX
        const dz = z - nearestZ
        return dx * dx + dz * dz < visitorRadius * visitorRadius
    })
}

const blockSupportsVisitor = (block) => {
    const dx = Math.abs(camera.position.x - block.mesh.position.x)
    const dz = Math.abs(camera.position.z - block.mesh.position.z)
    return dx <= 0.5 + visitorRadius * 0.65 && dz <= 0.5 + visitorRadius * 0.65
}

const findSupportNear = (feetY) => {
    let support = Math.abs(feetY) <= 0.14 ? 0 : null
    for (const block of fallingBlocks) {
        if (!blockSupportsVisitor(block)) continue
        const top = block.mesh.position.y + 0.5
        if (top <= feetY + 0.11 && feetY - top <= 0.16 && (support === null || top > support)) support = top
    }
    return support
}

const findLandingSurface = (previousFeetY, nextFeetY) => {
    let landing = previousFeetY >= 0 && nextFeetY <= 0 ? 0 : null
    for (const block of fallingBlocks) {
        if (!blockSupportsVisitor(block)) continue
        const top = block.mesh.position.y + 0.5
        if (previousFeetY >= top - 0.025 && nextFeetY <= top && (landing === null || top > landing)) landing = top
    }
    return landing
}

const updateWalkControls = (deltaTime) => {
    camera.rotation.set(pitch, yaw, 0, 'YXZ')
    const navigationActive = isTouchDevice ? mobileControlsActive : document.pointerLockElement === canvas
    if (!navigationActive) return

    const forwardInput = isTouchDevice ? mobileForwardInput : Number(pressedKeys.has('KeyW') || pressedKeys.has('ArrowUp'))
        - Number(pressedKeys.has('KeyS') || pressedKeys.has('ArrowDown'))
    const sideInput = isTouchDevice ? mobileSideInput : Number(pressedKeys.has('KeyD') || pressedKeys.has('ArrowRight'))
        - Number(pressedKeys.has('KeyA') || pressedKeys.has('ArrowLeft'))
    if (!forwardInput && !sideInput) return

    forward.set(-Math.sin(yaw), 0, -Math.cos(yaw))
    right.set(Math.cos(yaw), 0, -Math.sin(yaw))
    movement.copy(forward).multiplyScalar(forwardInput).addScaledVector(right, sideInput).normalize()
    const movingFast = isTouchDevice ? mobileRunning : pressedKeys.has('ShiftLeft') || pressedKeys.has('ShiftRight')
    const currentWalkSpeed = movingFast ? fastWalkSpeed : walkSpeed
    movement.multiplyScalar(currentWalkSpeed * Math.min(deltaTime, 0.05))

    // Resolve axes separately: a blocked visitor stops in front of the wall,
    // while a diagonal movement can continue naturally along it.
    const visitorBeforeMove = camera.position.clone()
    const nextX = camera.position.x + movement.x
    if (!collidesAt(nextX, camera.position.z)) camera.position.x = nextX
    const nextZ = camera.position.z + movement.z
    if (!collidesAt(camera.position.x, nextZ)) camera.position.z = nextZ
    pushBlocksByVisitor(camera.position.clone().sub(visitorBeforeMove))
    if (visitorCollidesWithBlock(camera.position.x, camera.position.z)) {
        camera.position.x = visitorBeforeMove.x
        camera.position.z = visitorBeforeMove.z
    }
}

const updateVerticalMovement = (deltaTime) => {
    const navigationActive = isTouchDevice ? mobileControlsActive : document.pointerLockElement === canvas
    if (!navigationActive) return
    const step = Math.min(deltaTime, 0.035)
    const feetY = camera.position.y - eyeHeight

    if (playerGrounded) {
        const support = findSupportNear(feetY)
        if (support !== null) {
            camera.position.y = eyeHeight + support
            playerVerticalVelocity = 0
            return
        }
        playerGrounded = false
    }

    const previousFeetY = camera.position.y - eyeHeight
    playerVerticalVelocity -= 9.81 * step
    const nextFeetY = previousFeetY + playerVerticalVelocity * step
    if (playerVerticalVelocity <= 0) {
        const landing = findLandingSurface(previousFeetY, nextFeetY)
        if (landing !== null) {
            camera.position.y = eyeHeight + landing
            playerVerticalVelocity = 0
            playerGrounded = true
            return
        }
    }
    camera.position.y = eyeHeight + Math.max(nextFeetY, 0)
}

const updateBlockPhysics = (deltaTime, elapsedTime) => {
    const navigationActive = isTouchDevice ? mobileControlsActive : document.pointerLockElement === canvas
    const onTrigger = Math.abs(camera.position.x - blockTriggerPosition.x) <= 0.5
        && Math.abs(camera.position.z - blockTriggerPosition.z) <= 0.5
    if (navigationActive && onTrigger && !blockTriggerOccupied) startBlockRain()
    blockTriggerOccupied = navigationActive && onTrigger

    const triggerPulse = 1.25 + Math.sin(elapsedTime * 3.2) * 0.45
    blockTriggerMaterial.color.setHex(blockTriggerOccupied ? 0x274c42 : 0x4c2b78)
    blockTriggerMaterial.emissive.setHex(blockTriggerOccupied ? 0x45ffc3 : 0x8b54ff)
    blockTriggerMaterial.emissiveIntensity = blockTriggerOccupied ? 1.9 : triggerPulse

    const step = Math.min(deltaTime, 0.035)
    for (const block of fallingBlocks) {
        block.velocity.y -= 9.81 * step

        const nextX = block.mesh.position.x + block.velocity.x * step
        if (!collidesRadiusAt(nextX, block.mesh.position.z, 0.52)) block.mesh.position.x = nextX
        else block.velocity.x *= -0.2

        const nextZ = block.mesh.position.z + block.velocity.z * step
        if (!collidesRadiusAt(block.mesh.position.x, nextZ, 0.52)) block.mesh.position.z = nextZ
        else block.velocity.z *= -0.2

        block.mesh.position.y += block.velocity.y * step
        if (block.mesh.position.y <= 0.5) {
            block.mesh.position.y = 0.5
            if (Math.abs(block.velocity.y) > 0.55) block.velocity.y *= -0.16
            else block.velocity.y = 0
            const friction = Math.pow(0.055, step)
            block.velocity.x *= friction
            block.velocity.z *= friction
            block.settled = Math.abs(block.velocity.x) + Math.abs(block.velocity.z) < 0.025
            if (block.settled) {
                block.velocity.x = 0
                block.velocity.z = 0
            }
        }
    }

    // Prosta separacja klocków na podłodze zapobiega ich przenikaniu.
    for (let first = 0; first < fallingBlocks.length; first++) {
        const a = fallingBlocks[first]
        if (a.mesh.position.y > 0.62) continue
        for (let second = first + 1; second < fallingBlocks.length; second++) {
            const b = fallingBlocks[second]
            if (b.mesh.position.y > 0.62) continue
            const dx = b.mesh.position.x - a.mesh.position.x
            const dz = b.mesh.position.z - a.mesh.position.z
            const distance = Math.hypot(dx, dz)
            if (distance >= 1.02 || distance < 0.001) continue
            const overlap = (1.02 - distance) * 0.5
            const nx = dx / distance
            const nz = dz / distance
            const ax = a.mesh.position.x - nx * overlap
            const az = a.mesh.position.z - nz * overlap
            const bx = b.mesh.position.x + nx * overlap
            const bz = b.mesh.position.z + nz * overlap
            if (!collidesRadiusAt(ax, az, 0.52)) a.mesh.position.set(ax, a.mesh.position.y, az)
            if (!collidesRadiusAt(bx, bz, 0.52)) b.mesh.position.set(bx, b.mesh.position.y, bz)
        }
    }
}

const updateLightingEffects = (deltaTime, elapsedTime) => {
    const navigationActive = isTouchDevice ? mobileControlsActive : document.pointerLockElement === canvas
    const onPad = (pad) => Math.abs(camera.position.x - pad.position.x) <= 0.5
        && Math.abs(camera.position.z - pad.position.z) <= 0.5

    const onAlarmPad = onPad(alarmPad)
    if (navigationActive && onAlarmPad && !alarmPad.occupied) {
        lightingMode = lightingMode === 'alarm' ? 'normal' : 'alarm'
    }
    alarmPad.occupied = onAlarmPad

    const onDiscoPad = onPad(discoPad)
    if (navigationActive && onDiscoPad && !discoPad.occupied) {
        lightingMode = lightingMode === 'disco' ? 'normal' : 'disco'
    }
    discoPad.occupied = onDiscoPad

    const blend = 1 - Math.exp(-deltaTime * 4.5)
    const targetAmbient = lightingMode === 'normal' ? 2 : lightingMode === 'alarm' ? 0.045 : 0.2
    const targetHemisphere = lightingMode === 'normal' ? 2 : lightingMode === 'alarm' ? 0.035 : 0.28
    ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, targetAmbient, blend)
    hemisphereLight.intensity = THREE.MathUtils.lerp(hemisphereLight.intensity, targetHemisphere, blend)

    const alarmFlash = lightingMode === 'alarm'
        ? 5 + Math.pow(Math.max(0, Math.sin(elapsedTime * 7.5)), 5) * 34
        : 0
    alarmLights.forEach((light, index) => {
        const alternatingFlash = index % 2 === 0
            ? alarmFlash
            : 5 + Math.pow(Math.max(0, Math.sin(elapsedTime * 7.5 + Math.PI)), 5) * 34
        light.intensity = lightingMode === 'alarm' ? alternatingFlash : 0
    })

    if (audioContext) {
        ensureAlarmSiren()
        if (alarmSirenGain) {
            const sirenActive = lightingMode === 'alarm'
            const sirenWave = Math.sin(elapsedTime * Math.PI * 1.45) * 0.5 + 0.5
            alarmSirenLow.frequency.setTargetAtTime(480 + sirenWave * 430, audioContext.currentTime, 0.035)
            alarmSirenHigh.frequency.setTargetAtTime(710 + sirenWave * 610, audioContext.currentTime, 0.035)
            alarmSirenGain.gain.setTargetAtTime(sirenActive ? 0.042 : 0.0001, audioContext.currentTime, 0.09)
        }
    }

    discoLights.forEach((entry, index) => {
        const active = lightingMode === 'disco'
        const individualPulse = 0.58 + Math.pow(
            Math.max(0, Math.sin(elapsedTime * 6.4 + entry.phase * 1.7)),
            4
        ) * 0.42
        const softStrobe = 0.68 + Math.pow(Math.max(0, Math.sin(elapsedTime * 19.5)), 8) * 0.32
        entry.light.intensity = active ? 78 * individualPulse * softStrobe : 0
        if (active) {
            const sweep = elapsedTime * (0.92 + index * 0.045) + entry.phase
            entry.light.target.position.set(
                Math.sin(sweep * 1.31) * 13,
                0.35 + (Math.sin(sweep * 2.2) * 0.5 + 0.5) * 3.1,
                Math.cos(sweep * 1.07) * 13
            )
        }
    })

    const padPulse = 1.15 + Math.sin(elapsedTime * 3.4) * 0.35
    alarmPad.material.emissiveIntensity = lightingMode === 'alarm' ? 2.7 : padPulse
    discoPad.material.emissiveIntensity = lightingMode === 'disco' ? 2.7 : padPulse
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

const updateChildrenAmbience = () => {
    if (!audioContext || !childrenAmbienceGain) return
    const dx = camera.position.x - drawingMess.position.x
    const dz = camera.position.z - drawingMess.position.z
    const distance = Math.hypot(dx, dz)
    const proximity = 1 - THREE.MathUtils.clamp((distance - 1.2) / 9, 0, 1)
    const targetVolume = proximity * proximity * 0.075
    childrenAmbienceGain.gain.setTargetAtTime(
        Math.max(0.0001, targetVolume),
        audioContext.currentTime,
        0.32
    )
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
    const walking = isTouchDevice ? mobileControlsActive : document.pointerLockElement === canvas
    const closeEnough = camera.position.distanceTo(specterGroup.position) < 4.25
    const inFront = specterTagWorld.z > -1 && specterTagWorld.z < 1
    const onScreen = Math.abs(specterTagWorld.x) < 1.05 && Math.abs(specterTagWorld.y) < 1.05
    if (walking && closeEnough && inFront && onScreen) specterTagVisibleUntil = elapsedTime + 2.5
    const visible = walking && inFront && onScreen && (closeEnough || elapsedTime < specterTagVisibleUntil)
    specterTagFocused = visible && Math.abs(specterTagWorld.x) < 0.2 && Math.abs(specterTagWorld.y) < 0.2
    specterTag.classList.toggle('is-near', visible)
    specterTag.classList.toggle('is-gazed', specterTagFocused)
    specterTag.hidden = !visible
    if (isTouchDevice) mobileInteractButton.hidden = !visible
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
if (isTouchDevice) cssRenderer.domElement.classList.add('interactive')
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
        const visible = distance < 9 && facingCamera
        screen.object.visible = visible

        // YouTube ładuje się dopiero, gdy zwiedzający zbliży się do ekranu.
        if (visible && !screen.loaded) {
            screen.iframe.src = screen.iframe.dataset.src
            screen.loaded = true
        }

        if (screen.loaded && visible !== screen.playingNearby) {
            screen.iframe.contentWindow?.postMessage(JSON.stringify({
                event: 'command',
                func: visible ? 'playVideo' : 'pauseVideo',
                args: []
            }), '*')
            screen.playingNearby = visible
        }

        // Usuń nieaktywny odtwarzacz po odejściu od narożnika. Dzięki temu
        // YouTube nie widzi kilku automatycznie grających ramek jednocześnie.
        if (screen.loaded && distance > 10.5) {
            screen.iframe.src = 'about:blank'
            screen.loaded = false
            screen.playingNearby = false
        }
    }
}
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isTouchDevice ? 1.35 : 2))

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
    updateBlockPhysics(deltaTime, elapsedTime)
    updateVerticalMovement(deltaTime)
    updateLightingEffects(deltaTime, elapsedTime)
    updateChildrenAmbience()
    updateDust(deltaTime, elapsedTime)
    updateSpecter(elapsedTime)
    updateMagicCrayons(elapsedTime)
    updateVideoScreens(elapsedTime)

    // Render
    renderer.render(scene, camera)
    cssRenderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
