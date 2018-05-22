/** @module src/common/PhoneField */

import React, { Component } from 'react';

import { isString } from './helpers';
import TextField from './TextField';

/**
 * Wrapper on src/common/TextField for phone number.
 * @extends Component
 */
class PhoneField extends Component {
  static code = '+47 ';

  static maxLength = 14

  static rexp = /(\+47)?\D?(\d{3})?\D?(\d{2})?\D?(\d{3})?/

  static formatter = (match, p1, p2, p3, p4) => {
    let res = PhoneField.code;

    if (p2) res += `${p2} `;
    if (p3) res += p3;
    if (p4) res += ` ${p4}`;

    return res;
  }

  static format = phone => (phone.length > 0 ? phone.replace(PhoneField.rexp, PhoneField.formatter) : '')

  componentDidMount() {
    if (isString(this.props.value)) {
      this.onChangeText(this.props.name, this.props.value);
    }
  }

  onChangeText = (field, value) => {
    this.props.onChangeText(field, PhoneField.format(value));
  };

  render() {
    return (
      <TextField
        {...this.props}
        label="Telefon"
        placeholder={`${PhoneField.code}XXX XX XXX`}
        maxLength={PhoneField.maxLength}
        keyboardType="numeric"
        onChangeText={this.onChangeText}
      />
    );
  }
}

PhoneField.defaultProps = {
  name: '',
  value: '',
  onChangeText() {}
};

export default PhoneField;
