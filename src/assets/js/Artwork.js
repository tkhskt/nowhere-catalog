import * as THREE from 'three';
import Image from './Image';
import Title from './Title';
import Loading from './Loading';
import MobileMenu from './MobileMenu';
import Description from './Description';
import vert from '../glsl/shader.vert';
import postShader from '../glsl/post.frag';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import Page from './Page';
import { isMobile } from './utils';

export default class Artwork {
  constructor(tracks) {
    this.perspective = 800;
    this.tracks = tracks;
    this.textures = [];
    this.clock = new THREE.Clock();

    // cursor position
    this.speed = 0;
    this.targetSpeed = 0;
    this.mouse = new THREE.Vector2();
    this.followMouse = new THREE.Vector2();
    this.prevMouse = new THREE.Vector2();

    // scroll
    this.prevScroll = 0;
    this.changeTrackThreshold = 0;
    this.maxScrollAmount = this.changeTrackThreshold * tracks.length;
    this.currentTrackIndex = 0;
    this.changeTrackInProgress = false;
    this.changeTextInProgress = false;
    this.openDescriptionInProgress = false;

    this.canvas = document.getElementById('canvas');
    const title = document.getElementById('track-name');
    this.loading = new Loading(document.querySelector('.loading'));
    this.title = new Title(title, () => {
      if (this.changeTextInProgress) return;
      this.openDescriptionInProgress = true;
      this.loading.slideIn(() => {
        this.openDescriptionInProgress = false;
        this.openDescription();
      });
    });
    this.title.setText(this.tracks[0].name);
    this.page = new Page(document.getElementById('page'), this.tracks.length);
    this.mobileMenu = new MobileMenu(
      document.querySelector('.mobile-header'),
      document.querySelector('.mobile-menu')
    );
    this.description = null;
    this.loadImages(this.init.bind(this));
  }

  init() {
    this.loading.fadeOut();
    this.clock.start();
    this.setSize();
    this.initScene();
    this.initCamera();
    this.initLights();
    this.composeRenderer();
    this.bindEvents();
    this.setSnsHover();
    this.image = new Image(document.querySelector('.main'), this.scene, this.textures);
    this.loop();
  }

  openDescription() {
    const album = this.tracks[this.currentTrackIndex];
    this.description = new Description(
      album,
      { current: this.currentTrackIndex, all: this.tracks.length },
      document.querySelector('.description'),
      this.loading,
      () => {
        this.description = null;
      }
    );
  }

  bindEvents() {
    window.addEventListener('resize', this.resize.bind(this));
    window.addEventListener('mousemove', (e) => {
      this.mouseMove(e);
    });
    window.addEventListener('wheel', (e) => {
      this.scroll(e);
    });
  }

  setSnsHover() {
    const twitter = document.querySelector('.twitter');
    const youtube = document.querySelector('.youtube');
    twitter.addEventListener('mouseenter', () => {
      twitter.querySelector('.sns-line').classList.add('sns-line--show');
    });
    youtube.addEventListener('mouseenter', () => {
      youtube.querySelector('.sns-line').classList.add('sns-line--show');
    });
    twitter.addEventListener('mouseleave', () => {
      twitter.querySelector('.sns-line').classList.remove('sns-line--show');
    });
    youtube.addEventListener('mouseleave', () => {
      youtube.querySelector('.sns-line').classList.remove('sns-line--show');
    });
  }

  initScene() {
    this.scene = new THREE.Scene();
    // FIXME 消すとundifinedになる...
    this.scene.autoUpdate = true;
  }

  initCamera() {
    const fov = (180 * (2 * Math.atan(this.size.windowH / 2 / this.perspective))) / Math.PI;

    this.camera = new THREE.PerspectiveCamera(fov, this.size.windowW / this.size.windowH, 1, 10000);
    this.camera.position.set(0, 0, this.perspective);
    this.camera.updateProjectionMatrix();
  }

  setSize() {
    this.size = {
      windowW: window.innerWidth,
      windowH: window.innerHeight,
    };
    this.changeTrackThreshold = this.size.windowH;
    this.maxScrollAmount = this.changeTrackThreshold * this.tracks.length;
  }

