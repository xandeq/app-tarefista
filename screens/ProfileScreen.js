import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Button, TextInput, TouchableOpacity, Image } from 'react-native';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erro ao fazer logout: ', error);
    }
  };

  const handleSave = () => {
    // Aqui você pode adicionar a lógica para salvar as alterações do perfil no Firebase
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Image source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }} style={styles.profileImage} />
      {isEditing ? (
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
        />
      ) : (
        <Text style={styles.displayName}>{user?.displayName || 'Usuário'}</Text>
      )}
      {isEditing ? (
        <Button title="Salvar" onPress={handleSave} />
      ) : (
        <Button title="Editar Perfil" onPress={() => setIsEditing(true)} />
      )}
      <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
  displayName: {
    fontSize: 18,
    marginBottom: 20,
  },
  logoutButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ProfileScreen;
