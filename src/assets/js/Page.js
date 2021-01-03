import { TweenLite as TM } from 'gsap/dist/gsap';

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
    this.initPage();
  }

  initPage() {
    for (let page = 1; page <= this.pageCount; page++) {
      const tensDispNumber = parseInt(page / 10);
      if (!this.tensNumberAlreadyExists(tensDispNumber)) {
        const tensNextPageElem = document.createElement('p');
        tensNextPageElem.innerText = tensDispNumber;
        tensNextPageElem.classList.add('tens');
        this.$els.tensBlock.append(tensNextPageElem);
      }
      const onesDispNumber = Math.floor((page / 1) % 10) + 1;
      if (!this.onesNumberAlreadyExists(onesDispNumber)) {
        const onesNextPageElem = document.createElement('p');
        onesNextPageElem.innerText = onesDispNumber;
        onesNextPageElem.classList.add('ones');
        this.$els.onesBlock.append(onesNextPageElem);
      }
    }
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
      TM.to(this.$els.tensBlock, 0.2, {
        transform: `translateY(${tensDispNumber * -24}px)`,
      });
    }
    const onesDispNumber = Math.floor((page / 1) % 10) + 1;
    TM.to(this.$els.onesBlock, 0.2, {
      transform: `translateY(${(onesDispNumber - 1) * -24}px)`,
    });
  }
}
