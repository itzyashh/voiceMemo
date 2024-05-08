import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Entypo } from '@expo/vector-icons';
interface MemoListItemProps {
    uri: string
}

const MemoListItem: React.FC<MemoListItemProps> = ({ uri }) => {
  return (
    <View style={styles.container}>
        <Entypo name="controller-play" size={24} color="black" />
      <View style={styles.playbackContainer}>


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
        
        
    },
    playbackContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
})