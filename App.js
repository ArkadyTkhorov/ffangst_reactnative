import React, { Component } from 'react';
import { StatusBar, View } from 'react-native';
import Moment from 'moment';
import MomentNBLocale from 'moment/locale/nb';

import { palette } from './src/common/styles';
import AppNavigator from './src/AppNavigator';
import FCMClient from './src/FCMClient';
import styles from './App.styles';

// Disable message in the bottom
console.disableYellowBox = true;

class App extends Component {
  componentDidMount() {
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor(`${palette[1]}15`);

    Moment.updateLocale('nb', MomentNBLocale);
  }

  render() {
    return (
      <View style={styles.container}>
        <FCMClient />
        <AppNavigator />
      </View>
    );
  }
}

export default App;
