import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js';
import earthTextureSrc from './textures/earth_texture4.jpg';
import civilization_1000BC from './textures/civilization_1000BC.jpg';
import civilization_500BC from './textures/civilization_500BC.jpg';
// Import other images similarly...

const civilizationMaps = {
    '-1000': civilization_1000BC,
    '-500': civilization_500BC,
    // Add other mappings...
};

let scene, camera, renderer, controls, raycaster, globe, textureCanvas, context;

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-10, -10, -10);
    scene.add(pointLight);

    textureCanvas = document.createElement('canvas');
    textureCanvas.width = 2048;
    textureCanvas.height = 1024;
    context = textureCanvas.getContext('2d');
    drawInitialTexture();

    const texture = new THREE.CanvasTexture(textureCanvas);

    const geometry = new THREE.SphereGeometry(3, 50, 50);
    const material = new THREE.MeshStandardMaterial({ map: texture });
    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

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

    raycaster = new THREE.Raycaster();

    renderer.domElement.addEventListener('click', onClick, false);

    animate();
}

function drawInitialTexture() {
    const baseMap = new Image();
    baseMap.src = earthTextureSrc;
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
    context.fillStyle = 'rgba(255, 0, 0, 0.5)';
    context.fillRect(100, 100, 200, 100);
    globe.material.map.needsUpdate = true;
}

function drawTextureForYear(selectedYear) {
    const yearKey = selectedYear.toString();

    if (civilizationMaps[yearKey]) {
        const civilizationMapSrc = civilizationMaps[yearKey];
        const civilizationMap = new Image();
        civilizationMap.src = civilizationMapSrc;
        console.log('Attempting to load image for year:', civilizationMap.src);

        civilizationMap.onload = () => {
            console.log('Image loaded successfully for year:', selectedYear);
            context.drawImage(civilizationMap, 0, 0, textureCanvas.width, textureCanvas.height);
            globe.material.map.needsUpdate = true;
        };

        civilizationMap.onerror = (error) => {
            console.error('Error loading civilization map for year:', error);
        };
    } else {
        console.error('No map available for year:', selectedYear);
    }
}

function onClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        if (selectedObject === globe) {
            console.log('Globe clicked!');
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

init();

const timeline = document.getElementById('timeline');
const yearInput = document.getElementById('yearInput');
const yearLabel = document.getElementById('yearLabel');

timeline.addEventListener('input', (event) => {
    const selectedYear = event.target.value;
    yearInput.value = selectedYear;
    yearLabel.innerText = selectedYear;
    drawTextureForYear(selectedYear);
});

yearInput.addEventListener('change', (event) => {
    const selectedYear = event.target.value;
    timeline.value = selectedYear;
    yearLabel.innerText = selectedYear;
    drawTextureForYear(selectedYear);
});
