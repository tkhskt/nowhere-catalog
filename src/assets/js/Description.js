const { default: axios } = require('axios');
import RollingText from './RollingText';
import { isMobile } from './utils';
import { TweenLite as TM } from 'gsap/dist/gsap';

export default class Description {
  constructor(album, number, $el, loading, onHide) {
    this.all = number.all + 1;
    this.current = number.current + 1;
    this.album = album;
    this.loading = loading;
    this.$els = {
      container: $el,
      scrollWrapper: $el.querySelector('.description__container'),
      title: $el.querySelector('.name__main'),
      shadow: $el.querySelector('.name__shadow'),
      image: $el.querySelector('.img'),
      backgroundImage: $el.querySelector('.bg__img'),
      date: $el.querySelector('.info__release-date'),
      link: $el.querySelector('.listen__link'),
      linkMobile: $el.querySelector('.listen__link--mobile'),
      linkLine: $el.querySelector('.link-line'),
      number: $el.querySelector('.img__page'),
      indicator: $el.querySelector('.info__number'),
      list: $el.querySelector('.info__list'),
      closeButton: $el.querySelector('.header__close'),
      closeLine1: $el.querySelector('.close__line--1'),
      closeLine2: $el.querySelector('.close__line--2'),
    };
    this.line1Anim = null;
    this.line2Anim = null;
    this.linkLineAnim - null;
    this.getTrack(album.id);
    this.rollingText = new RollingText($el);
    this.bindEvent();
    this.onHide = onHide;
  }

  bindEvent() {
    this.hoverLinkFunc = this.hoverLink.bind(this);
    this.leaveLinkFunc = this.leaveLink.bind(this);
    this.hoverCloseFunc = this.hoverClose.bind(this);
    this.leaveCloseFunc = this.leaveClose.bind(this);
    this.clickCloseFunc = this.hide.bind(this);
    this.$els.link.addEventListener('mouseenter', this.hoverLinkFunc);
    this.$els.link.addEventListener('mouseleave', this.leaveLinkFunc);
    this.$els.closeButton.addEventListener('mouseenter', this.hoverCloseFunc);
    this.$els.closeButton.addEventListener('mouseleave', this.leaveCloseFunc);
    this.$els.closeButton.addEventListener('click', this.clickCloseFunc);
  }

  async getTrack(id) {
    const resp = await axios.get('https://us-central1-nowhere-web.cloudfunctions.net/track', {
      params: {
        id: id,
      },
    });
    this.setText(resp.data);
    this.$els.container.style.opacity = 1;
    this.$els.container.style.display = 'flex';
    this.$els.scrollWrapper.scrollTop = 0;
    this.loading.slideOut(() => {});
  }

  setText(tracks) {
    this.$els.title.innerText = this.album.name;
    this.$els.shadow.innerText = this.album.name;
    this.$els.image.src = this.album.image;
    this.$els.image.alt = this.album.name;
    this.$els.backgroundImage.style.backgroundImage = 'none';
    this.$els.backgroundImage.style.backgroundImage = `url(${this.album.image})`;
    this.$els.date.innerText = 'release - ' + this.album.date.replace(/-/g, '/');
    this.$els.link.href = this.album.url;
    this.$els.linkMobile.href = this.album.url;
    this.$els.number.innerText = this.paddingNumber(this.current);
    this.$els.indicator.innerText = `${this.paddingNumber(this.current)}/${this.paddingNumber(
      this.all
    )}`;
    this.setTracks(tracks);
  }

  setTracks(tracks) {
    tracks.items.forEach((track) => {
      const listItem = document.createElement('li');
      listItem.innerText = track.track_number + '. ' + track.name;
      listItem.classList.add('list_item');
      this.$els.list.appendChild(listItem);
    });
  }

  clearTracks() {
    while (this.$els.list.firstChild) {
      this.$els.list.removeChild(this.$els.list.firstChild);
    }
  }

  resize() {
    this.rollingText.resize();
  }

  hoverClose() {
    if (isMobile()) {
      return;
    }
    if (this.line1Anim != null && this.line2Anim != null) {
      this.line1Anim.kill();
      this.line2Anim.kill();
    }
    this.line1Anim = TM.to(this.$els.closeLine1, {
      duration: 0.3,
      rotate: -30,
    });
    this.line2Anim = TM.to(this.$els.closeLine2, {
      duration: 0.3,
      rotate: 120,
    });
  }

  leaveClose() {
    if (isMobile()) {
      return;
    }
    if (this.line1Anim != null && this.line2Anim != null) {
      this.line1Anim.kill();
      this.line2Anim.kill();
    }
    this.line1Anim = TM.to(this.$els.closeLine1, {
      duration: 0.3,
      rotate: 45,
    });
    this.line2Anim = TM.to(this.$els.closeLine2, {
      duration: 0.3,
      rotate: 45,
    });
  }

  hoverLink() {
    if (isMobile()) {
      return;
    }
    this.rollingText.hover();
    if (this.linkLineAnim != null) {
      this.linkLineAnim.kill();
    }
    this.$els.linkLine.style.cursor = 'pointer';
    this.linkLineAnim = TM.to(this.$els.linkLine, {
      duration: 0.3,
      left: '0',
      width: '100%',
    });
  }

  leaveLink() {
    if (isMobile()) {
      return;
    }
    this.rollingText.leave();
    if (this.linkLineAnim != null) {
      this.linkLineAnim.kill();
    }
    this.$els.linkLine.style.cursor = 'default';
    this.linkLineAnim = TM.to(this.$els.linkLine, {
      duration: 0.3,
      left: '-7.5vw',
      width: '7vw',
    });
  }

  hide() {
    TM.to(this.$els.container, {
      duration: 0.5,
      opacity: 0,
      onComplete: () => {
        this.rollingText.hide();
        this.clearTracks();
        this.removeListeners();
        this.resetElem();
        this.$els.container.style.display = 'none';
        this.onHide();
      },
    });
  }

  resetElem() {
    this.$els.linkLine.style.cursor = 'default';
    this.$els.linkLine.style.left = '-7.5vw';
    this.$els.linkLine.style.width = '7vw';
    this.$els.closeLine1.style.transform = 'rotate(45deg)';
    this.$els.closeLine2.style.transform = 'rotate(45deg)';
  }

  removeListeners() {
    this.$els.link.removeEventListener('mouseenter', this.hoverLinkFunc);
    this.$els.link.removeEventListener('mouseleave', this.leaveLinkFunc);
    this.$els.closeButton.removeEventListener('mouseenter', this.hoverCloseFunc);
    this.$els.closeButton.removeEventListener('mouseleave', this.leaveCloseFunc);
    this.$els.closeButton.removeEventListener('click', this.clickCloseFunc);
  }

  paddingNumber(number) {
    return `${('00' + number).slice(-2)}`;
  }
}
