import * as THREE from 'three';
import { OrbitControls } from './OrbitControls.js';
import earthTextureSrc from './textures/earth_texture4.jpg';
import civilization_359BC from './textures/civilization_359BC.png';
import civilization_338BC from './textures/civilization_338BC.png';
import civilization_335BC from './textures/civilization_335BC.png';
import civilization_333BC from './textures/civilization_333BC.png';
import civilization_331BC from './textures/civilization_331BC.png';
import civilization_330BC from './textures/civilization_330BC.png';
import civilization_327BC from './textures/civilization_327BC.png';
import civilization_325BC from './textures/civilization_325BC.png';
import civilization_323BC from './textures/civilization_323BC.png';

const civilizationMaps = {
    '-359': civilization_359BC,
    '-338': civilization_338BC,
    '-335': civilization_335BC,
    '-333': civilization_333BC,
    '-331': civilization_331BC,
    '-330': civilization_330BC,
    '-327': civilization_327BC,
    '-325': civilization_325BC,
    '-323': civilization_323BC,                                                                      
};

const markerData = {
    '115': [
        { position: { lat: 41.5, lon: 12.9 }, title: 'Marker 1', text: 'Marker 1 in 115 AD' },
        { position: { lat: 35.5, lon: 20.9 }, title: 'Marker 2', text: 'Marker 2 in 115 AD' },
    ],
    '2024': [
        { position: { lat: 34.0522, lon: -118.2437 }, title: 'Marker 2024', text: 'Marker in 2024 AD' },
    ],
    '-359': [ 
        { position: { lat: 40.76, lon: 22.53 }, title: 'Capital City', text: 'The Capital City of Macedon' }
    ]
};


const textureCache = {};
const downscaleFactor = 4; // Downscale factor for civilization textures

let scene, camera, renderer, controls, raycaster, globe, textureCanvas, context;
let markers = [];

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2; // Adjust gamma factor if necessary
    document.body.appendChild(renderer.domElement);


    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-10, -10, -10);
    scene.add(pointLight);

    textureCanvas = document.createElement('canvas');
    textureCanvas.width = 7680;
    textureCanvas.height = 3840;
    context = textureCanvas.getContext('2d');

    preloadTextures().then(() => {
        drawInitialTexture(() => {
            initGlobe();
            animate();
        });
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
                const tempCanvas = document.createElement('canvas');
                const tempContext = tempCanvas.getContext('2d');
                tempCanvas.width = img.width / downscaleFactor;
                tempCanvas.height = img.height / downscaleFactor;
                tempContext.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

                // Apply image processing (e.g., saturation, contrast) here
                applyImageProcessing(tempContext, tempCanvas.width, tempCanvas.height);

                const downscaledImg = new Image();
                downscaledImg.src = tempCanvas.toDataURL();
                downscaledImg.onload = () => {
                    textureCache[yearKey] = downscaledImg;
                    resolve();
                };
                downscaledImg.onerror = reject;
            };
            img.onerror = reject;
        });
    });

    return Promise.all(promises);
}

function applyImageProcessing(context, width, height) {
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;

    const contrast = 1.0; // Example contrast adjustment factor
    const saturation = 1.0; // Example saturation adjustment factor

    for (let i = 0; i < data.length; i += 4) {
        // Apply contrast
        for (let j = 0; j < 3; j++) {
            data[i + j] = (data[i + j] - 128) * contrast + 128;
        }

        // Apply saturation
        const grayscale = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
        data[i] = grayscale + saturation * (data[i] - grayscale);
        data[i + 1] = grayscale + saturation * (data[i + 1] - grayscale);
        data[i + 2] = grayscale + saturation * (data[i + 2] - grayscale);
    }

    context.putImageData(imageData, 0, 0);
}


function drawInitialTexture(callback) {
    const baseMap = new Image();
    baseMap.src = earthTextureSrc;
    console.log('Attempting to load image:', baseMap.src);

    baseMap.onload = () => {
        console.log('Base map loaded successfully');
        context.clearRect(0, 0, textureCanvas.width, textureCanvas.height);
        context.drawImage(baseMap, 0, 0, textureCanvas.width, textureCanvas.height);
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
            // Draw processed civilization map
            context.drawImage(civilizationMap, 0, 0, textureCanvas.width, textureCanvas.height);
            globe.material.map.needsUpdate = true;
            drawMarkersForYear(yearKey);
        });
    } else {
        console.error('No map available for year:', selectedYear);
        drawMarkersForYear(yearKey);
    }
}


function drawMarkersForYear(yearKey) {
    markers.forEach(marker => scene.remove(marker));
    markers = [];

    if (markerData[yearKey]) {
        markerData[yearKey].forEach(data => {
            const marker = createMarker(data.position, data.title, data.text); // Pass position, title, and text
            scene.add(marker);
            markers.push(marker);
        });
    }
}



function createMarker(position, title, text) {
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
    markerGroup.userData = { title, text };

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

    // Choose the material you want to use
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.5,
        metalness: 0.1,
    });

    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
}

function createInfoWindow(title, text) {
    // Remove existing info window
    const existingWindow = document.querySelector('.info-window');
    if (existingWindow) {
        existingWindow.remove();
    }

    // Create new info window
    const infoWindow = document.createElement('div');
    infoWindow.className = 'info-window';
    infoWindow.innerHTML = `
        <h2>${title}</h2>
        <p>${text}</p>
        <span class="close-btn">X</span>
    `;

    document.body.appendChild(infoWindow);

    // Close button functionality
    infoWindow.querySelector('.close-btn').addEventListener('click', function() {
        infoWindow.remove();
    });
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
                const markerTitle = marker.object.parent.userData.title;
                createInfoWindow(markerTitle, markerText);
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
