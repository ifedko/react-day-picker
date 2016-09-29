import React, { Component } from 'react';
import DayPicker, { DateUtils } from '../../../src';
import moment from 'moment';

import '../../../src/style.css';

const overlayStyle = {
  position: 'absolute',
  background: 'white',
  boxShadow: '0 2px 5px rgba(0, 0, 0, .15)',
};

const fetchDisabledDates = (monthDate) => {
  const randomDate = (startDate, endDate) => {
    return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
  };

  const randomDates = (year, month, countDates = 1) => {
    const
        firstDate = new Date(year, month, 1),
        lastDate = new Date(year, month + 1, 0);

    let randomDates = [];
    for (let i = 0; i < countDates; i++) {
      randomDates.push(randomDate(firstDate, lastDate));
    }

    return randomDates;
  };

  const
      year = monthDate.getFullYear(),
      month = monthDate.getMonth(),
      countDates = 5;
  return randomDates(year, month, countDates);
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
    this.setState({
      showOverlay: true,
    });
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
    const disabledDays = (this.state.disabledDays || []);
    return disabledDays.find((disabledDay) => {
          const date = DateUtils.clone(day);
          const disabledDate = DateUtils.clone(disabledDay);

          date.setHours(0, 0, 0, 0);
          disabledDate.setHours(0, 0, 0, 0);
          return (date.getTime() === disabledDate.getTime());
        }) !== undefined;
  }

  fetchDisabledDays (day) {
    const monthDisabledDays = fetchDisabledDates(day);
    this.setState({
      disabledDays: monthDisabledDays
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
                initialMonth={this.state.selectedDay}
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
