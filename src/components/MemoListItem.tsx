import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Entypo } from '@expo/vector-icons';
import { AVPlaybackStatus, Audio } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';
import dayjs from 'dayjs';
interface MemoListItemProps {
    uri: string
}

const MemoListItem: React.FC<MemoListItemProps> = ({ uri }) => {


  const [sound, setSound] = useState<Sound>();
  const [status, setStatus] = useState<AVPlaybackStatus>();

  const isPlaying = status?.isLoaded && status?.isPlaying;

  const currentProgress = status?.isLoaded && status?.positionMillis 
  const totalProgress = status?.isLoaded && status?.durationMillis
  const progress = currentProgress && totalProgress ? (currentProgress / totalProgress) * 100 : 0



  async function loadSound() {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync({uri}, {
      progressUpdateIntervalMillis: 1000/60,
    }, (status) => {
      setStatus(status)
      if (status.isLoaded && status.didJustFinish) {
        sound.setPositionAsync(0)
      }
    }
    );
    setSound(sound);
  }

  const millisToMinutesAndSeconds = (millis: number) => {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (parseInt(seconds) < 10 ? '0' : '') + seconds;
  }

  async function playSound() {
    if (!sound) {
      console.log('Sound not loaded');
      return;
    }
    if (status?.isLoaded && status.isPlaying) {
      console.log('Pausing Sound');
      sound.pauseAsync();
    }
    else {
      console.log('Playing Sound');
      sound.playAsync();
    }
  }  

  useEffect(() => {
    loadSound()
  } , [uri])

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);


  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={playSound}>
        <Entypo name={isPlaying ? 'controller-paus' : 'controller-play'} size={24} color="black" />
      </TouchableOpacity>

      <View style={styles.playbackContainer}>
      <View style={[styles.playbackIndicator, {left: `${progress}%`}]} />
        <View style={styles.track} />
      <Text
      numberOfLines={1}
      style={styles.duration}>{millisToMinutesAndSeconds(currentProgress ?? 0)} / {millisToMinutesAndSeconds(totalProgress ?? 0)}
      </Text>
      </View>
    </View>
  )
}

export default MemoListItem

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor:'white',
        margin: 5,
        alignItems: 'center',
        padding: 10,
        borderRadius: 5,
        gap: 10,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        
        elevation: 5,
        height: 50,
        
        
    },
    playbackContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: 40,
        
    },
    track:{
        flex: 1,
      backgroundColor: 'gainsboro',
        height: 3,
    },
    duration: {

        textAlign: 'right',
        color: 'grey',
        alignSelf: 'flex-end',
        right: 0,
        position: 'absolute',
    },
    playbackIndicator: {
        backgroundColor: 'black',
        width: 10,
        aspectRatio: 1,
        borderRadius: 5,
        position: 'absolute',
        zIndex: 1,
    }
})