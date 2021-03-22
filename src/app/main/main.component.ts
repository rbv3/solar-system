import { Component, OnInit } from '@angular/core';
import { PlanetsComponent } from "../planets/planets.component";
import * as THREE from 'three';
import { PLANETS } from '../../assets/data';// controls
import { SUN } from '../../assets/data';// controls
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
  planetObjects = [];

  setup() {
    if (localStorage.getItem('high-score') == null) {
      localStorage.setItem('high-score', "0");
    }
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    //lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); //color n intensity
    this.scene.add(ambientLight);

    //camera
    const width = 10;
    const height = width * (window.innerHeight / window.innerWidth);
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);

    this.camera.position.set(0, 0, 100);
    // this.camera.lookAt(0, 0, 0);

    //renderer
    let pixelRatio = window.devicePixelRatio
    let AA = true
    if (pixelRatio > 1) {
      AA = false
    }
    this.renderer = new THREE.WebGLRenderer({
      antialias: AA,
      powerPreference: "high-performance"
    });
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
    // Add it to HTML
    document.body.appendChild(this.renderer.domElement);
  }
  animate() {
    requestAnimationFrame(() => this.animate());
    for(let p in this.planetObjects) {
      this.planetObjects[p].planet.rotation.y += this.planetObjects[p].speed;      
    }

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
    return {
      planet: element,
      speed: this.planetsComponent.daysToSpeed(SUN.rotation)
    };
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
  addPlanets(callback) {
    this.planetObjects.push(this.addSun());
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
      this.planetObjects.push({
        planet: element,
        speed: this.planetsComponent.daysToSpeed(PLANETS[planet].rotation)
      })
    }
    callback();
  }
  addSaturnRing() {
    const ring = this.planetsComponent.saturnRing(
      this.planetsComponent.lengthAmortizer(
        SUN.radius,
        SUN.radius + PLANETS['SATURN'].distanceFromSun / 100
      ),
      PLANETS['SATURN'].radius * 1.1,
      PLANETS['SATURN'].radius * 1.5
    )
    console.log(ring);
    this.scene.add(ring);
    console.log(this.scene)
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
  }
  resetCamera() {
    this.camera.position.set(0, 0, 100);
    this.controls.target.set(
      0,
      0,
      0
    )
    this.controls.update();
  }
  setupStats() {
    var stats = new STATS();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
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
    // this.addSun();
    // this.addSaturnRing();
    this.addPlanets(()=>this.animate());
    
    this.setupListOfPlanets();
    this.setupStats();
  }

}
