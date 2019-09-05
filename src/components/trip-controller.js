import {EventList, EmptyEventList} from './trip-event-list';
import {TripDay} from './trip-day';
import {render, calcPrice} from '../utils';
import {TripDayList} from './trip-day-list';
import {Sort} from './sort';
import {PointController} from './point-controller';

export class TripController {
  constructor(events, container, totalPriceElement) {
    this._events = events;
    this._container = container;
    this._sort = new Sort();
    this._days = new TripDayList();
    this._views = [];
    this._onDataChange = this._onDataChange.bind(this);
    this._onChangeView = this._onChangeView.bind(this);
    this._totalPriceElement = totalPriceElement;
    this._eventContainer = null;
  }

  _onSortLinkClick(evt) {
    if (evt.target.tagName[0] !== `L`) {
      return;
    }
    evt.preventDefault();
    evt.target.form.querySelector(`#sort-${evt.target.dataset.sortType}`).checked = true;

    this._container.innerHTML = ``;
    this._sort.getElement().querySelector(`.trip-sort__item--day`).innerHTML = ``;
    render(this._container, this._sort.getElement());
    switch (evt.target.dataset.sortType) {
      case `time`:
        this._renderSortedEvents((a, b) => (a.timeEnd - a.timeStart) - (b.timeEnd - b.timeStart));
        break;
      case `price`:
        this._renderSortedEvents((a, b) => a.price - b.price);
        break;
      default:
        this._renderDayEvents();
        this._sort.getElement().querySelector(`.trip-sort__item--day`).innerHTML = `Day`;
        break;
    }
  }

  _renderEvents(container, events) {
    events.forEach((event) => {
      const point = new PointController(event, container, this._onDataChange, this._onChangeView);
      this._views.push(point._activateView.bind(point));
    });
    this._totalPriceElement.textContent = calcPrice(this._events);
  }

  _renderSortedEvents(sorting) {
    this._days.getElement().innerHTML = ``;
    const tripDays = this._events.length > 0 ? new TripDayList() : new EmptyEventList();
    render(this._container, tripDays.getElement());
    this._days = tripDays;
    const tripDay = new TripDay();
    render(tripDays.getElement(), tripDay.getElement());
    this._eventContainer = new EventList();
    render(tripDay.getElement(), this._eventContainer.getElement());
    this._renderEvents(this._eventContainer, this._events.slice().sort(sorting));
  }

  _renderDayEvents() {
    this._days.getElement().innerHTML = ``;
    const tripDays = this._events.length > 0 ? new TripDayList() : new EmptyEventList();
    render(this._container, tripDays.getElement());
    this._days = tripDays;
    const days = new Set(this._events.map(({timeStart}) => (new Date(timeStart)).setHours(0, 0, 0, 0)));
    Array.from(days).forEach((day, index) => {
      let dayElement = new TripDay(day, index + 1).getElement();
      render(tripDays.getElement(), dayElement);
      this._eventContainer = new EventList();
      render(dayElement, this._eventContainer.getElement());
      const dayEvents = this._events.filter(({timeStart}) => new Date(day).toLocaleDateString() === new Date(timeStart).toLocaleDateString());
      this._renderEvents(this._eventContainer, dayEvents);
    });
  }

  init() {
    render(this._container, this._sort.getElement());
    this._renderDayEvents(this._events);
    this._sort.getElement().addEventListener(`click`, (evt) => this._onSortLinkClick(evt));
  }

  hide() {
    const classes = this._days.getElement().classList;
    if (!classes.contains(`visually-hidden`)) {
      classes.add(`visually-hidden`);
    }
  }

  show() {
    const classes = this._days.getElement().classList;
    if (classes.contains(`visually-hidden`)) {
      classes.remove(`visually-hidden`);
    }
  }

  _onDataChange(oldData, newData) {
    const index = this._events.findIndex((event) => event === oldData);
    if (newData === null) {
      this._events = [...this._events.slice(0, index), ...this._events.slice(index + 1)];
    } else if (oldData === null) {
      this._events = [newData, ...this._events];
    } else {
      this._events[index] = newData;
    }
    this._renderDayEvents(this._events);
  }

  _onChangeView() {
    this._views.forEach((activateView) => activateView());
  }

  createEvent() {
    let event = {
      type: {
        title: `drive`, type: `transport`, offers: []
      },
      destination: {name: ``, description: ``, photo: []},
      timeStart: Date.now(),
      timeEnd: Date.now(),
      price: 0,
      isFavorite: false
    };
    event.offers = [];
    // eslint-disable-next-line no-new
    const newPoint = new PointController(event, this._days, this._onDataChange, this._onChangeView, true);
  }
}
