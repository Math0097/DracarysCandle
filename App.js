import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, StatusBar, Image, FlatList, Alert, Modal } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { enableScreens } from 'react-native-screens';

enableScreens();
const Tab = createBottomTabNavigator();

const App = () => {
  const [savedCandles, setSavedCandles] = useState([]);

  useEffect(() => {
    loadSavedCandles();
  }, []);

  const loadSavedCandles = async () => {
    try {
      const storedCandles = await AsyncStorage.getItem('savedCandles');
      if (storedCandles) {
        setSavedCandles(JSON.parse(storedCandles));
      }
    } catch (error) {
      console.error('Errore nel caricamento delle candele salvate:', error);
    }
  };

  const saveCandlesToStorage = async (candles) => {
    try {
      await AsyncStorage.setItem('savedCandles', JSON.stringify(candles));
    } catch (error) {
      console.error('Errore nel salvataggio delle candele:', error);
    }
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarShowLabel: true,
          tabBarIcon: ({ color, size }) => {
            return <Ionicons name="md-calculator" size={size} color={color} />;
          },
        }}>
        <Tab.Screen
          name="Calcolatore"
          children={() => (
            <CalculatorScreen
              savedCandles={savedCandles}
              setSavedCandles={setSavedCandles}
              saveCandlesToStorage={saveCandlesToStorage}
            />
          )}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calculator" size={size} color={color} />  // Icona per Calcolatore
            ),
          }}
        />
        <Tab.Screen
          name="Candele Salvate"
          children={() => (
            <SavedCandlesScreen
              savedCandles={savedCandles}
              setSavedCandles={setSavedCandles}
              saveCandlesToStorage={saveCandlesToStorage}
            />
          )}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="flame" size={size} color={color} />  // Icona per Candele Salvate
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

