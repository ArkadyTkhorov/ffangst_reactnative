/** @module src/product/ProductFormScreenFields */

import React, { Component } from 'react';
import { View, Image, Text } from 'react-native';

import { productUnit } from '../../common/helpers';
import TextField from '../../common/TextField';
import Picker from '../../common/Picker';
import Switch from '../../common/Switch';
import PhoneField from '../../common/PhoneField';
import LocationPicker from '../../map/LocationPicker';
import styles from './ProductFormScreenFields.styles';


let announceTypes = [
  { label: 'Tilgjengelig', value: true },
  { label: 'Kommer', value: false }
];

let commTypes = [
  { label: 'Kun sende melding', value: 0 },
  { label: 'Kun ringe', value: 1 },
  { label: 'Kan ringe og sende melding', value: 2 }
];

/**
 * Form fields container for ProductFormScreen
 * @extends React.Component
 */
class ProductFormScreenFields extends Component {
  constructor(props) {
    super(props);

    this.state = { isPriceValid: false, isPricePristine: true, isPhoneValid: false };
  }

  componentWillReceiveProps(nextProps) {
    const { fields } = nextProps;

    this.setState({
      isPhoneValid: fields.commType === 0 || fields.phone.length >= PhoneField.maxLength,
      isPriceValid: fields.price > 0
    });
  }

  onChange = (field, value) => {
    if (field === 'price') this.setState({ isPricePristine: false });

    this.props.onChange(field, value);
  };

  units = [0, 1, 2, 3].map(unit => ({ label: productUnit(unit), value: unit }));

  render() {
    const { isPriceValid, isPricePristine, isPhoneValid } = this.state;
    const { fields, data, navigation } = this.props;
    const { categories, categoryId, subcategories, groups } = data;

    return (
      <View style={styles.container}>
        <TextField
          name="title"
          label="Title"
          maxLength={100}
          containerStyle={styles.textField}
          value={fields.title}
          onChangeText={this.onChange}
        />
        {/* <View style={{flexDirection: 'row'}}>
          <View style={styles.pickerContainer}>
            <Picker
              name="categoryId"
              label='Kategori'
              items={categories}
              style={styles.picker}
              selectedValue={categoryId}
              onValueChange={this.onChange}
            />
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              name="subcategoryId"
              label="Underkategori"
              items={subcategories}
              selectedValue={fields.subcategoryId}
              style={styles.picker}
              onValueChange={this.onChange}
            />
          </View>
        </View> */}
        {/* {fields.groupId != null && (
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Gruppe</Text>
            <Picker
              name="groupId"
              items={groups}
              selectedValue={fields.groupId}
              style={styles.picker}
              onValueChange={this.onChange}
            />
          </View>
        )} */}
        <View style={styles.fieldRow}>
          <TextField
            name="price"
            label="Pris (NOK)*"
            keyboardType="numeric"
            value={isPriceValid ? fields.price.toString() : ''}
            error={isPricePristine || isPriceValid ? '' : 'Prisen kan ikke være mindre eller lik null'}
            containerStyle={styles.textField}
            onChangeText={this.onChange}
          />
          <View style={styles.pickerContainer}>
            <Picker
              name="unit"
              label="Pris per"
              items={this.units}
              selectedValue={fields.unit}
              style={styles.picker}
              onValueChange={this.onChange}
            />
          </View>
        </View>
        <View style={styles.debio}>
          <View style={styles.debioSwitch}>
            <Switch name="debOne" value={fields.debOne} onValueChange={this.onChange} />
          </View>
          <View style={styles.debioInfo}>
            <Text style={styles.debioTitle}>Debio Økologisk</Text>
            <Text>Annonsen vil bli merket som et &quot;Debio økologisk&quot; produkt</Text>
          </View>
          <View style={styles.debioExample}>
            <Image source={require('./img/debio-one-example.png')} resizeMode="cover" />
          </View>
        </View>
        <TextField
          name="description"
          onChangeText={this.onChange}
          multiline
          autoGrow
          label="Description"
          maxLength={512}
          maxHeight={256}
          value={fields.description}
          containerStyle={styles.textField}
        />
        <View style={styles.pickerContainer}>
          <Picker
            name="inStock"
            label="Kunngjøres som"
            onValueChange={this.onChange}
            //selectedValue={fields.inStock}
            items={announceTypes}
            style={styles.picker}
          />
        </View>
        <View style={styles.pickerContainer}>
          <Picker
            name="inStock"
            label="Begrepet annonse"
            onValueChange={this.onChange}
            //selectedValue={fields.inStock}
            items={announceTypes}
            style={styles.picker}
          />
        </View>
        <LocationPicker
          name="address"
          label="Plassering*"
          lat={fields.lat}
          lon={fields.lon}
          address={fields.address}
          navigation={navigation}
          containerStyle={styles.textField}
          onSelect={this.onChange}
        />
        <PhoneField
          name="phone"
          onChangeText={this.onChange}
          value={fields.phone}
          error={isPhoneValid ? '' : 'Telefonnummer må oppgis for å aktivere telefonsamtaler'}
          containerStyle={styles.textField}
        />
        <View style={styles.pickerContainer}>
          <Picker
            name="commType"
            label="Kommunikasjonsinnstilling"
            onValueChange={this.onChange}
            selectedValue={fields.commType}
            items={commTypes}
            style={styles.picker}
          />
        </View>
      </View>
    );
  }
}

export default ProductFormScreenFields;
