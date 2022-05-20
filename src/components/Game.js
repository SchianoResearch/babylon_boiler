import * as BABYLON from "babylonjs";
import * as THREE from "three";
import "babylonjs-loaders";
// import Omnitone from "../build/omnitone.min.esm";
import img from "./../assets/textures/amiga.jpg";
// import dirt from "./../assets/textures/dirt.jpg";
//import wav from "./../assets/road_break_feedback000.mp3";
import THREEDwav from "./../assets/3DWAV.wav";
import vertShader from "./../shaders/shader.vert";
import fragShader from "./../shaders/shader.frag";
console.log(img);

export default class Game {
  constructor(canvasId) {
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
      console.log(camera);

      // if (Date.now() - this.lastMatrixUpdate > 100) {
      this.FOH.setListenerFromMatrix(camera._camMatrix);
      // }
    };
    this.canvas = document.getElementById(canvasId);
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.scene = new BABYLON.Scene(this.engine);
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
    this.ROH = Omnitone.createFOARotator(this.audioCtx);
    console.log(this.ROH);
    this.mainTexture = new BABYLON.Texture(img, this.scene);
  }

  createScene() {
    console.log(this.FOH);
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
    console.log(this.scene);
    console.log(Omnitone);
    console.log(this.FOH);
    // this.FOH.setListenerFromMatrix(this.camera);

    this.light = new BABYLON.HemisphericLight(
      "light1",
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );

    let sphere = BABYLON.MeshBuilder.CreateSphere(
      "sphere",
      { segments: 16, diameter: 2 },
      this.scene
    );
    sphere.position.y = 1;

    BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: 6, height: 6, subdivisions: 2 },
      this.scene
    );

    BABYLON.Effect.ShadersStore["customVertexShader"] = vertShader;
    BABYLON.Effect.ShadersStore["customFragmentShader"] = fragShader;

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

    shaderMaterial.setTexture("textureSampler", this.mainTexture);
    shaderMaterial.setFloat("time", 0);
    shaderMaterial.setVector3("cameraPosition", BABYLON.Vector3.Zero());
    sphere.material = shaderMaterial;
  }

  doRender() {
    this.engine.runRenderLoop(() => {
      const shaderMaterial = this.scene.getMaterialByName("shader");
      const camera = this.scene.getCameraByName("camera1");
      shaderMaterial.setFloat("time", this.time);
      this.time += 0.02;
      // this.FOH.setRotationMatrixFromCamera(this.camera);
      // console.log(this.ROH);
      // console.log(this.FOH);
      //console.log(camera);
      // this.FOH.tempMatrix
      // this.updateAngles(this.time, this.time, this.time, camera);
      shaderMaterial.setVector3(
        "cameraPosition",
        this.scene.activeCamera.position
      );
      this.scene.render();
    });

    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }
}
