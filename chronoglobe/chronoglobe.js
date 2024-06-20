import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js';
import earthTextureSrc from './textures/earth_texture4.jpg';


let scene, camera, renderer, controls, raycaster, globe, textureCanvas, context;

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Point light
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-10, -10, -10);
    scene.add(pointLight);

    // Create a canvas for dynamic texture
    textureCanvas = document.createElement('canvas');
    textureCanvas.width = 2048;
    textureCanvas.height = 1024;
    context = textureCanvas.getContext('2d');
    drawInitialTexture();

    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(textureCanvas);

    // Globe
    const geometry = new THREE.SphereGeometry(3, 50, 50);
    const material = new THREE.MeshStandardMaterial({ map: texture });
    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Initialize OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.rotateSpeed = 0.35;
    controls.enablePan = false;
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE
    };

    // Initialize Raycaster
    raycaster = new THREE.Raycaster();

    // Add event listener for click events
    renderer.domElement.addEventListener('click', onClick, false);

    // Start animation loop
    animate();
}

function drawInitialTexture() {
    // Draw the initial map texture on the canvas
    const baseMap = new Image();
    baseMap.src = earthTextureSrc; // Set the path to your base map image
    console.log('Attempting to load image:', baseMap.src);
    baseMap.onload = () => {
        console.log('Image loaded successfully');
        context.drawImage(baseMap, 0, 0, textureCanvas.width, textureCanvas.height);
        updateTexture();
    };
    baseMap.onerror = (error) => {
        console.error('Error loading base map:', error);
    };
}

function updateTexture() {
    // Update the canvas texture (e.g., draw new civilization boundaries)
    // Example: Drawing a simple rectangle for demonstration
    context.fillStyle = 'rgba(255, 0, 0, 0.5)';
    context.fillRect(100, 100, 200, 100);
    globe.material.map.needsUpdate = true;
}

// Handle click events
function onClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        if (selectedObject === globe) {
            // Handle click on the globe (e.g., show information about the civilization)
            console.log('Globe clicked!');
        }
    }
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
