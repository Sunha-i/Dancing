import * as THREE from '../build/three.module.js';

// 씬을 생성합니다.
const scene = new THREE.Scene();

// 큐브를 생성합니다.
const cubeGeometry = new THREE.BoxGeometry();
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

// 큐브의 크기(scale)에 대한 키 프레임 트랙을 생성합니다.
const scaleKeyframes = [
    new THREE.VectorKeyframeTrack('.scale', [0, 1, 2], [1, 1, 1, 2, 2, 2, 1, 1, 1]),
];

// 애니메이션 클립을 생성합니다.
const scaleAnimationClip = new THREE.AnimationClip('scaleAnimation', undefined, scaleKeyframes);

// 큐브에 애니메이션 클립을 적용합니다.
const mixer = new THREE.AnimationMixer(cube);
const scaleAnimationAction = mixer.clipAction(scaleAnimationClip);
scaleAnimationAction.play();

// 렌더러를 생성합니다.
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 카메라를 생성합니다.
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// 애니메이션 루프를 설정합니다.
function animate() {
    requestAnimationFrame(animate);

    // 믹서를 업데이트합니다.
    mixer.update(0.01); // deltaTime 대신 고정된 값 사용

    renderer.render(scene, camera);
}

animate();
