
import type { SceneData } from "./interfaces";

import {
  ArcRotateCamera,
  Color3,
  CreateAudioEngineAsync,
  CreateStreamingSoundAsync,
  CubeTexture,
  Engine,
  HemisphericLight,
  InstancedMesh,
  Mesh,
  MeshBuilder,
  ParticleSystem,
  Scene,
  Sprite,
  SpriteManager,
  StandardMaterial,
  Texture,
  Vector3,
  Vector4,
  Color4,
} from "@babylonjs/core";

import { AdvancedDynamicTexture, Button, Control } from "@babylonjs/gui";

function createTerrain(scene: Scene) {
  //Create large ground for valley environment
  const largeGroundMat = new StandardMaterial("largeGroundMat");
  largeGroundMat.diffuseTexture = new Texture(
    "./assets/environments/valleygrass.png"
  );

  const largeGround = MeshBuilder.CreateGroundFromHeightMap(
    "largeGround",
    "./assets/environments/villageheightmap.png",
    {
      width: 150,
      height: 150,
      subdivisions: 20,
      minHeight: 0,
      maxHeight: 10,
    },
    scene
  );
  largeGround.material = largeGroundMat;
  largeGround.position.y = -0.01;
}


function createGround(scene: Scene) {
  const groundMaterial = new StandardMaterial("groundMaterial");
  groundMaterial.diffuseTexture = new Texture(
    "./assets/environments/villagegreen.png"
  );
  groundMaterial.diffuseTexture.hasAlpha = true;
  groundMaterial.backFaceCulling = false;
  const ground = MeshBuilder.CreateGround(
    "ground",
    { width: 24, height: 24 },
    scene
  );
  ground.material = groundMaterial;
  ground.position.y = 0.01;
  return ground;
} 

function createSky(scene: Scene) {
  const skybox = MeshBuilder.CreateBox("skyBox", { size: 150 }, scene);
  const skyboxMaterial = new StandardMaterial("skyBox", scene);

  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.reflectionTexture = new CubeTexture(
    "./assets/textures/skybox/skybox",
    scene
  );

  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
  skyboxMaterial.specularColor = new Color3(0, 0, 0);

  skybox.material = skyboxMaterial;
  return skybox;
}

function createBox(style: number) {
  //style 1 small style 2 semi detatched
  const boxMat = new StandardMaterial("boxMat");
  const faceUV: Vector4[] = []; // faces for small house
  if (style == 1) {
    boxMat.diffuseTexture = new Texture("./assets/textures/cubehouse.png");
    faceUV[0] = new Vector4(0.5, 0.0, 0.75, 1.0); //rear face
    faceUV[1] = new Vector4(0.0, 0.0, 0.25, 1.0); //front face
    faceUV[2] = new Vector4(0.25, 0, 0.5, 1.0); //right side
    faceUV[3] = new Vector4(0.75, 0, 1.0, 1.0); //left side
    // faceUV[4] would be for bottom but not used
    // faceUV[5] would be for top but not used
  } else {
    boxMat.diffuseTexture = new Texture("./assets/textures/semihouse.png");
    faceUV[0] = new Vector4(0.6, 0.0, 1.0, 1.0); //rear face
    faceUV[1] = new Vector4(0.0, 0.0, 0.4, 1.0); //front face
    faceUV[2] = new Vector4(0.4, 0, 0.6, 1.0); //right side
    faceUV[3] = new Vector4(0.4, 0, 0.6, 1.0); //left side
    // faceUV[4] would be for bottom but not used
    // faceUV[5] would be for top but not used
  }

  const box = MeshBuilder.CreateBox("box", {
    width: style,
    height: 1,
    faceUV: faceUV,
    wrap: true,
  });
  box.position = new Vector3(0, 0.5, 0);
  box.scaling = new Vector3(1, 1, 1);
  box.material = boxMat;
  return box;
}

