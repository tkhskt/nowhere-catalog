import { TimelineMax, Linear } from 'gsap/all';

export default class RollingText {
  constructor($el) {
    this.$els = {
      wrapper: $el.querySelector('.bg__nowhere-wrapper'),
      clonedText: $el.querySelector('.bg__nowhere-item').cloneNode(true),
    };
    this.rolling();
  }

  resize() {
    this.animation.kill();
    this.rolling();
  }

  rolling() {
    const infinite = new TimelineMax({ repeat: -1, paused: true });
    const time = 15;

    this.$els.wrapper.appendChild(this.$els.clonedText);
    this.$els.clonedText.classList.add('clone');
    document.querySelector('.description').style.display = 'flex';
    this.animation = infinite
      .fromTo(
        this.$els.wrapper,
        time,
        {
          y: -(this.$els.wrapper.clientHeight / 2),
          ease: Linear.easeNone,
        },
        {
          y: '0px',
          ease: Linear.easeNone,
        }
      )
      .play();
  }

  hover() {
    this.$els.wrapper.querySelectorAll('.bg__nowhere-item').forEach((element) => {
      element.style.color = '#434343';
      element.style.textShadow = 'none';
    });
  }

  leave() {
    this.$els.wrapper.querySelectorAll('.bg__nowhere-item').forEach((element) => {
      element.style.color = '#1b1a1a';
      element.style.textShadow =
        '2px 2px 0 #434343, -2px 2px 0 #434343, 2px -2px 0 #434343, -2px -2px 0 #434343';
    });
  }

  hide() {
    this.$els.wrapper.querySelectorAll('.clone').forEach((elem) => {
      this.$els.wrapper.removeChild(elem);
    });
    this.$els.wrapper.querySelectorAll('.bg__nowhere-item').forEach((element) => {
      // element.classList.remove('bg__nowehere-item--hover');
      element.style.color = '#1b1a1a';
      element.style.textShadow =
        '2px 2px 0 #434343, -2px 2px 0 #434343, 2px -2px 0 #434343, -2px -2px 0 #434343';
    });
  }
}
