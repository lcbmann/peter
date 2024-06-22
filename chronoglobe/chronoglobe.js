import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js';
import earthTextureSrc from './textures/earth_texture4.jpg';
import civilization_115AD from './textures/civilization_115AD.png';
import civilization_100AD from './textures/civilization_100AD.png';
import civilization_105AD from './textures/civilization_105AD.png';
import civilization_110AD from './textures/civilization_110AD.png';
import civilization_2024AD from './textures/usa_texture_test.png';

const civilizationMaps = {
    '115': civilization_115AD,
    '2024': civilization_2024AD,
    '100': civilization_100AD,
    '105': civilization_105AD,
    '110': civilization_110AD,
};

const markerData = {
    '115': [
        { position: { lat: 41.5, lon: 12.9 }, text: 'Marker 1 in 115 AD' },
        { position: { lat: 35.5, lon: 20.9 }, text: 'Marker 2 in 115 AD' },
    ],
    '2024': [
        { position: { lat: 34.0522, lon: -118.2437 }, text: 'Marker in 2024 AD' },
    ],
};

const textureCache = {};

let scene, camera, renderer, controls, raycaster, globe, textureCanvas, context;
let markers = [];

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;

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

    preloadTextures().then(() => {
        drawInitialTexture();
        initGlobe();
        animate();
    });

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
}

function preloadTextures() {
    const promises = Object.keys(civilizationMaps).map(yearKey => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = civilizationMaps[yearKey];
            img.onload = () => {
                textureCache[yearKey] = img;
                resolve();
            };
            img.onerror = reject;
        });
    });

    return Promise.all(promises);
}

function drawInitialTexture(callback) {
    const baseMap = new Image();
    baseMap.src = earthTextureSrc;
    console.log('Attempting to load image:', baseMap.src);

    baseMap.onload = () => {
        console.log('Image loaded successfully');
        context.clearRect(0, 0, textureCanvas.width, textureCanvas.height);
        context.drawImage(baseMap, 0, 0, textureCanvas.width, textureCanvas.height);
        globe.material.map.needsUpdate = true;
        if (callback) callback();
    };

    baseMap.onerror = (error) => {
        console.error('Error loading base map:', error);
        if (callback) callback(error);
    };
}

function drawTextureForYear(selectedYear) {
    const yearKey = selectedYear.toString();

    if (textureCache[yearKey]) {
        const civilizationMap = textureCache[yearKey];
        console.log('Using cached image for year:', yearKey);
        context.clearRect(0, 0, textureCanvas.width, textureCanvas.height);
        drawInitialTexture(() => {
            context.drawImage(civilizationMap, 0, 0, textureCanvas.width, textureCanvas.height);
            globe.material.map.needsUpdate = true;
            drawMarkersForYear(yearKey);
        });
    } else {
        console.error('No map available for year:', selectedYear);
        drawInitialTexture(() => drawMarkersForYear(yearKey));
    }
}

function drawMarkersForYear(yearKey) {
    markers.forEach(marker => scene.remove(marker));
    markers = [];

    if (markerData[yearKey]) {
        markerData[yearKey].forEach(data => {
            const marker = createMarker(data.position, data.text);
            scene.add(marker);
            markers.push(marker);
        });
    }
}

function createMarker(position, text) {
    const markerGroup = new THREE.Group();

    // Create the main body of the exclamation point
    const cylinderGeometry = new THREE.CylinderGeometry(0.03, 0.01, 0.2, 32);
    const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.8 });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.y = 0.20;

    // Create the dot of the exclamation point
    const sphereGeometry = new THREE.SphereGeometry(0.02, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.8 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.y = 0.05;

    // Add both parts to the marker group
    markerGroup.add(cylinder);
    markerGroup.add(sphere);

    // Add a point light to illuminate the area around the marker
    const pointLight = new THREE.PointLight(0xff0000, 1, 5);
    markerGroup.add(pointLight);

    markerGroup.position.copy(latLonToVector3(position.lat, position.lon, 3));
    markerGroup.userData = { text };

    return markerGroup;
}


function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    const x = -((radius) * Math.sin(phi) * Math.cos(theta));
    const z = ((radius) * Math.sin(phi) * Math.sin(theta));
    const y = ((radius) * Math.cos(phi));
    
    return new THREE.Vector3(x, y, z);
}

function initGlobe() {
    const texture = new THREE.CanvasTexture(textureCanvas);
    const geometry = new THREE.SphereGeometry(3, 50, 50);
    const material = new THREE.MeshStandardMaterial({ map: texture });
    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
}

function onClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        if (selectedObject === globe) {
            console.log('Globe clicked!');
        } else {
            const marker = intersects.find(intersect => markers.includes(intersect.object.parent));
            if (marker) {
                const markerText = marker.object.parent.userData.text;
                alert(markerText);
            }
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

function updateYearLabel(selectedYear) {
    const year = parseInt(selectedYear, 10);
    if (year < 0) {
        yearLabel.innerText = `${Math.abs(year)} BC`;
    } else {
        yearLabel.innerText = `${year} AD`;
    }
}

timeline.addEventListener('input', (event) => {
    const selectedYear = event.target.value;
    yearInput.value = selectedYear;
    updateYearLabel(selectedYear);
    drawTextureForYear(selectedYear);
});

yearInput.addEventListener('change', (event) => {
    const selectedYear = event.target.value;
    timeline.value = selectedYear;
    updateYearLabel(selectedYear);
    drawTextureForYear(selectedYear);
});
