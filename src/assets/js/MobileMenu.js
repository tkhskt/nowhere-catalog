import { TweenLite as TM, TimelineLite } from 'gsap/dist/gsap';

export default class MobileMenu {
  constructor($header, $menu) {
    this.$els = {
      menuButton: $header.querySelector('.mobile-header__button'),
      buttonLine1: $header.querySelector('.button__line--1'),
      buttonLine2: $header.querySelector('.button__line--2'),
      menuWrapper: $menu.querySelector('.mobile-content'),
      menuList: $menu.querySelector('.mobile-social-list'),
    };
    this.opened = false;
    this.bindEvent();
    this.modalAnim = null;
  }

  bindEvent() {
    this.$els.menuButton.addEventListener('click', () => {
      if (!this.opened) {
        this.open();
      } else {
        this.close();
      }
    });
  }

  open() {
    this.$els.buttonLine1.classList.add('line1--opened');
    this.$els.buttonLine2.classList.add('line2--opened');
    this.openMenu();
    this.opened = true;
  }

  close() {
    this.$els.buttonLine1.classList.remove('line1--opened');
    this.$els.buttonLine2.classList.remove('line2--opened');
    this.closeMenu();
    this.opened = false;
  }

  openMenu() {
    if (this.modalAnim != null) {
      this.modalAnim.kill();
    }
    this.modalAnim = new TimelineLite()
      .to(this.$els.menuWrapper, {
        duration: 0.5,
        height: '100%',
      })
      .to(this.$els.menuList, {
        duration: 0.2,
        opacity: 1,
      });
  }

  closeMenu() {
    if (this.modalAnim != null) {
      this.modalAnim.kill();
    }
    this.modalAnim = new TimelineLite()
      .to(this.$els.menuList, {
        duration: 0.2,
        opacity: 0,
      })
      .to(this.$els.menuWrapper, {
        duration: 0.5,
        height: 0,
      });
  }
}
