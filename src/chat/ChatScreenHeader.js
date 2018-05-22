/** @module src/chat/ChatScreenHeader */

import React, { Component } from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { palette, header } from '../common/styles';
import { getStateParam } from '../common/helpers';
import HeaderButton from '../common/HeaderButton';

/*
 * Header for ChatScreen.
 * @extends Component
 */
class ChatScreenHeader extends Component {
  goBack = () => {
    getStateParam(this.props.navigation, 'goBackHandler', () => {})();
  };

  render() {
    return (
      <View style={header.default}>
        <HeaderButton onPress={this.goBack}>
          <Icon name="arrow-back" size={20} color={palette[0]} />
        </HeaderButton>
        <Text style={header.text} numberOfLine={1}>{getStateParam(this.props.navigation, 'name', 'Meldinger')}</Text>
      </View>
    );
  }
}

export default ChatScreenHeader;
