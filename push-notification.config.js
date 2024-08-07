import { Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';

PushNotification.configure({
  onNotification: function(notification) {
    console.log("NOTIFICATION:", notification);
  },
  requestPermissions: Platform.OS === 'ios',
});