// Schermata per calcolare e salvare le candele
const CalculatorScreen = ({ savedCandles, setSavedCandles, saveCandlesToStorage }) => {
  const [inputValues, setInputValues] = useState({
    waterWeight: '',
    conversionFactor: '0.86',
    fragrancePercentage: '',
  });

  const [results, setResults] = useState({
    totalWeight: 0,
    waxWeight: 0,
    fragranceWeight: 0,
  });

  const [isModalVisible, setIsModalVisible] = useState(false); // Stato per la visibilità del modal
  const [candleName, setCandleName] = useState(''); // Stato per il nome della candela

  const handleInputChange = (name, value) => {
    setInputValues(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculate = () => {
    const { waterWeight, conversionFactor, fragrancePercentage } = inputValues;
    const water = parseFloat(waterWeight);
    const factor = parseFloat(conversionFactor);
    const fragrancePercent = parseFloat(fragrancePercentage) / 100;

    if (!isNaN(water) && !isNaN(factor) && !isNaN(fragrancePercent)) {
      const total = water * factor;
      const fragrance = total * fragrancePercent;
      const wax = total - fragrance;

      setResults({
        totalWeight: total.toFixed(2),
        fragranceWeight: fragrance.toFixed(2),
        waxWeight: wax.toFixed(2),
      });
    }
  };

  const saveCandle = () => {
    setIsModalVisible(true); // Mostra il modal per chiedere il nome della candela
  };

  const handleSaveCandle = () => {
    if (candleName.trim()) {
      const currentDate = new Date();
      const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}`;
      const newCandle = {
        id: Math.random().toString(),
        name: candleName,
        date: formattedDate,
        details: { totalWeight: results.totalWeight, waxWeight: results.waxWeight, fragranceWeight: results.fragranceWeight },
      };
      const updatedCandles = [...savedCandles, newCandle];
      setSavedCandles(updatedCandles);
      saveCandlesToStorage(updatedCandles);  // Salva i dati in AsyncStorage
      Alert.alert('Candela salvata!', `La candela "${candleName}" è stata salvata.`);
      setCandleName('');
      setIsModalVisible(false);
    } else {
      Alert.alert('Errore', 'Inserisci un nome valido per la candela.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor='#FFE5B4' barStyle={'dark-content'} />
      <View style={styles.box}>
        <Image
          source={require('./assets/logo_trasparente.png')}
          style={styles.image}
        />
        <Text style={styles.title}>DracarysCandle</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Crea la tua candela</Text>
        <TextInput
          style={styles.input}
          placeholder="Peso dell'acqua (g)"
          keyboardType="numeric"
          value={inputValues.waterWeight}
          onChangeText={(value) => handleInputChange('waterWeight', value.replace(',', '.'))}
        />
        <TextInput
          style={styles.input}
          placeholder="Fattore di conversione (es. 0.86)"
          keyboardType="numeric"
          value={inputValues.conversionFactor}
          onChangeText={(value) => handleInputChange('conversionFactor', value.replace(',', '.'))}
        />
        <TextInput
          style={styles.input}
          placeholder="Percentuale di fragranza (%)"
          keyboardType="numeric"
          value={inputValues.fragrancePercentage}
          onChangeText={(value) => handleInputChange('fragrancePercentage', value.replace(',', '.'))}
        />

        <View style={styles.buttonContainer}>
          <Button title="Calcola" onPress={calculate} color="#FF8A65" />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Risultati</Text>
        <Text>Peso totale (cera + fragranza): {results.totalWeight} g</Text>
        <Text>Quantità di cera: {results.waxWeight} g</Text>
        <Text>Quantità di fragranza: {results.fragranceWeight} g</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Salva Candela" onPress={saveCandle} color="#FF8A65" />
      </View>

      {/* Modal per inserire il nome della candela */}
      <Modal
        visible={isModalVisible}
        animationType="fade"  // Tipo di animazione (può essere 'slide' o 'fade')
        transparent={true}     // Impostiamo trasparente per far vedere lo sfondo oscurato
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Inserisci il nome della candela</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome della candela"
              value={candleName}
              onChangeText={setCandleName}
            />
            {/* Contenitore per i pulsanti Salva e Annulla */}
            <View style={styles.modalButtonContainer}>
              <Button title="Salva" onPress={handleSaveCandle} color="#FF8A65" />
              <View style={styles.modalCancel}>
                <Button title="Annulla" onPress={() => setIsModalVisible(false)} color="red" />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Schermata per visualizzare ed eliminare le candele salvate
const SavedCandlesScreen = ({ savedCandles, setSavedCandles, saveCandlesToStorage }) => {
  const deleteCandle = (id) => {
    const updatedCandles = savedCandles.filter(candle => candle.id !== id);
    setSavedCandles(updatedCandles);
    saveCandlesToStorage(updatedCandles);
  };

  const renderCandleItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
      <Text>Data: {item.date}</Text>
      <Text>Peso totale: {item.details.totalWeight} g</Text>
      <Text>Quantità di cera: {item.details.waxWeight} g</Text>
      <Text>Quantità di fragranza: {item.details.fragranceWeight} g</Text>
      <View style={styles.buttonContainer}>
        <Button title="Rimuovi" color="red" onPress={() => deleteCandle(item.id)} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Image
          source={require('./assets/logo_trasparente.png')}
          style={styles.image}
        />
        <Text style={styles.title}>DracarysCandle</Text>
      </View>
      <FlatList
        data={savedCandles}
        keyExtractor={(item) => item.id}
        renderItem={renderCandleItem}
        ListEmptyComponent={<View style={styles.card}><Text style={{ textAlign: 'center' }}>Nessuna candela salvata</Text></View>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE5B4',
    padding: 20,
  },
  box: {
    flexDirection: 'row',
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 25,
    textShadowColor: 'black',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  card: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  buttonContainer: {
    marginTop: 10,
    borderRadius: 10,
  },
  buttonContanierDelete: {
    marginTop: 10,
    borderRadius: 10,
  },
  image: {
    width: 80,
    height: 80,
  },
  candleItem: {
    backgroundColor: '#FFE5B4',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Sfondo oscurato
  },
  modalContent: {
    backgroundColor: '#FFE5B4',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalCancel: {
    marginLeft: 10,  // o usa marginRight, se preferisci
  },
});

export default App;