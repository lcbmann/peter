// Import necessary modules from Three.js
import * as THREE from 'three';
// Rest of the OrbitControls.js code...
import { OrbitControls } from './OrbitControls.js'; // Adjust the path as per your folder structure

import earthTexture from './textures/earth_texture.jpg';



// Define variables
let scene, camera, renderer, controls;

// Initialize function
function init() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Handle window resizing
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Create a globe
    const geometry = new THREE.SphereGeometry(3, 50, 50);
    const texture = new THREE.TextureLoader().load(earthTexture);
    const material = new THREE.MeshPhongMaterial({ map: texture });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Initialize OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.rotateSpeed = 0.35;

    // Handle click events
    renderer.domElement.addEventListener('click', (event) => {
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            const selectedObject = intersects[0].object;
            // Handle click on the selected object (e.g., show information)
        }
    });

    // Start animation loop
    animate();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update controls
    controls.update();

    // Render scene
    renderer.render(scene, camera);
}

// Call init function to set up the scene
init();
