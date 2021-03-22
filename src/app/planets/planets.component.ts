import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-planets',
  templateUrl: './planets.component.html',
  styleUrls: ['./planets.component.scss']
})
export class PlanetsComponent {

  constructor() { }
  
  loadTexture(url) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(url);
    const material = new THREE.MeshLambertMaterial({ map: texture });
    return material;
  }
  createSphere(x, radius, url) {
    const geometry = new THREE.SphereBufferGeometry(radius, 32, 32);
    const material = this.loadTexture(url);
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, 0, 0);
    return sphere;
  }
  daysToSpeed(days) {
    const max = 1;
    return (max*(1/days))/5; //tbh, i just tested some values here until I liked the rotation of the planets
  }
  distanceCamera(maxDistance) {
    return maxDistance*2;
  }
  calculateZ(maxRadius, radius) {
    const SunRadius = 40;
    const initialZ = 150; //fits the sun radius well

    const planetRadius = this.lengthAmortizer(maxRadius, radius);

    return (initialZ*planetRadius)/SunRadius;
  }
  lengthAmortizer(maxRadius, length) {
    const max = 40; //sun
    return (max*length)/maxRadius;
  }

  saturnRing(x, innerRadius, outerRadius) {
    const material = this.loadTexture("assets/images/saturn_ring_alpha.png");
    const geometry = new THREE.RingBufferGeometry( innerRadius, outerRadius, 30 );
    const mesh = new THREE.Mesh( geometry, material );
    mesh.position.set(0, 0, 0);
    return mesh;
  }
}
