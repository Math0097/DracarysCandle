import React, { useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

import ChangeQuantity from './Screen/ChangeQuantityScreen';
import Home from './Screen/HomeScreen';

const Drawer = createDrawerNavigator();

function App() {
  const [quantityConsigliata, setQuantityConsigliata] = useState(2000); // Inizializza la quantità consigliata

  const handleQuantitySelect = (quantity) => {
    setQuantityConsigliata(quantity); // Aggiorna la quantità consigliata quando viene selezionata dalla schermata ChangeQuantity
  };

  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName='Home'>
        <Drawer.Screen name='Home'>
          {(props) => <Home {...props} quantitàConsigliata={quantityConsigliata} />}
        </Drawer.Screen>
        <Drawer.Screen name='Quantity'>
          {(props) => <ChangeQuantity {...props} onQuantitySelect={handleQuantitySelect} />}
        </Drawer.Screen>
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default App;
