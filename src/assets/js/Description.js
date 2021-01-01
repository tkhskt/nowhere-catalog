const { default: axios } = require('axios');
import RollingText from './RollingText';
import { TweenMax as TM, Expo } from 'gsap/all';

export default class Description {
  constructor(album, number, $el, loading, onHide) {
    this.all = number.all + 1;
    this.current = number.current + 1;
    this.album = album;
    this.loading = loading;
    this.$els = {
      container: $el,
      title: $el.querySelector('.name__main'),
      shadow: $el.querySelector('.name__shadow'),
      image: $el.querySelector('.img'),
      backgroundImage: $el.querySelector('.bg__img'),
      date: $el.querySelector('.info__release-date'),
      link: $el.querySelector('.listen__link'),
      number: $el.querySelector('.img__page'),
      indicator: $el.querySelector('.info__number'),
      list: $el.querySelector('.info__list'),
      closeButton: $el.querySelector('.header__close'),
      closeLine1: $el.querySelector('.close__line--1'),
      closeLine2: $el.querySelector('.close__line--2'),
    };
    this.getTrack(album.id);
    this.rollingText = new RollingText($el);
    this.bindEvent();
    this.onHide = onHide;
  }

  bindEvent() {
    this.$els.link.addEventListener('mouseover', () => {
      this.rollingText.hover();
    });
    this.$els.link.addEventListener('mouseleave', () => {
      this.rollingText.leave();
    });
    this.$els.closeButton.addEventListener('mouseover', () => {
      this.hoverClose();
    });
    this.$els.closeButton.addEventListener('mouseleave', () => {
      this.leaveClose();
    });
    this.$els.closeButton.addEventListener('click', () => {
      this.hide();
    });
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
    this.loading.slideOut(() => { });
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
    })
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
    TM.to(this.$els.closeLine1, {
      duration: 0.3,
      rotate: -30,
    })
    TM.to(this.$els.closeLine2, {
      duration: 0.3,
      rotate: 120,
    })
  }

  leaveClose() {
    TM.to(this.$els.closeLine1, {
      duration: 0.3,
      rotate: 45,
    })
    TM.to(this.$els.closeLine2, {
      duration: 0.3,
      rotate: 45,
    })
  }

  hide() {
    TM.to(this.$els.container, {
      duration: 0.5,
      opacity: 0,
      onComplete: () => {
        this.rollingText.hide();
        this.clearTracks();
        this.$els.container.style.display = 'none';
        this.onHide();
      }
    })
  }

  paddingNumber(number) {
    return `${('00' + number).slice(-2)}`;
  }
}
