import React from 'react';
import {
  TextInput as RNTextInput,
  type TextInputProps,
} from 'react-native';

import { useDiscoverTextInputHandler } from './DiscoverTextInputContext';

const HCLDiscoverTextInput = React.forwardRef<
  React.ElementRef<typeof RNTextInput>,
  TextInputProps
>((props, forwardedRef) => {
  const deviceKeyPressHandler = useDiscoverTextInputHandler();

  const internalRef = React.useRef<React.ElementRef<typeof RNTextInput> | null>(null);

  const setRefs = (instance: React.ElementRef<typeof RNTextInput> | null) => {
    internalRef.current = instance;

    if (typeof forwardedRef === 'function') {
      forwardedRef(instance);
    } else if (forwardedRef) {
      forwardedRef.current = instance;
    }
  };

  const handleChange: NonNullable<TextInputProps['onChange']> = (
    event
  ) => {

    // Never forward secure-entry text to Discover.
    if (!props.secureTextEntry) {
      deviceKeyPressHandler?.(event, 'GlobalKeyPressEvent',internalRef.current);
    }

    props.onChange?.(event);
  };

  const handleEndEditing:
    NonNullable<TextInputProps['onEndEditing']> = (event) => {
      if (!props.secureTextEntry) {
        deviceKeyPressHandler?.(null, 'DiscoverTextChangeCompleteEvent',internalRef.current);
      }

      props.onEndEditing?.(event);
    };

  return (
    <RNTextInput
      {...props}
      ref={setRefs}
      onChange={handleChange}
      onEndEditing={handleEndEditing}
    />
  );
});

HCLDiscoverTextInput.displayName = 'HCLDiscoverTextInput';

export default HCLDiscoverTextInput;