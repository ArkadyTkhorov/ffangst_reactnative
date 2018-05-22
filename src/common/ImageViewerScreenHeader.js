/** @module src/map/ImageViewerScreenHeader */

import React, { Component }  from 'react';
import { Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
//import LinearGradient from 'react-native-linear-gradient';

import { getStateParam } from './helpers';
import { header, palette } from './styles';
import HeaderButton from './HeaderButton';
import styles from './ImageViewerScreenHeader.styles';

/**
 * Header component for ImageViewerScreen.
 * @extends Component
 */
class ImageViewerScreenHeader extends Component {
  goBack = () => {
    this.props.navigation.goBack();
  };

  gradient = [palette[1], `${palette[1]}10`];

  render() {
    const { navigation } = this.props;

    return (
      <View colors={this.gradient} style={styles.container}>
        <HeaderButton onPress={this.goBack}>
          <Icon name="arrow-back" size={22} color={palette[0]} />
        </HeaderButton>
        <Text style={header.text}>
          {`${getStateParam(navigation, 'index', 0) + 1} / ${getStateParam(navigation, 'images', []).length}`}
        </Text>
      </View>
    );
  }
}

ImageViewerScreenHeader.defaultProps = {
  index: 0,
  total: 0,
  goBack() {}
};

export default ImageViewerScreenHeader;
