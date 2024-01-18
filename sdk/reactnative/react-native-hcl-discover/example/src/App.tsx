import * as React from 'react';

import { StyleSheet, View, Text, Image } from 'react-native';
import { multiply, clickclick } from 'react-native-hcl-discover';

export default function App() {
  const [result, setResult] = React.useState<number | undefined>();
  const [imageData, setImageData] = React.useState('data:image/png;base64,');

  React.useEffect(() => {
    multiply(55.2, 22).then(setResult);
    
    clickclick(1.0, 1.0).then( (base64Image) => {
      setImageData(`data:image/png;base64,${base64Image}`);
    } );

  }, []);

  return (
    <View style={styles.container}>
      <Text> Change multiplicand and multiplier in App.tsx to update the screenshot below </Text>
      <Text>Result: {result}</Text>
      <Image
        style={styles.logo}
        source={{
          uri: imageData,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  logo: {
    width: 320,
    height: 480,
  },
});
