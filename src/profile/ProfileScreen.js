/** @module src/profile/ProfileScreen */

import React, { Component } from 'react';
import {
  View,
  ScrollView,
  Text,
  RefreshControl,
  StyleSheet,
  BackHandler
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
//mport LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast';

import { markRouteAsActive } from '../AppNavigator';
import { palette, header, placeholders } from '../common/styles';
import { getStateParam, bindComponentMethod, bindComponentRef } from '../common/helpers';
import Touchable from '../common/Touchable';
import ActionButton from '../common/ActionButton';
import MapStatic from '../map/MapStatic';
import authService from '../auth/authService';
import ProductCards from '../market/product/ProductCards';
import profileService from './profileService';
import ProfileInfo from './ProfileInfo';
import ProfileComActions from './ProfileComActions';
import ProfileScreenHeader from './ProfileScreenHeader';
import LogoutConfirm from './LogoutConfirm';
import styles from './ProfileScreen.styles';

/**
 * Profile screen component.
 * @extends Component
 */
class ProfileScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    header: <ProfileScreenHeader navigation={navigation} />
  });

  constructor(props) {
    super(props);

    const stickyHeaderStyles = StyleSheet.flatten(header.sticky);

    this.state = {
      stickyHeaderHeight: 0,
      stickyHeaderTopMargin: -(stickyHeaderStyles.minHeight + stickyHeaderStyles.paddingTop),
      infoContainerHeight: 0,
      isLoading: true,
      isOwnProfile: getStateParam(props.navigation, 'isOwnProfile', false),
      profileLoaded: false,
      activeTab: 'inStock',
      productsReqParams: { offset: null, limit: 20, inStock: true, author: 1 },
      profile: {}
    };

    this.profileRequest = profileService.get(this.state.isOwnProfile ?
      authService.getUser().userId :
      getStateParam(props.navigation, 'id', 0)
    );
  }

  componentDidMount() {
    this.loadProfile();

    BackHandler.addEventListener('hardwareBackPress', () => {
      if (this.state.isOwnProfile) {
        this.props.navigation.navigate('Market');

        markRouteAsActive('Market');

        return true;
      }

      return false;
    });
  }

  componentWillUnmount() {
    this.profileRequest.abort();

    BackHandler.removeEventListener('hardwareBackPress');
  }

  onScroll = ({ nativeEvent }) => {
    const { y: yOffset } = nativeEvent.contentOffset;
    const { stickyHeaderHeight, stickyHeaderTopMargin, infoContainerHeight } = this.state;
    const targetYOffset = infoContainerHeight + 10;

    if (yOffset >= targetYOffset && stickyHeaderTopMargin < 0) {
      this.setState({ stickyHeaderTopMargin: 0 });
    } else if (yOffset < targetYOffset && stickyHeaderTopMargin === 0) {
      this.setState({ stickyHeaderTopMargin: -stickyHeaderHeight });
    }
  };

  onInfoContainerLayoutChange = ({ nativeEvent }) => {
    this.setState({ infoContainerHeight: nativeEvent.layout.height });
  };

  onStickyHeaderLayoutChange = ({ nativeEvent }) => {
    if (this.state.stickyHeaderHeight === 0) {
      const { height } = nativeEvent.layout;

      this.setState({ stickyHeaderHeight: height, stickyHeaderTopMargin: -height });
    }
  };

  onTabPress = (type) => {
    const inStock = type === 'inStock';

    this.setState({
      activeTab: inStock ? 'inStock' : 'inOrder',
      productsReqParams: { ...this.state.productsReqParams, inStock }
    });
  };

  onLogout = () => {
    this.props.navigation.navigate('Auth');
  };

  getProfile = async () => {
    try {
      return await this.profileRequest.run();
    } catch (e) {
      throw e;
    }
  };

  loadProfile = async () => {
    this.setState({ isLoading: true });

    try {
      const profile = await this.getProfile();

      this.setState({
        profile,
        profileLoaded: true,
        productsReqParams: { ...this.state.productsReqParams, author: profile.userId }
      }, () => {
        this.props.navigation.setParams({
          profileLoaded: true,
          isOwnProfile: this.state.isOwnProfile
        });
      });
    } catch (e) {
      Toast.show(e.toString(), 2000);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  refreshProfile = async () => {
    try {
      this.setState({ profile: await this.getProfile() });
    } catch (e) {
      Toast.show(e.toString(), 2000);
    }
  };

  navToProductScreen = (product) => {
    const { navigation } = this.props;

    navigation.navigate('Product', {
      id: product.id,
      onGoBack: this.refsCache.get('products').refreshProducts
    });
  }

  navToProductForm = () => {
    this.props.navigation.navigate('ProductForm', {
      onGoBack: this.refsCache.get('products').refreshProducts
    });

    markRouteAsActive('NewProduct');
  };

  showAddressOnMap = () => {
    const { lat: latitude, lon: longitude, address } = this.state.profile;

    this.props.navigation.navigate('ShowOnMap', { latitude, longitude, address });
  };

  mapPlaceholderGradient = [`${palette[3]}60`, `${palette[3]}70`, palette[3]];

  mapStyle = [{ stylers: [{ saturation: -60 }, { lightness: -25 }] }];

  keyExtractor = item => item;

  renderStickyHeader = () => {
    const { profile, activeTab } = this.state;

    return (
      <View style={{ marginTop: this.state.stickyHeaderTopMargin }}>
        <View style={header.sticky} onLayout={this.onStickyHeaderLayoutChange}>
          <Text style={styles.nameHeader} numberOfLines={1}>
            {this.state.isOwnProfile ? profile.name : 'Min Profil'}
          </Text>
        </View>
        <View style={styles.tabs}>
          <Touchable onPress={bindComponentMethod.call(this, this.onTabPress, 'inStock')}>
            <View style={activeTab === 'inStock' ? styles.activeTab : styles.tab}>
              <Text style={styles.tabLabel}>TILGJENGELIG ({profile.inStock})</Text>
            </View>
          </Touchable>
          <Touchable onPress={bindComponentMethod.call(this, this.onTabPress, 'inOrder')}>
            <View style={activeTab === 'inOrder' ? styles.activeTab : styles.tab}>
              <Text style={styles.tabLabel}>KOMMER ({profile.posts - profile.inStock})</Text>
            </View>
          </Touchable>
        </View>
      </View>
    );
  };

  renderMapPlaceholder = () => (
    <View colors={this.mapPlaceholderGradient} style={styles.mapPlaceholder}>
      <Icon name="map" size={48} color={`${palette[3]}30`} />
    </View>
  );

  renderInfoContainer = () => {
    const { profile } = this.state;

    return (
      <View style={styles.infoContainer} onLayout={this.onInfoContainerLayoutChange}>
        <View style={styles.map}>
          <MapStatic
            lat={profile.lat}
            lon={profile.lon}
            showMarker
            customMapStyle={this.mapStyle}
            onPress={this.showAddressOnMap}
            onMarkerPress={this.showAddressOnMap}
            placeholder={this.renderMapPlaceholder}
          />
        </View>
        <View style={styles.profile}>
          <ProfileInfo
            profile={profile}
            disableTouch
            avatarStyle={styles.avatar}
            onlineStyle={styles.onlineStatus}
            nameStyle={styles.name}
            locationStyle={styles.location}
          />
        </View>
      </View>
    );
  };

  render() {
    const { profile, profileLoaded, isOwnProfile, isLoading, stickyHeaderTopMargin } = this.state;
    const { navigation } = this.props;

    return (
      <View style={styles.container}>
        {profileLoaded ? (
          <ProductCards
            ref={bindComponentRef.call(this, 'products')}
            renderSectionHeader={this.renderStickyHeader}
            renderListHeader={this.renderInfoContainer}
            onScroll={this.onScroll}
            params={this.state.productsReqParams}
            extraData={{ stickyHeaderTopMargin }}
            onCardPress={this.navToProductScreen}
            onRefresh={this.refreshProfile}
            stickySectionHeadersEnabled
          />
        ) : (
          <ScrollView refreshControl={<RefreshControl refreshing={isLoading} onRefresh={this.loadProfile} />}>
            {!isLoading && <Text style={placeholders.emptyComponentText}>Trekk for å oppdatere</Text>}
          </ScrollView>
        )}
        {profileLoaded && !isOwnProfile && (
          <ProfileComActions
            commType={profile.phone ? 2 : 0}
            phone={profile.phone}
            name={profile.name}
            uid={profile.userId}
            navigation={navigation}
          />
        )}
        <LogoutConfirm
          visible={getStateParam(navigation, 'showLogoutConfirm', false)}
          onLogout={this.onLogout}
        />
        {profileLoaded && isOwnProfile && (
          <ActionButton containerStyle={styles.newProduct} onPress={this.navToProductForm}>
            <Icon name="add" size={25} color={palette[0]} />
          </ActionButton>
        )}
      </View>
    );
  }
}

export default ProfileScreen;
