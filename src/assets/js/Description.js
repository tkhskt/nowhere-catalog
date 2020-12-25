const { default: axios } = require('axios');

export default class Description {
  constructor(album, number, $el, loading) {
    // this.id = id;
    // this.date = date;
    // this.name = name;
    // this.image = image;
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
    };
    this.getTrack(album.id);
  }

  async getTrack(id) {
    const resp = await axios.get('https://us-central1-nowhere-web.cloudfunctions.net/track?i', {
      params: {
        id: id,
      },
    });
    this.setText(resp.data);
    this.$els.container.style.opacity = 1;
    this.$els.container.style.display = 'flex';
    this.loading.slideOut(() => {});
  }

  setText(tracks) {
    this.$els.title.innerText = this.album.name;
    this.$els.shadow.innerText = this.album.name;
    this.$els.image.src = this.album.image;
    this.$els.image.alt = this.album.name;
    this.$els.backgroundImage.style.backgroundImage = `url(${this.album.image})`;
    this.$els.date.innerText = 'release - ' + this.album.date.replace(/-/g, '/');
    // this.$els.link.href = tracks.
    this.$els.number.innerText = this.paddingNumber(this.current);
    this.$els.indicator.innerText = `${this.paddingNumber(this.current)}/${this.paddingNumber(
      this.all
    )}`;
  }

  paddingNumber(number) {
    return `${('00' + number).slice(-2)}`;
  }
}
