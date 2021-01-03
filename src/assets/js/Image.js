import * as THREE from 'three';
import { TweenLite as TM } from 'gsap/dist/gsap';
import vertexShader from '../glsl/shader.vert';
import fragmentShader from '../glsl/shader.frag';
import { isMobile } from './utils';

export default class Image {
  constructor($el, scene, textures) {
    this.scene = scene;
    this.$els = {
      body: document.body,
      el: $el,
      link: $el.querySelectorAll('.name-container'),
      title: $el.querySelector('.name').innerText,
      cursiveTitle: $el.querySelector('.name--cursive').innerText,
    };
    this.textures = textures;

    this.duration = 0.5;

    this.mainImage = this.$els.el.querySelector('.jacket-img');

    this.screenSize = {
      w: window.innerWidth,
      h: window.innerHeight,
    };

    this.sizes = new THREE.Vector2(0, 0);
    this.offset = new THREE.Vector2(0, 0);

    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;

    this.clock = new THREE.Clock();

    this.mouse = new THREE.Vector2(0, 0);

    // change track animation
    this.changeTrackProgress = { value: 0 };
    this.changeTrackInProgress = true;

    this.initTile();
    this.bindEvents();
  }

  initTile() {
    this.getBounds();

    this.uniforms = {
      u_texture1: { type: 't', value: this.textures[0] },
      u_texture2: { type: 't', value: this.textures[1] },
      u_mouse: { type: 'v2', value: this.mouse },
      resolution: { type: 'v4', value: new THREE.Vector4() },
      u_screen: { type: 'v2', value: new THREE.Vector2(this.screenSize.w, this.screenSize.h) },
      u_progress: { type: 'f', value: this.changeTrackProgress.value },
      u_inProgress: { type: 'b', value: this.changeTrackInProgress },
      gradient: { type: 'v2', value: new THREE.Vector2(0.5, 0.5) },
    };

    this.geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);

    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable',
      },
      uniforms: this.uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
      defines: {
        PI: Math.PI,
        PR: window.devicePixelRatio.toFixed(1),
      },
    });

    this.adjustImage();
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.mesh.position.x = this.offset.x;
    this.mesh.position.y = this.offset.y;

    this.mesh.scale.set(this.sizes.x, this.sizes.y, 1);

    this.scene.add(this.mesh);
  }

  bindEvents() {
    this.mainImage.addEventListener('mouseenter', () => {
      this.onPointerEnter();
    });
    this.mainImage.addEventListener('mouseleave', () => {
      this.onPointerLeave();
    });
  }

  changeTrack(trackIndex, isNext, doOnComplete) {
    this.uniforms.u_inProgress.value = true;
    let target = 1;
    if (!isNext) {
      this.uniforms.u_progress.value = 1;
      target = 0;
      this.material.uniforms.u_texture2.value = this.uniforms.u_texture1.value;
      this.material.uniforms.u_texture1.value = this.textures[trackIndex];
    }
    TM.to(this.uniforms.u_progress, 0.8, {
      value: target,
      onComplete: () => {
        doOnComplete();
        if (trackIndex == this.textures.length - 1) {
          this.material.uniforms.u_texture2.value = this.textures[0];
        } else {
          this.material.uniforms.u_texture2.value = this.textures[trackIndex + 1];
        }
        this.material.uniforms.u_texture1.value = this.textures[trackIndex];
        this.material.uniforms.u_progress.value = 0;
        this.changeTrackProgress.value = 0;
        this.uniforms.u_inProgress.value = false;
      },
    });
  }

  /*--
  events
  --*/

  onPointerEnter() {}

  onPointerLeave() {}

  onMouseMove(x, y) {
    if (!isMobile()) {
      this.mouse.x = x;
      this.mouse.y = y;
    }
  }

  resize() {
    if (this.textures.length === 0) return;
    this.getBounds();
    this.adjustImage();
    this.mesh.position.x = this.offset.x;
    this.mesh.position.y = this.offset.y;
    this.screenSize = {
      w: window.innerWidth,
      h: window.innerHeight,
    };
    this.material.uniforms.u_screen.value.set(this.screenSize.w, this.screenSize.h);
    this.mesh.scale.set(this.sizes.x, this.sizes.y, 1);
  }

  update() {
    if (isMobile()) {
      return;
    }
    this.uniforms.u_mouse.value = this.mouse;
  }

  /* --
  resize
  -- */

  adjustImage() {
    this.imageAspect = this.textures[0].image.height / this.textures[0].image.width;
    let a1;
    let a2;
    if (this.sizes.y / this.sizes.x > this.imageAspect) {
      // 表示領域より横長
      a1 = (this.sizes.x / this.sizes.y) * this.imageAspect;
      a2 = 1;
    } else {
      // 表示領域より縦長
      a1 = 1;
      a2 = this.sizes.y / this.sizes.x / this.imageAspect;
    }
    this.material.uniforms.resolution.value.x = this.sizes.x;
    this.material.uniforms.resolution.value.y = this.sizes.y;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;
  }

  getBounds() {
    const { width, height, left, top } = this.mainImage.getBoundingClientRect();

    if (!this.sizes.equals(new THREE.Vector2(width, height))) {
      this.sizes.set(width, height);
    }

    if (
      !this.offset.equals(
        new THREE.Vector2(
          left - window.innerWidth / 2 + width / 2,
          -top + window.innerHeight / 2 - height / 2
        )
      )
    ) {
      this.offset.set(
        left - window.innerWidth / 2 + width / 2,
        -top + window.innerHeight / 2 - height / 2
      );
    }
  }
}
