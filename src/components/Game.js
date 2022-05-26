import * as BABYLON from "babylonjs";
import { GUI } from "babylonjs-gui";
import Omnitone from "../omnitone.min.esm";

import * as THREE from "three";
import "babylonjs-loaders";
// import Omnitone from "../build/omnitone.min.esm";
import img from "./../assets/textures/amiga.jpg";
import dirt from "./../assets/textures/dirt.jpg";
//import wav from "./../assets/road_break_feedback000.mp3";
import THREEDwav from "./../assets/3DWAV.wav";
import vertShader from "./../shaders/shader.vert";
import fragShader from "./../shaders/shader.frag";
// console.log(dirt);

export default class Game {
  constructor(canvasId) {
    // this.advancedTexture =
    //   BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI");
    this.x = 0;
    this.y = 0;
    this.spheres = [];
    this.numSpheres = 3;
    this.lastMatrixUpdate = 0;
    this.updateAngles = (xAngle, yAngle, zAngle, camera) => {
      let deg2rad = Math.PI / 180;
      let euler = new THREE.Euler(
        xAngle * deg2rad,
        yAngle * deg2rad,
        zAngle * deg2rad,
        "YXZ"
      );
      let matrix = new THREE.Matrix4().makeRotationFromEuler(euler);
      // camera.setRotationFromMatrix(matrix);
      console.log(camera);
      // console.log(this.camera);

      // if (!audioReady) return;
      console.log(camera.getWorldMatrix().invert());
      // if (Date.now() - lastMatrixUpdate > 100) {
      this.FOH.setRotationMatrix3(camera._camMatrix);
      // }
    };
    // this.updateAngles = (xAngle, yAngle, zAngle, camera) => {
    //   let deg2rad = Math.PI / 180;
    //   let euler = new THREE.Euler(
    //     xAngle * deg2rad,
    //     yAngle * deg2rad,
    //     zAngle * deg2rad,
    //     "YXZ"
    //   );
    //   // console.log(euler);
    //   let matrix = new THREE.Matrix4().makeRotationFromEuler(euler);
    //   // console.log(matrix);

    //   // // if (Date.now() - this.lastMatrixUpdate > 100) {
    //   this.FOH.setRotationMatrix4(this.camera);
    //   // }
    // };
    this.canvas = document.getElementById(canvasId);
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.scene = new BABYLON.Scene(this.engine);
    // this.scene.useRightHandedSystem = true;
    this.camera = new BABYLON.FreeCamera(
      "camera1",
      new BABYLON.Vector3(0, 5, -10),
      this.scene
    );
    this.time = 0;
    this.audioCtx = new AudioContext();
    this.FOH = Omnitone.createFOARenderer(this.audioCtx, {
      // The example audio is in the FuMa ordering (W,X,Y,Z). So remap the
      // channels to the ACN format.
      channelMap: [0, 3, 1, 2],
    });
    console.log(this.FOH);
    this.ROH = Omnitone.createFOARotator(this.audioCtx);
    // console.log(this.ROH);
    //this.mainTexture = new BABYLON.Texture(img, this.scene);
    this.mainTexture = new THREE.TextureLoader().load(dirt);
    //this.mainTexture2 = new BABYLON.Texture(img, this.scene);
  }

