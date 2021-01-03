import { TweenLite as TM, Expo } from 'gsap/dist/gsap';

export default class Title {
  constructor($el, onClick) {
    this.$els = {
      container: $el.querySelector('.name-container'),
      title: $el.querySelector('.name'),
      subtitle: $el.querySelector('.name--cursive'),
    };
    this.showTitleAnim = null;
    this.showSubTitleAnim = null;
    this.$els.container.addEventListener('click', (event) => {
      onClick();
    });
  }

  setText(trackName) {
    this.$els.title.innerText = trackName.toUpperCase();
    const camelText = trackName.replace(/([A-Z])/g, ' $1');
    const finalResult = camelText.charAt(0).toUpperCase() + camelText.slice(1);
    this.$els.subtitle.innerText = finalResult;
  }

  hide() {
    if (this.showTitleAnim != null) {
      this.showTitleAnim.kill();
    }
    if (this.showSubTitleAnim != null) {
      this.showSubTitleAnim.kill();
    }
    this.$els.title.style.cursor = 'default';
    this.$els.subtitle.style.cursor = 'default';
    TM.to(this.$els.title, 0.2, {
      opacity: 0,
      transform: 'translateY(5vh)',
      visibility: 0,
      ease: Expo.easeIn,
    });
    TM.to(this.$els.subtitle, 0.2, {
      opacity: 0,
      transform: 'translateY(5vh)',
      visibility: 0,
      ease: Expo.easeIn,
    });
  }
  show(trackName, complete) {
    this.setText(trackName);
    this.showTitleAnim = TM.to(this.$els.title, 0.2, {
      delay: 0.1,
      opacity: 1,
      transform: 'translateY(0px)',
      ease: Expo.easeOut,
      onComplete: () => {
        complete();
        this.$els.title.style.visibility = 'visible';
        this.$els.title.style.cursor = 'pointer';
        this.$els.subtitle.style.cursor = 'pointer';
      },
    });

    this.showSubTitleAnim = TM.to(this.$els.subtitle, 0.4, {
      delay: 0.1,
      opacity: 1,
      transform: 'translateY(0px)',
      ease: Expo.easeOut,
      onComplete: () => {
        complete();
        this.$els.subtitle.style.visibility = 'visible';
        this.$els.title.style.cursor = 'pointer';
        this.$els.subtitle.style.cursor = 'pointer';
      },
    });
  }
}