function createRoof(style: number) {
  const roof = MeshBuilder.CreateCylinder("roof", {
    diameter: 1.3,
    height: 1.2,
    tessellation: 3,
  });
  roof.scaling.x = 0.75;
  roof.scaling.y = style * 0.85;
  roof.rotation.z = Math.PI / 2;
  roof.position.y = 1.22;
  const roofMat = new StandardMaterial("roofMat");
  roofMat.diffuseTexture = new Texture("./assets/textures/roof.jpg");
  roof.material = roofMat;
  return roof;
}

function createHouse(scene: Scene, style: number) {
  const box = createBox(style);
  const roof = createRoof(style);
  const house = Mesh.MergeMeshes(
    [box, roof],
    true,
    false,
    undefined,
    false,
    true
  );
  // last true allows combined mesh to use multiple materials
  return house;
}

function createHouses(scene: Scene, style: number) {
  //Start by locating one each of the two house types then add others

  if (style == 1) {
    // show 1 small house
    createHouse(scene, 1);
  }
  if (style == 2) {
    // show 1 large house
    createHouse(scene, 2);
  }
  if (style == 3) {
    // show estate
    const houses: (Mesh | null)[] = [];
    // first two houses are original meshes
    houses[0] = createHouse(scene, 1);
    houses[0]!.rotation.y = -Math.PI / 16;
    houses[0]!.position.x = -6.8;
    houses[0]!.position.z = 2.5;

    houses[1] = createHouse(scene, 2);
    houses[1]!.rotation.y = -Math.PI / 16;
    houses[1]!.position.x = -4.5;
    houses[1]!.position.z = 3;

    //next houses are cloned instances of first two
    const ihouses: InstancedMesh[] = [];
    const places: number[][] = []; //each entry is an array [house type, rotation, x, z]

    places.push([2, -Math.PI / 16, -1.5, 4]);
    places.push([2, -Math.PI / 3, 1.5, 6]);
    places.push([2, (15 * Math.PI) / 16, -6.4, -1.5]);
    places.push([1, (15 * Math.PI) / 16, -4.1, -1]);
    places.push([2, (15 * Math.PI) / 16, -2.1, -0.5]);
    places.push([1, (5 * Math.PI) / 4, 0, -1]);
    places.push([1, Math.PI + Math.PI / 2.5, 0.5, -3]);
    places.push([2, Math.PI + Math.PI / 2.1, 0.75, -5]);
    places.push([1, Math.PI + Math.PI / 2.25, 0.75, -7]);
    places.push([2, Math.PI / 1.9, 4.75, -1]);
    places.push([1, Math.PI / 1.95, 4.5, -3]);
    places.push([2, Math.PI / 1.9, 4.75, -5]);
    places.push([1, Math.PI / 1.9, 4.75, -7]);
    places.push([2, -Math.PI / 3, 5.25, 2]);
    places.push([1, -Math.PI / 3, 6, 4]);

    for (let i = 0; i < places.length; i++) {
      if (places[i]![0] === 1) {
        ihouses[i] = houses[0]!.createInstance("house" + i);
      } else {
        ihouses[i] = houses[1]!.createInstance("house" + i);
      }
      ihouses[i]!.rotation.y = places[i]![1]!;
      ihouses[i]!.position.x = places[i]![2]!;
      ihouses[i]!.position.z = places[i]![3]!;
    }
  }
  // nothing returned by this function
}

function createTrees(scene: Scene) {
  const spriteManagerTrees = new SpriteManager(
    "treesManager",
    "./assets/sprites/tree.png",
    2000,
    { width: 512, height: 1024 },
    scene
  );

  //We create trees at random positions
  for (let i = 0; i < 500; i++) {
    const tree: Sprite = new Sprite("tree", spriteManagerTrees);
    tree.position.x = Math.random() * -30;
    tree.position.z = Math.random() * 20 + 8;
    tree.position.y = 0.2;
  }

  for (let i = 0; i < 500; i++) {
    const tree = new Sprite("tree", spriteManagerTrees);
    tree.position.x = Math.random() * 25 + 7;
    tree.position.z = Math.random() * -35 + 8;
    tree.position.y = 0.2;
  }

 
  return spriteManagerTrees;
}

