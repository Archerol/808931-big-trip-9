import {EventList, EmptyEventList} from './trip-event-list';
import {TripDay} from './trip-day';
import {render} from '../utils';
import {TripDayList} from './trip-day-list';
import {Sort} from './sort';
import {PointController} from './point-controller';

export class TripController {
  constructor(events, container) {
    this._events = events;
    this._container = container;
    this._sort = new Sort();
    this._days = new TripDayList();
    this._views = [];
    this._onDataChange = this._onDataChange.bind(this);
    this._onChangeView = this._onChangeView.bind(this);
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
  }

  _renderSortedEvents(sorting) {
    this._days.getElement().innerHTML = ``;
    const tripDays = this._events.length > 0 ? new TripDayList() : new EmptyEventList();
    render(this._container, tripDays.getElement());
    this._days = tripDays;
    const tripDay = new TripDay();
    render(tripDays.getElement(), tripDay.getElement());
    const eventContainer = new EventList();
    render(tripDay.getElement(), eventContainer.getElement());
    this._renderEvents(eventContainer, this._events.slice().sort(sorting));
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
      const eventContainer = new EventList();
      render(dayElement, eventContainer.getElement());
      const dayEvents = this._events.filter(({timeStart}) => new Date(day).toLocaleDateString() === new Date(timeStart).toLocaleDateString());
      this._renderEvents(eventContainer, dayEvents);
    });
  }

  init() {
    render(this._container, this._sort.getElement());
    this._renderDayEvents(this._events);
    this._sort.getElement().addEventListener(`click`, (evt) => this._onSortLinkClick(evt));
  }

  _onDataChange(oldData, newData) {
    this._events[this._events.findIndex((event) => event === oldData)] = newData;
    this._renderDayEvents(this._events);
  }

  _onChangeView() {
    this._views.forEach((activateView) => activateView());
  }
}
