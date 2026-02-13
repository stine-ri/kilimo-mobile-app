import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  setToken: async (token: string) => {
    await AsyncStorage.setItem('token', token);
  },
  
  getToken: async () => {
    return await AsyncStorage.getItem('token');
  },
  
  removeToken: async () => {
    await AsyncStorage.removeItem('token');
  },
  
  setUser: async (user: any) => {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  },
  
  getUser: async () => {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  removeUser: async () => {
    await AsyncStorage.removeItem('user');
  },
  
  clearAll: async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
  },
};