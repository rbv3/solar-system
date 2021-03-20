import { Component, OnInit } from '@angular/core';
import { PlanetsComponent } from "../planets/planets.component";
import * as THREE from 'three';
import { PLANETS } from '../../assets/textures';// controls
import { SUN } from '../../assets/textures';// controls
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as STATS from 'stats.js';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  providers: [PlanetsComponent]
})
export class MainComponent implements OnInit {

  constructor(
    private planetsComponent: PlanetsComponent
  ) { }

  world: any;
  scene: any;
  camera: any;
  renderer: any;
  controls: any;
  listOfPlanets = [];

  setup() {
    if (localStorage.getItem('high-score') == null) {
      localStorage.setItem('high-score', "0");
    }


    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    //lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); //color n intensity
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6); //color n intensity
    dirLight.position.set(10, 20, 0); // x, y, z //from 10,20,0 to 0,0,0
    this.scene.add(dirLight);

    //camera
    const width = 10;
    const height = width * (window.innerHeight / window.innerWidth);
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.camera.position.set(0, 0, 100);
    // this.camera.lookAt(0, 0, 0);

    //renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.render(this.scene, this.camera);


    // controls

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.listenToKeyEvents(window); // optional

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    this.controls.dampingFactor = 0.05;

    this.controls.screenSpacePanning = false;


    this.controls.maxPolarAngle = Math.PI / 2;

    this.controls.target.set(0, 0, 0);
    this.controls.zoomSpeed = 2;

    this.controls.update();
    console.log(this.camera)
    // Add it to HTML
    document.body.appendChild(this.renderer.domElement);
  }
  animate(sphere, speed) {
    requestAnimationFrame(() => this.animate(sphere, speed));

    sphere.rotation.y += speed;

    this.renderer.render(this.scene, this.camera);
  };
  addSun() {
    const element = this.planetsComponent.createSphere(
      this.planetsComponent.lengthAmortizer(
        SUN.radius,
        SUN.distanceFromSun / 100
      ),
      this.planetsComponent.lengthAmortizer(
        SUN.radius,
        SUN.radius
      ),
      SUN.url
    );
    this.addSunLight();
    this.scene.add(element);
    this.animate(
      element,
      this.planetsComponent.daysToSpeed(SUN.rotation));

  }
  addSunLight() {

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap


    const light = new THREE.PointLight(0xeb9234, 3, 0, 2);
    light.position.set(0, 0, 0);
    // light.castShadow = true; // default false

    this.scene.add(light);


    // light.shadow.mapSize.width = SUN.radius; // default
    // light.shadow.mapSize.height = SUN.radius; // default
    // light.shadow.camera.near = 0.5; // default
    // light.shadow.camera.far = 500; // default

    //Create a helper for the shadow camera (optional)
    // const helper = new THREE.CameraHelper( light.shadow.camera );
    // this.scene.add( helper );
  }
  addPlanets() {
    for (let planet in PLANETS) {
      const element = this.planetsComponent.createSphere(
        this.planetsComponent.lengthAmortizer(
          SUN.radius,
          SUN.radius + PLANETS[planet].distanceFromSun / 100
        ),
        this.planetsComponent.lengthAmortizer(
          SUN.radius,
          PLANETS[planet].radius
        ),
        PLANETS[planet].url
      );
      this.scene.add(element);
      this.animate(
        element,
        this.planetsComponent.daysToSpeed(PLANETS[planet].rotation));
    }
  }
  setupListOfPlanets() {
    for (let planet in PLANETS) {
      this.listOfPlanets.push({
        name: planet,
        distance: PLANETS[planet].distanceFromSun,
        radius: PLANETS[planet].radius
      })
    }
  }
  goTo(planet) {
    this.camera.position.set(this.planetsComponent.lengthAmortizer(
      SUN.radius,
      SUN.radius + planet.distance / 100),
      0,
      this.planetsComponent.calculateZ(SUN.radius, planet.radius)
    );
    //change the position where we are lookint at
    this.controls.target.set(this.planetsComponent.lengthAmortizer(
      SUN.radius,
      SUN.radius + planet.distance / 100),
      0,
      0
    )

    this.controls.update();
    console.log(this.camera)
  }
  resetCamera() {
    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(0, 0, 0);
  }
  setupStats() {
    console.log(STATS)
    var stats = new STATS();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    console.log(stats.dom)
    stats.dom.style = "position: fixed; top: 0px;  cursor: pointer; opacity: 0.9; z-index: 10000; right: 0px";
    document.body.appendChild(stats.dom);

    function animate() {

      stats.begin();

      // monitored code goes here

      stats.end();

      requestAnimationFrame(animate);

    }

    requestAnimationFrame(animate);
  }
  ngOnInit(): void {
    this.setup();
    this.addSun();
    this.addPlanets();
    this.setupListOfPlanets();
    this.setupStats();
  }

}
