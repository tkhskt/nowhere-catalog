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
    TM.to(this.$els.buttonLine1, {
      duration: 0.3,
      top: '20px',
      rotate: 45,
    });
    TM.to(this.$els.buttonLine2, {
      duration: 0.3,
      bottom: '20px',
      rotate: -45,
    });
    this.openMenu();
    this.opened = true;
  }

  close() {
    TM.to(this.$els.buttonLine1, {
      duration: 0.3,
      top: '14px',
      rotate: 0,
    });
    TM.to(this.$els.buttonLine2, {
      duration: 0.3,
      bottom: '14px',
      rotate: 0,
    });
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
