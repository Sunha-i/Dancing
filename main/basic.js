import * as THREE from '../build/three.module.js';
import { OrbitControls } from "../examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "../examples/jsm/loaders/GLTFLoader.js"

class App {
    constructor() {
        const divContainer = document.querySelector("#webgl-container");
        this._divContainer = divContainer;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        divContainer.appendChild(renderer.domElement);

        this._renderer = renderer;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);
        this._scene = scene;

        this._setupCamera();
        this._setupLight();
        this._setupModel();
        this._setupControls();

        window.onresize = this.resize.bind(this);
        this.resize();

        requestAnimationFrame(this.render.bind(this));
    }

    _setupControls() {
        new OrbitControls(this._camera, this._divContainer);
    }

    changeAnimation(animationName) {
        const previousAnimationAction = this._currentAnimationAction;
        this._currentAnimationAction = this._animationsMap[animationName];

        if (previousAnimationAction !== this._currentAnimationAction) {
            previousAnimationAction.fadeOut(0.5);
            this._currentAnimationAction.reset().fadeIn(0.5).play();
        }
    }

    _setupAnimations(gltf) {
        const model = gltf.scene;
        const mixer = new THREE.AnimationMixer(model);
        const gltfAnimations = gltf.animations;
        const domControls = document.querySelector("#controls");
        const animationsMap = {};

        gltfAnimations.forEach(animationClip => {
            const name = animationClip.name;

            const domButton = document.createElement("div");
            domButton.classList.add("button");
            domButton.innerText = name;
            domControls.appendChild(domButton);

            domButton.addEventListener("click", () => {
                const animationName = domButton.innerHTML;
                this.changeAnimation(animationName);
            });

            const animationAction = mixer.clipAction(animationClip);
            animationsMap[name] = animationAction;
        });

        this._mixer = mixer;
        this._animationsMap = animationsMap;
        this._currentAnimationAction = this._animationsMap["HipHopDancing"];
        this._currentAnimationAction.play();
    }

    _setupModel() {
        new GLTFLoader().load("./data/model.glb", (gltf) => {
            const model = gltf.scene;
            this._scene.add(model);

            this._setupAnimations(gltf);

            // hide mesh
            model.traverse((node) => {
                if (node.isMesh) {
                    node.visible = false;
                }
            });
            
            // Dacing Joint
            const skeletonHelper = new THREE.CustomCurveSkeleton(model);
            skeletonHelper.visible = true;
            this._scene.add(skeletonHelper);

            // T-pose mesh
            const boneList = this._getBoneList(model);
            this._visualizeBones(boneList, 0x000000, 0.2);

            // Extract 5 points
            const boneList2 = this._getBoneList2(model);
            this._visualizeBones(boneList2, 0xff0000, 0.5);
            
        });
    }

    _getBoneList(object) {
        const boneList = [];
        
        object.traverse((node) => {
            if (node.isBone) {
                boneList.push(node);
            }
        });
        return boneList;
    }    

    _getBoneList2(object) {
        const boneList = [];
        
        object.traverse((node) => {
            if (node.isBone) {
                if (node.name.includes('Foot') || node.name.includes('UpLeg') || node.name.includes('Hips')) {

                    boneList.push(node);
                }
            }
        });
        return boneList;
    }   

    _visualizeBones(bones, vtxcolor, vtxopacity) {
        const boneGeometry = new THREE.SphereGeometry(1.5, 16, 16);
        const boneMaterial = new THREE.MeshBasicMaterial({ color: vtxcolor, transparent: true, opacity: vtxopacity });

        bones.forEach((bone) => {
            const boneMesh = new THREE.Mesh(boneGeometry.clone(), boneMaterial.clone());
            boneMesh.position.copy(bone.getWorldPosition(new THREE.Vector3()));
            // console.log(boneMesh.position);
            this._scene.add(boneMesh);
        });
    }

    _setupCamera() {
        const camera = new THREE.PerspectiveCamera(
            60, 
            window.innerWidth / window.innerHeight, 
            100, 
            1000
        );

        camera.position.set(0, 0, 300);
        this._camera = camera;
    }

    _setupLight() {
        const color = 0xffffff;
        const intensity = 5;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(0, 0, 1);
        this._scene.add(light);
    }

    update(time) {
        time *= 0.001; // second unit

        if (this._mixer) {
            const deltaTime = time - this._previousTime;
            this._mixer.update(deltaTime);
        }

        this._previousTime = time;
    }

    render(time) {
        this._renderer.render(this._scene, this._camera);   
        this.update(time);

        requestAnimationFrame(this.render.bind(this));
    }

    resize() {
        const width = this._divContainer.clientWidth;
        const height = this._divContainer.clientHeight;

        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();
        
        this._renderer.setSize(width, height);
    }
}

window.onload = function () {
    new App();
}