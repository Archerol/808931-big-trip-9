import {render} from '../utils';
import {Event} from './trip-event';
import {EventEdit} from './trip-event-edit-form';
import {offers as offersStack, destinations, eventTypes} from '../data';
import moment from 'moment';

export class PointController {
  constructor(event, container, onDataChange, onChangeView) {
    this._event = event;
    this._container = container;
    this._onDataChange = onDataChange;
    this._onChangeView = onChangeView;
    this._eventComponent = new Event(event);
    this._eventEditComponent = new EventEdit(event, offersStack);

    this.init();
  }

  _activateView() {
    if (this._container.getElement().contains(this._eventEditComponent.getElement())) {
      this._container.getElement().replaceChild(this._eventComponent.getElement(), this._eventEditComponent.getElement());
      this._eventEditComponent.resetForm();
    }
  }

  _renderEvent() {
    const activateEdit = () => {
      this._onChangeView();
      if (this._container.getElement().contains(this._eventComponent.getElement())) {
        this._container.getElement().replaceChild(this._eventEditComponent.getElement(), this._eventComponent.getElement());
        document.addEventListener(`keydown`, onEscKeyDown);
      }
    };

    const onEscKeyDown = (evt) => {
      if (evt.key === `Escape` || evt.key === `Esc`) {
        this._activateView();
        document.removeEventListener(`keydown`, onEscKeyDown);
      }
    };

    this._eventComponent.getElement().querySelector(`.event__rollup-btn`).addEventListener(`click`, () => activateEdit());
    this._eventEditComponent.getElement().querySelector(`.event--edit`).addEventListener(`submit`, (evt) => {
      evt.preventDefault();
      const formData = new FormData(this._eventEditComponent.getElement().querySelector(`.event--edit`));
      const selectedEventType = eventTypes.find(({title}) => title === formData.get(`event-type`));
      const destination = destinations.find(({name}) => name === formData.get(`event-destination`));
      const entry = {
        type: selectedEventType ? selectedEventType : this._event.type,
        destination: destination ? destination : {name: formData.get(`event-destination`), description: ``, photo: []},
        timeStart: moment(formData.get(`event-start-time`), `DD.MM.YYYY HH:mm`),
        timeEnd: moment(formData.get(`event-end-time`), `DD.MM.YYYY HH:mm`),
        price: formData.get(`event-price`),
        offers: offersStack.reduce(((res, offer) => formData.get(`event-offer-${offer.name}`) === `on` ? [...res, offer] : [...res]), []),
        isFavorite: formData.get(`event-favorite`) === `on`,
      };

      this._onDataChange(this._event, entry);
      this._activateView();
      document.removeEventListener(`keydown`, onEscKeyDown);
    });
    this._eventEditComponent.getElement().querySelector(`.event__rollup-btn`).addEventListener(`click`, () => {
      this._activateView();
      document.addEventListener(`keydown`, onEscKeyDown);
    });
    render(this._container.getElement(), this._eventComponent.getElement());
  }

  init() {
    this._renderEvent(this._event);
  }

}
