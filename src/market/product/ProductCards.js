/** @module src/market/product/ProductCards */

import React, { Component } from 'react';
import {
  View,
  SectionList,
  Text,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import Toast from 'react-native-toast';

import { calcGrid } from '../../common/helpers';
import { placeholders } from '../../common/styles';
import productService from '../product/productService';
import ProductCard from './ProductCard';
import styles from './ProductCards.styles';

/**
 * List component of ProductCard components.
 * @extends React.PureComponent
 */
class ProductCards extends Component {
  constructor(props) {
    super(props);

    this.state = {
      screenWidth: 0,
      colMinWidth: 160,
      colWidth: 160,
      cols: 1,
      isLoading: false,
      isUpdating: false,
      isRefreshing: false,
      products: [],
      total: 0
    };

    this.request = productService.all();
  }

  componentDidMount() {
    if (this.props.loadOnMount) {
      this.loadProducts();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.params !== prevProps.params) {
      this.loadProducts();
    }
  }

  componentWillUnmount() {
    this.request.abort();
  }

  onLayoutChange = ({ nativeEvent }) => {
    const { width } = nativeEvent.layout;

    if (width !== this.state.screenWidth) {
      const grid = calcGrid(width - 10, this.state.colMinWidth);

      this.setState({
        screenWidth: width,
        cols: grid.cols,
        colWidth: grid.colWidth
      });
    }
  };

  onEndReached = () => {
    const { products, total, isUpdating } = this.state;

    if (products.length > 0 && products.length < total && !isUpdating) {
      this.updateProducts();
    }
  };

  onRefresh = () => {
    if (!this.state.isRefrshing) {
      this.refreshProducts();
    }
  };

  getProducts = async (params) => {
    this.request.abort();

    try {
      const response = this.props.onResponse(await this.request.params(params).run());

      this.setState({ total: response.total });

      return response.data;
    } catch (e) {
      Toast.show(e.toString(), 2000);
      return [];
    }
  };

  loadProducts = async () => {
    this.setState({ isLoading: true, products: [] });

    try {
      this.setState({ products: await this.getProducts(this.props.params) });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  refreshProducts = async () => {
    this.setState({ isRefreshing: true });

    try {
      const params = { ...this.props.params, offset: null };

      await this.props.onRefresh();

      this.setState({ products: await this.getProducts(params) });
    } finally {
      this.setState({ isRefreshing: false });
    }
  };

  updateProducts = async () => {
    this.setState({ isLoading: true });

    try {
      const params = { ...this.props.params, offset: this.state.products.length };

      this.setState({
        products: [...this.state.products, ...(await this.getProducts(params))]
      });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  keyExtractor = item => item.id;

  renderProductCard = item => (
    <View key={item.id} style={{ width: this.state.colWidth }}>
      <ProductCard
        product={item}
        toggleType={this.props.cardToggleType}
        selected={this.props.selected.indexOf(item.id) >= 0}
        onFavToggle={this.props.onCardFavToggle}
        onPress={this.props.onCardPress}
        onSelect={this.props.onCardSelect}
      />
    </View>
  );

  renderGridItem = ({ index }) => {
    let { cols } = this.state;
    let row = null;

    if (cols > 1 && index % cols === 0) {
      const { products } = this.state;
      const cells = [];

      if (index + cols > products.length) {
        cols = products.length - index;
      }

      for (let i = 0; i < cols; i++) {
        const item = products[index + i];

        cells.push(this.renderProductCard(item));
      }

      row = <View style={styles.row}>{cells}</View>;
    }

    return row;
  };

  renderLineItem = ({ item }) => this.renderProductCard(item);

  renderListFooter = () => {
    if (this.state.isLoading) {
      return <ActivityIndicator animate size="large" style={styles.updateIndicator} />;
    }

    if (this.state.products.length === 0) {
      return <Text style={placeholders.emptyComponentText}>Ingen annonser enda</Text>;
    }

    return null;
  };

  render() {
    const { horizontal } = this.props;
    if (this.state.products.length > 0)
    alert(JSON.stringify(this.state.products))
    console.log(this.state.products)

    return (
      <View
        style={horizontal ? styles.containerHorizontal : styles.container}
        onLayout={this.onLayoutChange}
      >
        <SectionList
          keyExtractor={this.keyExtractor}
          renderItem={horizontal ? this.renderLineItem : this.renderGridItem}
          renderSectionHeader={this.props.renderSectionHeader}
          ListHeaderComponent={this.props.renderListHeader}
          ListFooterComponent={this.renderListFooter}
          refreshControl={!this.props.disableRefreshControl ? (
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={this.onRefresh}
            />
          ) : null}
          sections={[{ data: this.state.products }]}
          extraData={{
            cardToggleType: this.props.cardToggle,
            selected: this.props.selected,
            ...this.props.extraData
          }}
          stickySectionHeadersEnabled={this.props.stickySectionHeadersEnabled}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={this.props.endThreshold}
          onScroll={this.props.onScroll}
          scrollEventThrottle={16}
          initialNumToRender={50}
          maxToRenderPerBatch={50}
          windowSize={50}
          removeClippedSubviews
          horizontal={horizontal}
        />
      </View>
    );
  }
}

ProductCards.defaultProps = {
  params: { offset: null, limit: 20 },
  loadOnMount: true,
  horizontal: false,
  showScrollBar: true,
  cardToggleType: '',
  selected: [],
  endThreshold: 0.01,
  renderSectionHeader: () => null,
  renderListHeader: () => null,
  stickySectionHeadersEnabled: false,
  disableRefreshControl: false,
  onResponse: response => response,
  onScroll() {},
  onCardFavToggle() {},
  onCardSelect() {},
  onCardPress() {},
  onRefresh() {}
};

export default ProductCards;
