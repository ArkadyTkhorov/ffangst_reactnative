/** @module src/market/product/FavProductsScreenHeader */

import React, { Component } from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { palette, header } from '../../common/styles';
import { getStateParam } from '../../common/helpers';
import DrawerOpener from '../../common/DrawerOpener';
import HeaderButton from '../../common/HeaderButton';

/*
 * Header for FavProductsScreen.
 * @extends React.PureComponent
 */
class FavProductsScreenHeader extends Component {
  onDeletePress = () => {
    const { navigation } = this.props;
    const mode = getStateParam(navigation, 'mode', 'default');

    if (mode === 'default') {
      navigation.setParams({ mode: 'select' });
    } else if (mode === 'select') {
      navigation.setParams({ mode: 'delete' });
    }
  }

  cancelSelection = () => {
    this.props.navigation.setParams({ mode: 'default', count: 0 });
  }

  render() {
    const { navigation } = this.props;
    const mode = getStateParam(navigation, 'mode', 'default');
    const count = getStateParam(navigation, 'count', 0);

    return (
      <View style={header.default}>
        <View style={header.sectionLeft}>
          {mode === 'default' ? (
            <DrawerOpener navigate={navigation.navigate} />
          ) : (
            <HeaderButton onPress={this.cancelSelection}>
              <Icon name="arrow-back" size={22} color={palette[0]} />
            </HeaderButton>
          )}
          <Text style={header.text}>{mode === 'default' ? 'Favoritter' : `Valgt: ${count}`}</Text>
        </View>
        <View style={header.sectionRight}>
          <HeaderButton onPress={this.onDeletePress}>
            <Icon name="delete" size={22} color={palette[0]} />
          </HeaderButton>
        </View>
      </View>
    );
  }
}

export default FavProductsScreenHeader;
