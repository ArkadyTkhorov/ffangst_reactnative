import React from 'react';
import { Text, Image, StyleSheet } from 'react-native';
import { TabNavigator } from 'react-navigation';
import CategoryNavigator from './CategoryNavigator';
import categoryStore from './categoryStore';
import { palette } from '../../common/styles';

const styles = StyleSheet.create({
  tabBarLabel: {
    color: palette[0],
    display: 'none',
    fontWeight: 'normal',
    textAlign: 'center'
  },
  tabBarLabelFocused: { display: 'flex', flex: 1 }
});

/**
 * Tab navigator component for Market module categories.
 * @returns React.Component
 */
const CategoriesNavigator = TabNavigator({
  Seafood: { screen: CategoryNavigator },
  Nature: { screen: CategoryNavigator },
  Farm: { screen: CategoryNavigator },
  Services: { screen: CategoryNavigator },
  EasterEggs: { screen: CategoryNavigator }
}, {
    initialRouteName: 'Seafood',
    tabBarPosition: 'bottom',
    lazy: true,
    tabBarOptions: {
      upperCaseLabel: false,
      showIcon: true,
      indicatorStyle: { display: 'none' },
      style: { backgroundColor: palette[2], height: 98 }
    },
    navigationOptions: ({ navigation }) => {
      const category = categoryStore.find(cat => cat.route === navigation.state.routeName);

      return {
        header: null,
        tabBarLabel: ({ focused }) => (
          <Text
            style={[styles.tabBarLabel, focused && styles.tabBarLabelFocused]}
          >
            {category.id === 3 ? 'Gårds\nprodukter' : category.title}
          </Text>
        ),
        tabBarIcon: () => <Image source={category.icon} />
      };
    }
  });

export default CategoriesNavigator;
