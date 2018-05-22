/** @module src/camera/PhotoPreviewScreen.styles */

import { StyleSheet } from 'react-native';

import { palette } from '../common/styles';

/**
 * Stylesheet for photo preview screen component.
 * @type {StyleSheet}
 */
const styles = StyleSheet.create({
  container: {
    backgroundColor: palette[1],
    flex: 1
  },
  image: {
    flex: 1,
    resizeMode: 'contain'
  },
  button: {
    borderRadius: 50,
    bottom: 30,
    elevation: 3,
    position: 'absolute'
  },
  buttonSubmit: {
    right: 30
  },
  buttonCancel: {
    backgroundColor: palette[0],
    left: 30
  }
});

export default styles;

