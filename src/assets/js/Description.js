const { default: axios } = require('axios');

export default class Description {
  constructor(id, date, number, $el, loading) {
    this.id = id;
    this.date = date;
    this.all = number.all;
    this.current = number.current;
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
    this.getTrack(id);
  }

  async getTrack(id) {
    const track = await axios.get('https://us-central1-nowhere-web.cloudfunctions.net/track?i', {
      params: {
        id: id,
      },
    });
    this.$els.container.style.opacity = 1;
    this.$els.container.style.display = 'flex';
    this.loading.slideOut(() => {});
  }
}
