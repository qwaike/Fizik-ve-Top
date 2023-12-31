import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import CANNON from 'cannon'


/**
 * Debug
 */
const gui = new dat.GUI() 
const debugObject = {}
debugObject.createSphere = () => {

    createSphere(Math.random()*3,
    {
        x:(Math.random()-0.5)*2,
        y:(Math.random())*10,
        z:(Math.random()-0.5)*2,
    })
}
debugObject.createBox = () => {

    createBoxes(
    Math.random(), //w
    Math.random(), //h
    Math.random(), // depth
    {
        x:(Math.random()-0.5)*2,
        y:(Math.random())*10,
        z:(Math.random()-0.5)*2,
    })
}
debugObject.create10Box = () => {

    for (let index = 0; index < 1000; index++) {
        createBoxes(
            Math.random(), //w
            Math.random(), //h
            Math.random(), // depth
            {
                x:(Math.random()-0.5)*2,
                y:(Math.random())*10,
                z:(Math.random()-0.5)*2,
            })
        
    }
}

gui.add(debugObject, 'createSphere').name('küre bas')
gui.add(debugObject, 'createBox').name('küp bas')
gui.add(debugObject, 'create10Box').name('1000 küp bas')

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])


const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true;
world.gravity.set(0,-9.82,0)

// tek materyal kullanarak sadeleştirebiliyoruz 
// const concreteMaterial = new CANNON.Material('concrete')
// const plasticMaterial = new CANNON.Material('plastic')

const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution:.7
    }
)
world.addContactMaterial(defaultContactMaterial)

//böyle yaparak bodylerin tek tek materyali ile uğraşmıyoruz. tüm dünya tek fizik materialinden oluşmuş oluyor. 
world.defaultContactMaterial = defaultContactMaterial

const sphereShape = new CANNON.Sphere(0.5);
const sphereBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0,3,3),
    shape: sphereShape,
})

world.addBody(sphereBody)


const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0
// floorBody.material = defaultMaterial    
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1,0,0),
    Math.PI/2)
world.addBody(floorBody)

// setTimeout(() => {
//     sphereBody.applyForce(new CANNON.Vec3(0,750,0), new CANNON.Vec3(0,0,0));
//     console.log('done');
// }, 3000);


// window.addEventListener('keypress', (key) => {
//     if(key.key === 'w') {
//         sphereBody.applyForce(new CANNON.Vec3(0,0,-250), new CANNON.Vec3(0))
//     }
//     if(key.key==='a'){
//         sphereBody.applyForce(new CANNON.Vec3(-250,0,0), new CANNON.Vec3(0))
//     }
//     if(key.key==='s'){
//         sphereBody.applyForce(new CANNON.Vec3(0,0,250), new CANNON.Vec3(0))
//     }
//     if(key.key==='d'){
//         sphereBody.applyForce(new CANNON.Vec3(250,0,0), new CANNON.Vec3(0))
//     }
//     if(key.key===' '){
//         sphereBody.applyForce(new CANNON.Vec3(0,50,0), new CANNON.Vec3(0))
//     }
//     console.log(key.key);
// })


// /**
//  * Test sphere
//  */
// const sphere = new THREE.Mesh(
//     new THREE.SphereBufferGeometry(0.5, 32, 32),
//     new THREE.MeshStandardMaterial({
//         metalness: 0.3,
//         roughness: 0.4,
//         envMap: environmentMapTexture
//     })
// )
// sphere.castShadow = true
// sphere.position.y = 0.5
// scene.add(sphere)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(30, 30),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

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
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


const objectsToUpdate = []
const boxesToUpdate = []

const sphereGeometry = new THREE.SphereBufferGeometry(1, 20,20);
const sphereMaterial = new THREE.MeshStandardMaterial({
            metalness:0.3,
            roughness:0.4,
            envMap: environmentMapTexture
        });

const createSphere = (radius, position) => {
    
    const mesh = new THREE.Mesh(sphereGeometry,sphereMaterial)
    mesh.scale.set(radius,radius,radius);
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh)

    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
        mass:1,
        position: new CANNON.Vec3(0,3,0),
        shape:shape,
        material:defaultMaterial
    })
    body.position.copy(position)
    world.addBody(body)

    objectsToUpdate.push({
        mesh,
        body
    })

}
createSphere(0.5, {x: 0, y:10, z:4})



const boxGeometry = new THREE.BoxBufferGeometry(1,1,1);
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness:0.75,
    roughness:0.2,
    wireframe:false,
    envMap: environmentMapTexture
})

//box 
const createBoxes = (width, height, depth, position) => {
    // console.log ('küp basıldı');
    
     
    const mesh = new THREE.Mesh(
        boxGeometry, boxMaterial
    )
    mesh.position.set(position);
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.scale.set(width, height, depth)
    scene.add(mesh);

    //sonra cannon fiziği - önce shape sonra body 
    const boxShape = new CANNON.Box (new CANNON.Vec3(width / 2, height/2, depth/2))
    const body = new CANNON.Body({
        shape: boxShape,
        mass:1, 
        material:defaultMaterial,
        position: new CANNON.Vec3(3,10,3)
    })
    body.position.copy(position)
    world.addBody(body)

    boxesToUpdate.push({
        mesh,body,boxShape
    })
}
// createBoxes(3,3,3)


console.log(objectsToUpdate);
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
    
    // sphereBody.applyForce(new CANNON.Vec3(-0.4, 0,0), new CANNON.Vec3(0))


    world.step(1/60, deltaTime,3)

    for(const object of objectsToUpdate){
        object.mesh.position.copy(object.body.position)
        // object.mesh.rotation.copy(object.body.rotation)

    }

    //burada fizik dünyadak pozisyonu meshimize kopyalıyoruz böylece meshimiz fizik kurallarına uygun hareket etmiş oluyor. 
    //diğer yandan dönebilmesi için de dönüş verisinin de kopyalanması gerektiğinden onu da quaterniondan almış oluyoruz
    //henüz yapmadık ama muhtemelen scale etmemiz gerekse onu da fizik dünyadan alacağımız aşikar 
    for (const box of boxesToUpdate){
        box.mesh.position.copy(box.body.position)
        box.mesh.quaternion.copy(box.body.quaternion)

        // box.mesh.rotation.copy(box.body.rotation)

    }
    // for(const box of boxesToUpdate){
    //     box.mesh.position.copy(box.body.position)
    // }


    // sphere.position.copy(sphereBody.position)
    // console.log(sphereBody.velocity)
    // console.log(sphere.position.y);


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()