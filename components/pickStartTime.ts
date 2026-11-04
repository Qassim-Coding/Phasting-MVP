import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Alert, Platform } from 'react-native';

// Ouvre les sélecteurs natifs d'Android : d'abord la date (calendrier), puis l'heure (horloge).
// Renvoie l'heure choisie en millisecondes, ou null si l'utilisateur annule.
// L'heure choisie ne peut pas être dans le futur.
export function pickStartTime(initial: number): Promise<number | null> {
  if (Platform.OS !== 'android') return Promise.resolve(null);

  return new Promise((resolve) => {
    DateTimePickerAndroid.open({
      value: new Date(initial),
      mode: 'date',
      maximumDate: new Date(),
      onChange: (dateEvent, pickedDate) => {
        if (dateEvent.type !== 'set' || !pickedDate) {
          resolve(null);
          return;
        }

        // Le sélecteur d'heure démarre sur l'heure du jeûne actuel, mais le jour choisi.
        const base = new Date(initial);
        const timeStart = new Date(
          pickedDate.getFullYear(),
          pickedDate.getMonth(),
          pickedDate.getDate(),
          base.getHours(),
          base.getMinutes(),
        );

        DateTimePickerAndroid.open({
          value: timeStart,
          mode: 'time',
          is24Hour: true,
          onChange: (timeEvent, pickedTime) => {
            if (timeEvent.type !== 'set' || !pickedTime) {
              resolve(null);
              return;
            }
            const result = new Date(
              pickedDate.getFullYear(),
              pickedDate.getMonth(),
              pickedDate.getDate(),
              pickedTime.getHours(),
              pickedTime.getMinutes(),
            ).getTime();

            if (result > Date.now()) {
              Alert.alert('Heure impossible', 'Le début du jeûne ne peut pas être dans le futur.');
              resolve(null);
              return;
            }
            resolve(result);
          },
        });
      },
    });
  });
}
