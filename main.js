import * as THREE from 'three';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Create a transparent background
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Enable antialiasing and alpha for transparency
renderer.setSize(window.innerWidth, window.innerHeight);

// Set the clear color to transparent
renderer.setClearColor(0x000000, 0); // Set the background to fully transparent

document.body.appendChild(renderer.domElement);

// Initial camera position
camera.position.set(0, 0, 7);

// Create a GLTFLoader instance and load your model
const loader = new GLTFLoader();

let model;
let mixer; // Animation mixer
let isMouseDown = false;
let previousMouseX = 0;
let previousMouseY = 0;

// Create a group to hold the loaded model
const modelGroup = new THREE.Group();

loader.load('./disco_hoops/scene.gltf', (gltf) => {
  model = gltf.scene;

  // You can manipulate the model's position, scale, rotation, etc. here

  // Create a texture loader
  const textureLoader = new THREE.TextureLoader();

  // Load the texture image
  textureLoader.load('./disco_hoops/textures/material_1_baseColor.png', (texture) => {
    // Create a material using the loaded texture
    const material = new THREE.MeshStandardMaterial({ map: texture }); // Use StandardMaterial for PBR

    // Apply the material to the model
    model.traverse((child) => {
      if (child.isMesh) {
        child.material = material;
      }
    });

    // Add the model to the group
    modelGroup.add(model);

    // Add the group to the scene
    scene.add(modelGroup);

    // Extract animations from the loaded model
    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });
  });
}, undefined, (error) => {
  console.error(error);
});

// Add lights for improved quality
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Add event listeners for mouse control
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

const onMouseDown = (event) => {
  isMouseDown = true;
  previousMouseX = event.clientX;
  previousMouseY = event.clientY;
};

const onMouseUp = () => {
  isMouseDown = false;
};

const onMouseMove = (event) => {
  if (isMouseDown) {
    const deltaX = event.clientX - previousMouseX;
    const deltaY = event.clientY - previousMouseY;

    // Adjust rotation based on mouse movement
    modelGroup.rotation.x += deltaY * 0.005;
    modelGroup.rotation.y += deltaX * 0.005;

    previousMouseX = event.clientX;
    previousMouseY = event.clientY;
  }
};

// Mousewheel event for zooming
const onMouseWheel = (event) => {
  const zoomSpeed = 0.1; // Adjust this value for zoom speed

  // Increase or decrease the camera's position along the z-axis for zooming
  camera.position.z -= event.deltaY * zoomSpeed;

  // Make sure the camera doesn't zoom too close or too far
  if (camera.position.z < 1) camera.position.z = 1;
  if (camera.position.z > 20) camera.position.z = 20;
};

const animate = () => {
  requestAnimationFrame(animate);

  // Update the animation mixer
  if (mixer) {
    mixer.update(0.01); // You can adjust the time delta here
  }

  // Update the raycaster and perform mouse picking
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(modelGroup.children, true);

  if (intersects.length > 0) {
    // Handle object interaction if needed
  }

  renderer.render(scene, camera);
};

window.addEventListener('mousedown', onMouseDown, false);
window.addEventListener('mouseup', onMouseUp, false);
window.addEventListener('mousemove', onMouseMove, false);

// Add mousewheel event listener for zooming
window.addEventListener('wheel', onMouseWheel, false);

animate();
