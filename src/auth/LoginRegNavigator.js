/** @module src/auth/LoginRegNavigator */

import React from 'react';
import { TabNavigator } from 'react-navigation';

import { palette } from '../common/styles';
import { platform } from '../common/helpers';
import DrawerOpener from '../common/DrawerOpener';
import LoginRegScreen from './LoginRegScreen';

/**
 * Navigator component for Login and Registration screens.
 * @returns Component
 */
const LoginRegNavigator = TabNavigator({
  Login: { screen: LoginRegScreen },
  Registration: { screen: LoginRegScreen }
}, {
  initialRouteName: 'Login',
  tabBarOptions: {
    indicatorStyle: { backgroundColor: palette[2] },
    labelStyle: { fontWeight: (platform.ios ? 'bold' : 'normal') },
    style: { backgroundColor: (palette[platform.ios ? 0 : 3]) },
    activeTintColor: palette[2]
  },
  tabBarPosition: 'top',
  navigationOptions: ({ navigation }) => ({
    headerLeft: <DrawerOpener navigate={navigation.navigate} />,
    tabBarLabel: (navigation.state.routeName === 'Login' ? 'Logg inn' : 'Registrering')
  })
});

export default LoginRegNavigator;