function createHemisphericLight(scene: Scene) {
  const light = new HemisphericLight(
    "light",
    new Vector3(2, 1, 0), // move x pos to direct shadows
    scene
  );
  light.intensity = 0.8;
  light.diffuse = new Color3(1, 1, 1);
  light.specular = new Color3(1, 0.8, 0.8);
  light.groundColor = new Color3(0, 0.2, 0.7);
  return light;
}

function createDayNightCycle(
  light: HemisphericLight, // parameter to accept the hemispheric light
  skyMaterial: StandardMaterial, // parameter to accept the sky material
  treeManager: SpriteManager
) {
  // Function to set daytime
  function setDay() {
    light.intensity = 0.8; // set intensity to 0.8 for daytime
    light.diffuse = new Color3(1, 1, 1); // set diffuse color to white for daytime
    light.groundColor = new Color3(0, 0.2, 0.7); // set ground color to blue for daytime

    skyMaterial.disableLighting = true;
    if (skyMaterial.reflectionTexture) {
      skyMaterial.reflectionTexture.level = 1;
    }

    // Restore the original tree colours
    treeManager.sprites.forEach((tree) => {
      tree.color = new Color4(1, 1, 1, 1);
    });
  }

  // Function to set nighttime
  function setNight() {
    light.intensity = 0.2; // set intensity to 0.2 for nighttime
    light.diffuse = new Color3(0.2, 0.25, 0.5); // set diffuse color to dark blue for nighttime
    light.groundColor = new Color3(0.02, 0.03, 0.1); // set ground color to dark blue for nighttime

    skyMaterial.disableLighting = true;
    if (skyMaterial.reflectionTexture) {
      skyMaterial.reflectionTexture.level = 0.15;
    }

    // Darken the trees with a blue tint
    treeManager.sprites.forEach((tree) => {
      tree.color = new Color4(0.3, 0.3, 0.5, 1);
    });
  }

  return { setDay, setNight }; // return an object containing the setDay and setNight functions
}

async function initializeAudio() {
  const audioEngine = await CreateAudioEngineAsync();
  await audioEngine.unlockAsync();
  return CreateStreamingSoundAsync("birds", "assets/audio/AMBBird.wav", { loop: true }, audioEngine);
}

function createAudioButton(scene: Scene) {
  const gui = AdvancedDynamicTexture.CreateFullscreenUI("audioUI", true, scene);
  const button = Button.CreateSimpleButton("audioButton", "🔇");
  let audioSound: Awaited<ReturnType<typeof initializeAudio>> | null = null;
  let hasAudioStarted = false;
  let isAudioPlaying = false;
  button.width = "50px";
  button.height = "50px";
  button.cornerRadius = 25;
  button.color = "white";
  button.background = "#222";
  button.thickness = 0;
  button.fontSize = 24;
  button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
  button.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  button.leftInPixels = -20;
  button.topInPixels = 20;
  button.onPointerUpObservable.add(async () => {
    button.isEnabled = false;
    try {
      if (!audioSound) {
        audioSound = await initializeAudio();
      }

      if (isAudioPlaying) {
        audioSound.pause();
        isAudioPlaying = false;
        button.textBlock!.text = "🔇";
      } else {
        if (hasAudioStarted) {
          audioSound.resume();
        } else {
          audioSound.play();
          hasAudioStarted = true;
        }
        isAudioPlaying = true;
        button.textBlock!.text = "🔊";
      }
    } catch (error) {
      console.error("Failed to toggle audio", error);
    } finally {
      button.isEnabled = true;
    }
  });
  gui.addControl(button);
}

