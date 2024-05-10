import { useRef, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { Recording } from 'expo-av/build/Audio';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import MemoListItem from '../components/MemoListItem';

type Memo = {
  uri: string;
  metering: number[];
};


export default function App() {
  const [recording, setRecording] = useState<Recording>();
  console.log('recording', recording)
  const [memos, setMemos] = useState<Memo[]>([])
  // const [audioMetering, setAudioMetering] = useState<number[]>([]);
  const audioMeteringRef = useRef([]);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const metering = useSharedValue(-100);

   const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

  async function startRecording() {
    try {
      if (!permissionResponse) return
      // setAudioMetering([]);
      audioMeteringRef.current = [];
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync( Audio.RecordingOptionsPresets.HIGH_QUALITY, undefined,1000/60
      )
      setRecording(recording);
      recording.setOnRecordingStatusUpdate((status) => {
        if (status.metering) {
        metering.value = status.metering;
        // setAudioMetering([...audioMetering, status.metering]);
        audioMeteringRef.current.push(status.metering || -100);
        }

      })

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
    console.log('Audio info', await recording.getStatusAsync());
    if (uri){
      setMemos([
        {uri, metering:audioMeteringRef.current
        },...memos])
    }
    console.log('Recording stopped and stored at', uri);
  }

  const animateButton = useAnimatedStyle(() => {
    return {
      width: recording ? withTiming(35) : withTiming(52),
      height: recording ? withTiming(35) : withTiming(52),
      borderRadius:recording ? withTiming(5) : withTiming(50),
    };
  }
  );

  const recordWaves = useAnimatedStyle(() => {
    const size = withTiming(interpolate(metering.value, [-160, -60, 0], [0, 0, -40]), {duration: 50});
    return {
      top: size,
      left: size,
      bottom: size,
      right: size,
    };
  } 
  );

  return (
    <View style={styles.container}>
    <FlatList
      data={memos}
      renderItem={({item})=><MemoListItem data={item}/>}
      />

    <View style={styles.footer}>
      <View>

    <Animated.View style={[styles.recordWaves, recordWaves]}/>
      <View style={styles.border}>
      <AnimatedTouchable
      activeOpacity={0.7}
      style={[styles.button, animateButton]}
      onPress={recording ? stopRecording : startRecording}
      >

      </AnimatedTouchable>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'gray',
    backgroundColor: 'white',
  },
  recordWaves:{
    position: 'absolute',
    zIndex: -10,
    opacity: 0.4,
    borderRadius: 1000,
    backgroundColor: 'orangered',
  }
});
