import React, { Component } from 'react';
import DayPicker, { DateUtils } from '../../../src';
import moment from 'moment';

import '../../../src/style.css';

const overlayStyle = {
  position: 'absolute',
  background: 'white',
  boxShadow: '0 2px 5px rgba(0, 0, 0, .15)',
};

let datesContainer = {};

const fetchDisabledDates = (monthDate) => {
  const
      year = monthDate.getFullYear(),
      month = monthDate.getMonth(),
      countDates = 5;

  const addDatesToDatesContainer = (datesContainer, year, month, dates) => {
    if (datesContainer[year] === undefined) {
      datesContainer[year] = {};
    }
    if (datesContainer[year][month] === undefined) {
      datesContainer[year][month] = [];
    }
    datesContainer[year][month] = dates;
  };

  const randomDates = (year, month, countDates = 1) => {
    const
        firstDate = new Date(year, month, 1),
        lastDate = new Date(year, month + 1, 0),
        randomDate = (startDate, endDate) => {
          return new Date(
              startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
          );
        };

    let randomDates = [];
    for (let i = 0; i < countDates; i++) {
      randomDates.push((randomDate(firstDate, lastDate)));
    }

    return randomDates;
  };

  let dates = [];
  if (!datesContainer[year] || !datesContainer[year][month] || datesContainer[year][month].length === 0) {
    dates = randomDates(year, month, countDates);
    addDatesToDatesContainer(datesContainer, year, month, dates);
  } else {
    dates = datesContainer[year][month];
  }

  return dates;
};

export default class InputFieldOverlayAdvanced extends Component {

  constructor(props) {
    super(props);
    this.handleDayClick = this.handleDayClick.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputFocus = this.handleInputFocus.bind(this);
    this.handleInputBlur = this.handleInputBlur.bind(this);
    this.handleContainerMouseDown = this.handleContainerMouseDown.bind(this);
    this.handleMonthChange = this.handleMonthChange.bind(this);
    this.isDisabledDay = this.isDisabledDay.bind(this);
    this.fetchDisabledDays = this.fetchDisabledDays.bind(this);
  }

  state = {
    showOverlay: false,
    value: '',
    selectedDay: null,
    disabledDays: []
  };

  componentWillMount() {
    const monthDay = (this.state.selectedDay || new Date());
    this.fetchDisabledDays(monthDay);
  }

  componentWillUnmount() {
    clearTimeout(this.clickTimeout);
  }

  input = null;
  daypicker = null;
  clickedInside = false;
  clickTimeout = null;

  handleContainerMouseDown() {
    this.clickedInside = true;
    // The input's onBlur method is called from a queue right after onMouseDown event.
    // setTimeout adds another callback in the queue, but is called later than onBlur event
    this.clickTimeout = setTimeout(() => {
      this.clickedInside = false;
    }, 0);
  }

  handleInputFocus() {
    // if calendar is shown, we need to prevent repeatly dates fetching and update state (when handleInputBlur)
    if (this.state.showOverlay === false) {
      const currentDay = (this.state.selectedDay || moment().toDate());
      this.fetchDisabledDays(currentDay);
      this.setState({
        showOverlay: true,
      });
    }
  }

  handleInputBlur() {
    const showOverlay = this.clickedInside;

    this.setState({
      showOverlay,
    });

    // Force input's focus if blur event was caused by clicking on the calendar
    if (showOverlay) {
      this.input.focus();
    }
  }

  handleInputChange(e) {
    const { value } = e.target;
    const momentDay = moment(value, 'L', true);
    if (momentDay.isValid()) {
      this.setState({
        selectedDay: momentDay.toDate(),
        value,
      }, () => {
        this.daypicker.showMonth(this.state.selectedDay);
      });
    } else {
      this.setState({ value, selectedDay: null });
    }
  }

  handleDayClick(e, day) {
    this.setState({
      value: moment(day).format('L'),
      selectedDay: day,
      showOverlay: false,
    });
    this.input.blur();
  }

  handleMonthChange (monthDay) {
    this.fetchDisabledDays(monthDay);
  }

  isDisabledDay (day) {
    return (this.state.disabledDays || []).find((disabledDay) => {
      return (DateUtils.isSameDay(disabledDay, day));
    }) !== undefined;
  }

  fetchDisabledDays (day) {
    const disabledDays = fetchDisabledDates(day);
    this.setState({
      disabledDays: disabledDays
    });
  }

  render() {
    return (
      <div onMouseDown={ this.handleContainerMouseDown }>
        <input
          type="text"
          ref={ el => { this.input = el; } }
          placeholder="DD/MM/YYYY"
          value={ this.state.value }
          onChange={ this.handleInputChange }
          onFocus={ this.handleInputFocus }
          onBlur={ this.handleInputBlur }
        />
        { this.state.showOverlay &&
          <div style={ { position: 'relative' } }>
            <div style={ overlayStyle }>
              <DayPicker
                ref={ el => { this.daypicker = el; } }
                initialMonth={ this.state.selectedDay || undefined }
                onDayClick={ this.handleDayClick }
                selectedDays={ day => DateUtils.isSameDay(this.state.selectedDay, day) }
                disabledDays={this.isDisabledDay}
                onMonthChange={this.handleMonthChange}
              />
            </div>
          </div>
        }
      </div>
    );
  }
}
