import {
    Engine,
    Scene,
    ArcRotateCamera,
    Vector3,
    MeshBuilder,
    StandardMaterial,
    Color3,
    SpotLight,
    HemisphericLight,
    DirectionalLight,
    ShadowGenerator,
    Mesh,
    TransformNode,
    RectAreaLight,
    PointLight,
  } from "@babylonjs/core";
  
  
  function createBox(scene: Scene) {
    let box = MeshBuilder.CreateBox("box",{size: 1}, scene); //creates the box and adds to the scene
    let boxMaterial = new StandardMaterial("boxMaterial", scene); // create new material for box
    boxMaterial.diffuseColor = new Color3(1, 0, 0); //red colour for the box
    box.position.x = 0.5;// position the box at x= 0.5
    box.position.y = 1; // position the box at y= 1
    box.position.z = 0.3; //position the box at z= 0.3
    box.material = boxMaterial; // apply the material to the box
    return box;
  }
  
  function createSphere(scene: Scene) {
    let sphere = MeshBuilder.CreateSphere("sphere",{diameter: 1}, scene);
    let sphereMaterial = new StandardMaterial("sphereMaterial", scene);
    sphereMaterial.diffuseColor = new Color3(0, 0, 1); //blue colour for the sphere
    sphere.material = sphereMaterial; // apply the material to the sphere
    sphere.position.x = -0.5; // position the sphere at x= -0.5
    sphere.position.y = 1.5; // position the sphere at y= 1.5
    sphere.position.z = 0.2; // position the sphere at z= 0.2
    return sphere;
  }

  function createCylinder(scene: Scene) {
    let cylinder = MeshBuilder.CreateCylinder("cylinder",{diameter: 1, height: 2}, scene);
    let cylinderMaterial = new StandardMaterial("cylinderMaterial", scene);
    cylinderMaterial.diffuseColor = new Color3(0, 1, 0); //green colour for the cylinder
    cylinder.material = cylinderMaterial; // apply the material to the cylinder
    cylinder.position.x = -0.7; // position the cylinder at x= -0.7
    cylinder.position.y = 1; // position the cylinder at y= 1
    cylinder.position.z = -0.5; // position the cylinder at z= -0.5
    return cylinder;
  }

  function createCone(scene: Scene) {
    let cone = MeshBuilder.CreateCylinder("cone", { diameterTop: 0, diameterBottom: 1, height: 2 }, scene);
    let coneMaterial = new StandardMaterial("coneMaterial", scene);
    coneMaterial.diffuseColor = new Color3(1, 1, 0); //yellow colour for the cone
    cone.material = coneMaterial; // apply the material to the cone
    cone.position.x = 0.5; // position the cone at x= 0.5
    cone.position.y = 1; // position the cone at y= 1
    cone.position.z = -0.7; // position the cone at z= -0.7
    return cone;
  }

function createHemisphericLight(scene: Scene) {
  const light: HemisphericLight = new HemisphericLight(
    "light",
    new Vector3(0, 1, 0),
    scene,
  );
  light.intensity = 0.35;
  light.diffuse = new Color3(0.45, 0.55, 1);
  light.specular = new Color3(0.7, 0.8, 1);
  light.groundColor = new Color3(0.12, 0.08, 0.25);
  return light;
}

function createDirectionalLight(scene: Scene) {
  const light = new DirectionalLight("light", new Vector3(0.5, -0.5, 0.2), scene);
  light.position = new Vector3(20, 40, 10);
  light.intensity = 0.6;
  light.diffuse = new Color3(0.75, 0.8, 1);
  light.specular = new Color3(0.5, 0.65, 1);
  return light;
}

function createPointLight(scene: Scene ){
    const light = new PointLight("light", new Vector3(-2.5, 0.2, 0.5),scene);
    light.intensity = 0.8;
    light.diffuse = new Color3(0.1, 0.8, 1);
    light.specular = new Color3(0.4, 0.9, 1);
    return light;
}

function createSpotLight(scene: Scene ){
    const light = new SpotLight("light", new Vector3(2, 1, -3), 
        new Vector3(0, -2, 3), Math.PI / 3, 20, scene);
    light.intensity = 1.2;
    light.diffuse = new Color3(0.8, 0.25, 1);
    light.specular = new Color3(1, 0.5, 1);
    return light;
}


function createRectAreaLight(scene: Scene) {
    const target = Vector3.Zero();
    const lightRoot = new TransformNode("areaLightRoot", scene);
    const light = new RectAreaLight(
        "areaLight",
        Vector3.Zero(),
        3,
        3,
        scene
    );

    const plane = MeshBuilder.CreatePlane(
        "debugLight",
        { size: 3 },
        scene
    );

    // Parent both to the same transform
    light.parent = lightRoot;
    plane.parent = lightRoot;

    // Light settings
    light.intensity = 20;
    light.diffuse = new Color3(0, 0.7, 1); 
    light.specular = new Color3(0.1, 0, 1); 

    // Make plane match the light color
    const planeMat = new StandardMaterial("debugLightMat", scene);
    planeMat.emissiveColor = light.diffuse.clone();
    planeMat.backFaceCulling = false;       
    plane.material = planeMat;

    // Position
    lightRoot.position.set(0, 5, -5);

    // Aim at scene centre
    lightRoot.lookAt(target);

    // Since the light emits backwards relative to the plane:
    lightRoot.rotate(Vector3.Up(), Math.PI);

    return light;
}

function createShadows(light: DirectionalLight, sphere: Mesh ,box: Mesh){
    const shadower = new ShadowGenerator(1024, light);
    const sm : any = shadower.getShadowMap();
    sm.renderList.push(sphere, box);

    shadower.setDarkness(0.2);
    shadower.useBlurExponentialShadowMap = true;
    shadower.blurScale = 4;
    shadower.blurBoxOffset = 1;
    shadower.useKernelBlur = true;
    shadower.blurKernel = 64;
    shadower.bias = 0;
    return shadower;
}
  function createGround(scene: Scene) {
    let ground = MeshBuilder.CreateGround(
      "ground",
      { width: 8, height: 8 },
      scene,
    );
  
    return ground;
  }
  
  function createArcRotateCamera(scene: Scene) {
    let camAlpha = -Math.PI / 2,
      camBeta = Math.PI / 2.5,
      camDist = 10,
      camTarget = new Vector3(0, 0, 0);
    let camera = new ArcRotateCamera(
      "camera1",
      camAlpha,
      camBeta,
      camDist,
      camTarget,
      scene,
    );
    camera.attachControl(true);
    return camera;
  }
  
export function createStartScene(engine: Engine) {
    let myscene: Scene = new Scene(engine) ;
    createBox(myscene);
    createSphere(myscene);
    createGround(myscene);
    createArcRotateCamera(myscene);
    createCylinder(myscene);
    createCone(myscene);
    createHemisphericLight(myscene);
    createDirectionalLight(myscene);
    createShadows(createDirectionalLight(myscene), createSphere(myscene), createBox(myscene));
    createSpotLight(myscene);
    createPointLight(myscene);
    createRectAreaLight(myscene);

    return myscene;
  }
    
  