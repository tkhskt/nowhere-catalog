import { TweenLite as TM, TimelineLite } from 'gsap/dist/gsap';

export default class Loading {
  constructor($el) {
    this.$els = {
      background: $el,
      title: $el.querySelector('.title'),
    };
  }

  fadeOut() {
    TM.to(this.$els.background, 0.5, {
      delay: 1.0,
      opacity: 0,
      onComplete: () => {
        this.$els.background.style.display = 'none';
      },
    });
  }

  slideIn(onComplete) {
    this.$els.title.style.opacity = '0';
    this.$els.background.style.width = '0px';
    this.$els.background.style.opacity = '1';
    this.$els.background.style.display = 'flex';
    this.$els.background.style.left = '0';
    this.$els.background.style.right = 'auto';
    var tl = new TimelineLite({
      onComplete: () => {
        onComplete();
      },
    });
    tl.to(this.$els.background, {
      width: '100vw',
      duration: 0.5,
    });
    tl.to(this.$els.title, {
      duration: 0.3,
      delay: 0.5,
      opacity: 1,
    });
  }

  slideOut(onComplete) {
    this.$els.title.style.opacity = '1';
    this.$els.background.style.width = '100vw';
    this.$els.background.style.opacity = '1';
    this.$els.background.style.left = 'auto';
    this.$els.background.style.right = '0';
    var tl = new TimelineLite({
      onComplete: () => {
        onComplete();
      },
    });
    tl.to(this.$els.title, {
      delay: 0.5,
      duration: 0.3,
      opacity: 0,
    });
    tl.to(this.$els.background, {
      width: '0vw',
      duration: 0.5,
      onComplete: () => {
        this.$els.background.style.display = 'none';
      },
    });
  }
}
