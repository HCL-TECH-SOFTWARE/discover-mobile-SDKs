import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { PRODUCTS } from '../data/dummy';
import { useCart } from '../context/CartContext';
import { HCLDiscoverTextInput as TextInput } from
  'react-native-hcl-discover';

type ProductScreenProps = NativeStackScreenProps<RootStackParamList, 'Product'>;

const ProductScreen: React.FC<ProductScreenProps> = ({ route, navigation }) => {
  const { productId } = route.params;
  const product = PRODUCTS.find(p => p.id === productId);
  const [quantity, setQuantity] = useState('1');
  const { addToCart } = useCart();

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Product not found</Text>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      image: product.image,
    });

    Alert.alert(
      'Success',
      `${product.name} added to cart`,
      [
        {
          text: 'Continue Shopping',
          onPress: () => navigation.goBack(),
          style: 'default',
        },
        {
          text: 'Go to Cart',
          onPress: () => navigation.navigate('Cart'),
          style: 'default',
        },
      ]
    );
  };

  const incrementQuantity = () => {
    const current = parseInt(quantity, 10) || 0;
    setQuantity((current + 1).toString());
  };

  const decrementQuantity = () => {
    const current = parseInt(quantity, 10) || 1;
    if (current > 1) {
      setQuantity((current - 1).toString());
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Product Image */}
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
        />

        {/* Product Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.detailedDescription}</Text>
          </View>

          {/* Quantity Section */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={decrementQuantity}
                activeOpacity={0.7}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.quantityInput}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
                maxLength={3}
              />
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={incrementQuantity}
                activeOpacity={0.7}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  productImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#E8F0FE',
    resizeMode: 'cover',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E74C3C',
    marginBottom: 20,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 22,
  },
  quantitySection: {
    marginBottom: 24,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#3498DB',
    fontWeight: '600',
  },
  quantityInput: {
    flex: 1,
    height: 44,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  addToCartButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ProductScreen;
