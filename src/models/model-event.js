import {eventTypes} from '../data';
import DOMpurify from 'dompurify';

export class ModelEvent {
  constructor(data) {
    this.id = DOMpurify.sanitize(data[`id`]);
    this.destination = data[`destination`];
    this.timeStart = data[`date_from`];
    this.timeEnd = data[`date_to`];
    this.price = DOMpurify.sanitize(data[`base_price`]);
    this.isFavorite = DOMpurify.sanitize(data[`is_favorite`]);
    this.type = this.findEventType(DOMpurify.sanitize(data[`type`]));
    this.offers = data.offers;
  }

  findEventType(type) {
    return eventTypes.find(({title})=> title === type);
  }

  static parseEvent(data) {
    return new ModelEvent(data);
  }

  static parseEvents(data) {
    return data.map(ModelEvent.parseEvent);
  }

  static eventForUpload(data) {
    const {
      destination,
      isFavorite,
      type,
      offers,
      price,
      timeStart,
      timeEnd
    } = data;
    return {
      'type': type.title,
      'date_from': timeStart.valueOf(),
      'date_to': timeEnd.valueOf(),
      destination,
      'is_favorite': isFavorite,
      offers,
      'base_price': Number(price)
    };
  }

}
