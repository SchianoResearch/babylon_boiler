import * as BABYLON from "babylonjs";
import { GUI } from "babylonjs-gui";
import Omnitone from "../omnitone.min.esm";
import { ResonanceAudio } from "resonance-audio";
import * as THREE from "three";
import "babylonjs-loaders";
// import Omnitone from "../build/omnitone.min.esm";
import img from "./../assets/textures/amiga.jpg";
import dirt from "./../assets/textures/dirt.jpg";
// import vidTex from "./../assets/textures/babylon.mp4";
//import wav from "./../assets/road_break_feedback000.mp3";
import THREEDwav from "./../assets/3DWAV.wav";
import resWAV from "./../assets/WindmillStart.wav";
import vertShader from "./../shaders/shader.vert";
import fragShader from "./../shaders/shader.frag";
// console.log(dirt);
console.log(ResonanceAudio);
export default class Game {
  constructor(canvasId) {
    this.audioCtx = new AudioContext();
    this.audioCtx2 = new AudioContext();
    this.FOH = Omnitone.createFOARenderer(this.audioCtx, {
      // The example audio is in the FuMa ordering (W,X,Y,Z). So remap the
      // channels to the ACN format.
      channelMap: [0, 3, 1, 2],
    });
    this.resElement = document.createElement("audio");
    this.audioElement = document.createElement("audio");
    this.resonanceAudioScene = new ResonanceAudio(this.audioCtx);
    this.resonanceAudioScene.setRoomProperties(
      this.roomDimensions,
      this.roomMaterials
    );
    // this.advancedTexture =
    //   BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("GUI");
    this.roomDimensions = {
      width: 3.1,
      height: 2.5,
      depth: 3.4,
    };
    let roomMaterials = {
      // Room wall materials
      left: "brick-bare",
      right: "curtain-heavy",
      front: "marble",
      back: "glass-thin",
      // Room floor
      down: "grass",
      // Room ceiling
      up: "transparent",
    };

    // console.log(this.FOH);
    // this.ROH = Omnitone.createFOARotator(this.audioCtx);
    // console.log(this.ROH);
    //this.mainTexture = new BABYLON.Texture(img, this.scene);

    this.x = 0;
    this.y = 0;
    this.spheres = [];
    this.numSpheres = 3;
    this.lastMatrixUpdate = 0;

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

    this.mainTexture = new THREE.TextureLoader().load(dirt);
    //this.mainTexture2 = new BABYLON.Texture(img, this.scene);
  }

  createScene() {
    // console.log(this.FOH);
    this.FOH.initialize();

    this.audioElement.src = THREEDwav;

    // console.log(this.audioElement);
    // console.log(wav);
    this.audioElementSource = this.audioCtx.createMediaElementSource(
      this.audioElement
    );

    this.audioElementSource.connect(this.FOH.input);
    this.FOH.output.connect(this.audioCtx.destination);

    // Create an AudioElement.

    // Load an audio file into the AudioElement.
    this.resElement.src = resWAV;
    let resaudioElementSource = this.audioCtx.createMediaElementSource(
      this.resElement
    );
    resaudioElementSource.connect(this.FOH.input);
    let source = this.resonanceAudioScene.createSource();
    resaudioElementSource.connect(source.input);
    console.log(source);
    source.setPosition(0, 0, 0);

    // Play the audio.

    let someButton = document.getElementById("somebutton");

    someButton.addEventListener("click", () => {
      this.audioCtx.resume();
      this.audioElement.play();
      this.resElement.play();
      this.ANote0VideoVidTex.video.play();
      console.log(this.resElement);
      console.log(this.resonanceAudioScene);
    });

    this.camera.setTarget(BABYLON.Vector3.Zero());
    this.camera.attachControl(this.canvas, false);

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
    // var planeOpts = {
    //   height: 10,
    //   width: 10,
    //   sideOrientation: BABYLON.Mesh.DOUBLESIDE,
    // };

    var ANote0Video = BABYLON.MeshBuilder.CreateSphere(
      "sphere",
      { segments: 16, diameter: 100 },
      this.scene
    );
    ANote0Video.sideOrientation = BABYLON.Mesh.DOUBLESIDE;
    ANote0Video.scale = new BABYLON.Vector3(5, 5, 5);
    var vidPos = new BABYLON.Vector3(0, 2, 10);
    ANote0Video.position = vidPos;
    var ANote0VideoMat = new BABYLON.StandardMaterial("m", this.scene);
    this.ANote0VideoVidTex = new BABYLON.VideoTexture(
      "vidtex",
      "/src/assets/textures/mp4testvid.mp4",
      this.scene
    );
    // this.ANote0VideoVidTex.video.play();
    this.ANote0VideoVidTex.video.pause();
    this.videoDome = new BABYLON.VideoDome(
      "videoDome",
      ["https://yoda.blob.core.windows.net/videos/uptale360.mp4"],
      {
        resolution: 32,
        clickToPlay: true,
      },
      this.scene
    );
    console.log(BABYLON.VideoDome);
    console.log(this.ANote0VideoVidTex);
    ANote0VideoMat.diffuseTexture = this.ANote0VideoVidTex;
    ANote0VideoMat.roughness = 1;
    ANote0VideoMat.emissiveColor = new BABYLON.Color3.White();
    ANote0Video.material = ANote0VideoMat;

    let ground = BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: 6, height: 6, subdivisions: 2 },
      this.scene
    );
    ground.material = ANote0VideoMat;
    BABYLON.Effect.ShadersStore["customVertexShader"] = vertShader;
    BABYLON.Effect.ShadersStore["customFragmentShader"] = fragShader;
  }
  addButton() {}

  doRender() {
    this.engine.runRenderLoop(() => {
      const shaderMaterial = this.scene.getMaterialByName("shader");
      const camera = this.scene.getCameraByName("camera1");
      shaderMaterial.setFloat("time", this.time);
      this.time += 0.02;
      let idx;
      for (let i = -this.spheres.length / 2; i < this.spheres.length; i++) {
        this.spheres[idx].position.y =
          5 * Math.sin(i * 2 + this.time * idx * 100);
        idx++;
      }
      this.FOH.setRotationMatrix4(this.camera.getWorldMatrix().m);

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
