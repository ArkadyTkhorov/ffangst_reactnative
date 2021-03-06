/** @module src/profile/ProfileInfo.styles */

import { StyleSheet } from 'react-native';

import { palette } from '../common/styles';

/**
 * Stylesheet for ProfileInfo.
 * @type {StyleSheet}
 */
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row'
  },
  info: {
    flex: 1,
    marginLeft: 25
  },
  onlineStatus: {
    color: palette[2],
    fontSize: 12
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 5
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  rowTitle: {
    flex: 1,
    fontSize: 16,
    marginLeft: 5
  }
});


export default styles;
