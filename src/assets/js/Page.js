import { TweenMax as TM } from 'gsap/all';

export default class Page {
  constructor($el, pageCount) {
    this.$els = {
      current: $el.querySelector('.page__current'),
      tensBlock: $el.querySelector('.tens-block'),
      onesBlock: $el.querySelector('.ones-block'),
      all: $el.querySelector('.page__all'),
    };
    this.$els.all.innerText = ('00' + pageCount).slice(-2);
    this.pageCount = pageCount;
  }

  onesNumberAlreadyExists(number) {
    const existedNumbers = [...this.$els.onesBlock.childNodes].map((v) => {
      return v.innerText;
    });
    return existedNumbers.includes(number.toString());
  }

  tensNumberAlreadyExists(number) {
    const existedNumbers = [...this.$els.tensBlock.childNodes].map((v) => {
      return v.innerText;
    });
    return existedNumbers.includes(number.toString());
  }

  next(page, prevPage) {
    const tensDispNumber = parseInt(page / 10);
    if (parseInt(prevPage / 10) != tensDispNumber) {
      if (!tensNumberAlreadyExists(tensDispNumber)) {
        const tensNextPageElem = document.createElement('p');
        tensNextPageElem.innerText = tensDispNumber;
        tensNextPageElem.classList.add('tens');
        this.$els.tensBlock.appendChild(tensNextPageElem);
      }
      TM.to(this.$els.tensBlock, 0.2, {
        transform: `translateY(${tensDispNumber * -24}px)`,
      });
    }
    const onesDispNumber = Math.floor((page / 1) % 10) + 1;
    if (!this.onesNumberAlreadyExists(onesDispNumber)) {
      const onesNextPageElem = document.createElement('p');
      onesNextPageElem.innerText = onesDispNumber;
      onesNextPageElem.classList.add('ones');
      this.$els.onesBlock.appendChild(onesNextPageElem);
    }
    TM.to(this.$els.onesBlock, 0.2, {
      transform: `translateY(${(onesDispNumber - 1) * -24}px)`,
    });
  }
}