  createScene() {
    // console.log(this.FOH);
    this.FOH.initialize();

    let audioElement = document.createElement("audio");

    audioElement.src = THREEDwav;

    // console.log(audioElement);
    // console.log(wav);
    const audioElementSource =
      this.audioCtx.createMediaElementSource(audioElement);

    audioElementSource.connect(this.FOH.input);
    this.FOH.output.connect(this.audioCtx.destination);

    let someButton = document.getElementById("somebutton");

    someButton.addEventListener("click", () => {
      this.audioCtx.resume();
      audioElement.play();
    });

    this.camera.setTarget(BABYLON.Vector3.Zero());
    this.camera.attachControl(this.canvas, false);

    // this.camera.cameraRotation.y = Math.PI / 2;
    // console.log(this.scene);
    // console.log(Omnitone);
    // console.log(this.FOH);
    // this.FOH.setListenerFromMatrix(this.camera);

    this.light = new BABYLON.HemisphericLight(
      "light1",
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    const shaderMaterial = new BABYLON.ShaderMaterial(
      "shader",
      this.scene,
      {
        vertex: "custom",
        fragment: "custom",
      },
      {
        attributes: ["position", "normal", "uv"],
        uniforms: [
          "world",
          "worldView",
          "worldViewProjection",
          "view",
          "projection",
        ],
      }
    );
    var noiseTexture = new BABYLON.NoiseProceduralTexture(
      "perlin",
      15,
      this.scene
    );
    noiseTexture.octaves = 10;
    // Create a particle system
    const particleSystem = new BABYLON.ParticleSystem("particles", 20000);

    //Texture of each particle
    particleSystem.particleTexture = new BABYLON.Texture(
      "/src/assets/textures/amiga.jpg",
      this.scene
    );
    console.log(particleSystem);
    particleSystem.noiseStrength = 300;
    // Position where the particles are emiited from
    particleSystem.emitter = new BABYLON.Vector3(0, 2, 0);

    particleSystem.start();

    shaderMaterial.setTexture("textureSampler", noiseTexture);
    shaderMaterial.setFloat("time", 0);
    shaderMaterial.setVector3("cameraPosition", BABYLON.Vector3.Zero());

    for (let i = -this.numSpheres / 2; i < this.numSpheres; i++) {
      this.spheres[i] = BABYLON.MeshBuilder.CreateSphere(
        "sphere",
        { segments: 16, diameter: 2 },
        this.scene
      );
      // console.log(this.spheres[i]);
      this.spheres[i].material = shaderMaterial;
      this.spheres[i].position.z = Math.sin(i);
      this.spheres[i].position.y = 1;
    }
    // var button = new GUI.HolographicButton("reset");
    // panel.addControl(button);
    // var text1 = new GUI.TextBlock();
    // text1.text = "Reset";
    // text1.color = "Red";
    // text1.fontSize = 48;
    // button.content = text1;
    // const makeSpheres = () => {
    //
    //   for (let i in this.numSpheres) {
    //     spheres[i] = BABYLON.MeshBuilder.CreateSphere(
    //       "sphere",
    //       { segments: 16, diameter: 2 },
    //       this.scene
    //     );
    //     spheres[i].position.y = 1;
    //     spheres[i].position.x = i;
    //     spheres[i].material = shaderMaterial;
    //     console.log(spheres[i]);
    //   }
    // };
    // makeSpheres();
    BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: 6, height: 6, subdivisions: 2 },
      this.scene
    );

    BABYLON.Effect.ShadersStore["customVertexShader"] = vertShader;
    BABYLON.Effect.ShadersStore["customFragmentShader"] = fragShader;

    //   var button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", "Click Me");
    //   button1.width = "150px";
    //   button1.height = "40px";
    //   button1.color = "white";
    //   button1.cornerRadius = 20;
    //   button1.background = "green";
    //   button1.onPointerUpObservable.add(function () {
    //     alert("you did it!");
    //   });
    //   this.advancedTexture.addControl(button1);
  }
  addButton() {}

  doRender() {
    this.engine.runRenderLoop(() => {
      // this.x += 10 % 360;
      // this.y += 10 % 360;

      // this.updateAngles(this.x, this.y, 0, this.camera);
      // this.FOH._foaRotator.update();
      const shaderMaterial = this.scene.getMaterialByName("shader");
      const camera = this.scene.getCameraByName("camera1");
      // const sphere = this.scene.getMeshByName("sphere");

      shaderMaterial.setFloat("time", this.time);

      this.time += 0.02;
      let idx;
      for (let i = -this.spheres.length / 2; i < this.spheres.length; i++) {
        this.spheres[idx].position.y =
          5 * Math.sin(i * 2 + this.time * idx * 100);
        idx++;
      }
      this.FOH.setRotationMatrix4(this.camera.getWorldMatrix().m);
      // console.log(this.ROH);
      // console.log(this.FOH);
      //console.log(camera);
      // this.FOH.tempMatrix
      // this.updateAngles(this.time, this.time, this.time, camera);
      shaderMaterial.setVector3(
        "cameraPosition",
        this.scene.activeCamera.position
      );
      // console.log(this.camera._camMatrix);
      this.scene.render();
    });

    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }
}