function createDayNightButtons // function to create buttons for day and night mode
(
  scene: Scene,
  dayNight: ReturnType<typeof createDayNightCycle> // parameter to accept the dayNight object returned from createDayNightCycle
) {
  const gui = AdvancedDynamicTexture.CreateFullscreenUI("dayNightUI", true, scene); // create a fullscreen UI for the buttons

  // Day button
  const dayButton = Button.CreateSimpleButton("dayButton", "DAY"); // create a button for day mode
  dayButton.width = "100px"; // set the width of the button
  dayButton.height = "45px"; // set the height of the button
  dayButton.cornerRadius = 8; // set the corner radius of the button
  dayButton.color = "white"; // set the text color of the button
  dayButton.background = "#D69B38"; // set the background color of the button
  dayButton.thickness = 0; // set the thickness of the button border to 0
  dayButton.fontSize = 18; // set the font size of the button text
  dayButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT; // align the button to the left of the screen
  dayButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP; // align the button to the top of the screen
  dayButton.leftInPixels = 20; // set the left position of the button in pixels
  dayButton.topInPixels = 20; // set the top position of the button in pixels

  dayButton.onPointerUpObservable.add(() => {
    dayNight.setDay(); // call the setDay function from the dayNight object when the button is clicked
  });

  // Night button
  const nightButton = Button.CreateSimpleButton("nightButton", "NIGHT"); // create a button for night mode
  nightButton.width = "100px"; // set the width of the button
  nightButton.height = "45px"; // set the height of the button
  nightButton.cornerRadius = 8; // set the corner radius of the button
  nightButton.color = "white"; // set the text color of the button
  nightButton.background = "#26345E"; // set the background color of the button
  nightButton.thickness = 0; // set the thickness of the button border to 0
  nightButton.fontSize = 18; // set the font size of the button text
  nightButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT; // align the button to the left of the screen
  nightButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP; // align the button to the top of the screen
  nightButton.leftInPixels = 20; // set the left position of the button in pixels
  nightButton.topInPixels = 75; // set the top position of the button in pixels

  nightButton.onPointerUpObservable.add(() => {
    dayNight.setNight(); // call the setNight function from the dayNight object when the button is clicked
  });

  gui.addControl(dayButton); // add the day button to the GUI
  gui.addControl(nightButton); // add the night button to the GUI
}

function createArcRotateCamera(scene: Scene) {
  let camAlpha = -Math.PI / 2,
    camBeta = Math.PI / 2.5,
    camDist = 25,
    camTarget = new Vector3(0, 0, 0);
  let camera = new ArcRotateCamera(
    "camera1",
    camAlpha,
    camBeta,
    camDist,
    camTarget,
    scene
  );
  camera.lowerRadiusLimit = 9;
  camera.upperRadiusLimit = 25;
  camera.lowerAlphaLimit = 0;
  camera.upperAlphaLimit = Math.PI * 2;
  camera.lowerBetaLimit = 0;
  camera.upperBetaLimit = Math.PI / 2.02;

  camera.attachControl(true);
  return camera;
}

export default function createStartScene(engine: Engine) 
{
  let scene = new Scene(engine);
  let ground = createGround(scene);
  let sky = createSky(scene);
  let lightHemispheric = createHemisphericLight(scene);

  let skyMaterial = sky.material as StandardMaterial;

  createHouses(scene, 3);
  let treeManager = createTrees(scene);
  createTerrain(scene);

  let dayNight = createDayNightCycle(lightHemispheric, skyMaterial, treeManager);

  dayNight.setDay(); // set the village to daytime when it first loads

  createDayNightButtons(scene, dayNight);
  let camera = createArcRotateCamera(scene);
  createAudioButton(scene); 
  

  let that: SceneData = {
    scene,
    ground,
    sky,
    lightHemispheric,
    camera,
  };
  return that;
}
