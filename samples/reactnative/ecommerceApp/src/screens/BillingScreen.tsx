import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useCart } from '../context/CartContext';
import { CARD_TYPES, generateOrderId } from '../data/dummy';
import { BillingInfo } from '../context/CartContext';
import { HCLDiscoverTextInput as TextInput } from
  'react-native-hcl-discover';

type BillingScreenProps = NativeStackScreenProps<RootStackParamList, 'Billing'>;

const BillingScreen: React.FC<BillingScreenProps> = ({ navigation }) => {
  const { cartItems, createOrder } = useCart();
  const [formData, setFormData] = useState<BillingInfo>({
    cardNumber: '',
    cardName: '',
    cardType: CARD_TYPES[0],
    cvv: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{13,19}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Cardholder name is required';
    }

    if (!formData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (text: string): string => {
    const cleaned = text.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ');
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all fields correctly');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      const orderId = generateOrderId();
      const total = calculateTotal();
      createOrder(orderId, total);
      setIsProcessing(false);
      navigation.navigate('OrderConfirmation', { orderId });
    }, 2000);
  };

  const updateField = (field: keyof BillingInfo, value: string) => {
    let finalValue = value;

    // Format card number with spaces
    if (field === 'cardNumber') {
      finalValue = formatCardNumber(value);
    }

    // Only allow numbers for CVV
    if (field === 'cvv') {
      finalValue = value.replace(/[^0-9]/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [field]: finalValue,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const total = calculateTotal();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Payment Information</Text>
          <Text style={styles.subtitle}>
            Enter your credit card details
          </Text>

          {/* Card Number */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Card Number *</Text>
            <TextInput
              style={[styles.input, errors.cardNumber && styles.inputError]}
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChangeText={(value) => updateField('cardNumber', value)}
              placeholderTextColor="#BDC3C7"
              keyboardType="number-pad"
              maxLength={19}
            />
            {errors.cardNumber && (
              <Text style={styles.errorText}>{errors.cardNumber}</Text>
            )}
          </View>

          {/* Cardholder Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Cardholder Name *</Text>
            <TextInput
              style={[styles.input, errors.cardName && styles.inputError]}
              placeholder="John Doe"
              value={formData.cardName}
              onChangeText={(value) => updateField('cardName', value)}
              placeholderTextColor="#BDC3C7"
            />
            {errors.cardName && (
              <Text style={styles.errorText}>{errors.cardName}</Text>
            )}
          </View>

          {/* Card Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Card Type *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.cardType}
                onValueChange={(value) => updateField('cardType', value)}
                style={styles.picker}
              >
                {CARD_TYPES.map(type => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
            </View>
          </View>

          {/* CVV */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>CVV *</Text>
            <TextInput
              style={[styles.input, errors.cvv && styles.inputError]}
              placeholder="123"
              value={formData.cvv}
              onChangeText={(value) => updateField('cvv', value)}
              placeholderTextColor="#BDC3C7"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry={true}
            />
            {errors.cvv && (
              <Text style={styles.errorText}>{errors.cvv}</Text>
            )}
          </View>

          {/* Order Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping:</Text>
              <Text style={styles.summaryValue}>Free</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              isProcessing && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={isProcessing}
          >
            <Text style={styles.continueButtonText}>
              {isProcessing ? 'Processing...' : 'Complete Purchase'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            This is a demo app. No actual payment will be processed.
          </Text>
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
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2C3E50',
    backgroundColor: '#F9FAFB',
  },
  inputError: {
    borderColor: '#E74C3C',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    fontSize: 12,
    color: '#E74C3C',
    marginTop: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  picker: {
    height: 50,
  },
  summaryContainer: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 16,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C3E50',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E74C3C',
  },
  continueButton: {
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
  buttonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});

export default BillingScreen;
