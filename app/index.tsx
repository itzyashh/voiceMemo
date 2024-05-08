import { useState } from 'react';
import { View, StyleSheet, Button, Text, FlatList, Touchable, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { Recording } from 'expo-av/build/Audio';


export default function App() {
  const [recording, setRecording] = useState<Recording>();
  const [memos, setMemos] = useState<string[]>([])
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  async function startRecording() {
    try {
      if (!permissionResponse) return
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync( Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {

    if (!recording)
      return

    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync(
      {
        allowsRecordingIOS: false,
      }
    );
    const uri = recording.getURI();
    if (uri){
      setMemos([uri,...memos])
    }
    console.log('Recording stopped and stored at', uri);
  }

  return (
    <View style={styles.container}>
    <FlatList
      data={memos}
      renderItem={({item})=><Text>{item}</Text>}
      />

    <View style={styles.footer}>
      <View style={styles.border}>
      <TouchableOpacity
      activeOpacity={0.7}
      style={styles.button}
      onPress={recording ? stopRecording : startRecording}
      >

      </TouchableOpacity>
      </View>
    </View>

      {/* <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',

  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    height: 100,
  },
  button: {
    width: 55,
    height: 55,
    borderRadius: 50,
    backgroundColor: 'red',
  },
  border: {
    width: 65,
    height: 65,
    borderRadius: 50,

    borderWidth: 5,
    borderColor: 'gray',
  },
});