  loadImages(callback) {
    const promises = [];
    const that = this;
    this.tracks.forEach((track, i) => {
      const promise = new Promise((resolve) => {
        const texture = new THREE.TextureLoader().load(track.image, resolve);
        texture.center.set(0.5, 0.5);
        that.textures[i] = texture;
      });
      promises.push(promise);
    });
    Promise.all(promises).then(() => {
      callback();
    });
  }

  composeRenderer() {
    // this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(this.size.windowW, this.size.windowH);

    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);

    var myEffect = {
      uniforms: {
        tDiffuse: { value: null },
        distort: { value: 0 },
        resolution: { value: new THREE.Vector2(1, window.innerHeight / window.innerWidth) },
        uMouse: { value: new THREE.Vector2(-10, -10) },
        uVelo: { value: 0 },
        uScale: { value: 0 },
        uType: { value: 0 },
        time: { value: 0 },
      },
      vertexShader: vert,
      fragmentShader: postShader,
    };

    this.customPass = new ShaderPass(myEffect);
    this.customPass.renderToScreen = true;
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.customPass);
  }

  initLights() {
    const ambientlight = new THREE.AmbientLight(0xffffff, 2);
    this.scene.add(ambientlight);
  }

  resize() {
    this.setSize();
    this.image.resize();
    this.canvas.style.width = `${this.size.windowW}px`;
    this.canvas.style.height = `${this.size.windowH}px`;
    this.camera.fov = (180 * (2 * Math.atan(this.size.windowH / 2 / this.perspective))) / Math.PI;
    this.camera.aspect = this.size.windowW / this.size.windowH;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.size.windowW, this.size.windowH);
    this.composer.setSize(this.size.windowW, this.size.windowH);
    if (this.description != null) {
      this.description.resize()
    }
  }

  mouseMove(e) {
    this.mouse.x = e.clientX / this.size.windowW;
    this.mouse.y = 1 - e.clientY / this.size.windowH;
    this.image.onMouseMove(e.clientX, e.clientY);
  }

  scroll(e) {
    if (this.changeTrackInProgress || this.description != null || this.openDescriptionInProgress) return;
    const currentScroll = Math.max(this.prevScroll + e.deltaY, 0);
    if (Math.abs(e.deltaY) > window.innerHeight * 0.05) {
      // update track
      this.changeTrackInProgress = true;
      let isNext = false;
      const previousPage = this.currentTrackIndex;
      if (e.deltaY > 0 && this.currentTrackIndex == this.tracks.length - 1) {
        isNext = true;
        this.currentTrackIndex = 0;
      } else if (e.deltaY < 0 && this.currentTrackIndex == 0) {
        this.currentTrackIndex = this.tracks.length - 1;
      } else if (e.deltaY > 0) {
        isNext = true;
        this.currentTrackIndex += 1;
      } else {
        this.currentTrackIndex -= 1;
      }
      this.title.hide();
      this.image.changeTrack(this.currentTrackIndex, isNext, () => {
        this.changeTrackInProgress = false;
        this.changeTextInProgress = true;
        this.title.show(this.tracks[this.currentTrackIndex].name, () => {
          this.changeTextInProgress = false;
        });
      });
      this.page.next(this.currentTrackIndex, previousPage);
    }
    if (currentScroll > this.maxScrollAmount) {
      this.prevScroll = 0;
      return;
    }
    this.prevScroll = currentScroll;
  }

  getMouseSpeed() {
    this.speed = Math.sqrt(
      (this.prevMouse.x - this.mouse.x) ** 2 + (this.prevMouse.y - this.mouse.y) ** 2
    );

    this.targetSpeed -= 0.1 * (this.targetSpeed - this.speed);
    this.followMouse.x -= 0.1 * (this.followMouse.x - this.mouse.x);
    this.followMouse.y -= 0.1 * (this.followMouse.y - this.mouse.y);

    this.prevMouse.x = this.mouse.x;
    this.prevMouse.y = this.mouse.y;
  }

  loop() {
    this.render();
    requestAnimationFrame(this.loop.bind(this));
  }

  render() {
    this.image.update();
    if (!isMobile()) {
      this.getMouseSpeed();
      this.customPass.uniforms.uMouse.value = this.followMouse;
      this.customPass.uniforms.uVelo.value = Math.min(this.targetSpeed, 0.05);
      this.targetSpeed *= 0.999;
    }
    this.composer.render(this.scene, this.camera);
  }
}
