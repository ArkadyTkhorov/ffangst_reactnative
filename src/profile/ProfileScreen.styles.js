/** @module src/profile/ProfileScreen.styles */

import { StyleSheet } from 'react-native';

import { palette, header } from '../common/styles';

const tab = {
  alignItems: 'center',
  borderColor: palette[0],
  borderWidth: 2,
  flex: 1,
  justifyContent: 'center',
  padding: 14
};

/**
 * Stylesheet for ProfileScreen.
 * @type {StyleSheet}
 */
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  infoContainer: {
    backgroundColor: palette[0]
  },
  map: {
    height: 220
  },
  mapPlaceholder: {
    alignItems: 'center',
    backgroundColor: palette[4],
    flex: 1,
    justifyContent: 'center'
  },
  profile: {
    marginTop: -60,
    paddingHorizontal: 15,
    paddingVertical: 10,
    zIndex: 2
  },
  avatar: {
    height: 88,
    width: 88
  },
  onlineStatus: {
    color: palette[0]
  },
  name: {
    color: palette[0],
    fontSize: 18,
    lineHeight: 24
  },
  nameHeader: {
    ...StyleSheet.flatten(header.text),
    width: '70%'
  },
  location: {
    paddingVertical: 5
  },
  tabs: {
    backgroundColor: palette[0],
    flex: 1,
    flexDirection: 'row',
    marginBottom: 15
  },
  tab,
  activeTab: {
    ...tab,
    borderBottomColor: palette[2]
  },
  tabLabel: {
    fontWeight: 'bold'
  },
  newProduct: {
    bottom: '5%'
  }
});

export default styles;
