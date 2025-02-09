import { Video } from 'expo-av';
import { BlurView } from 'expo-blur';
import { Camera, CameraType } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useRef, useState } from 'react';
import {
  Button,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';

function randomColor() {
  return '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0');
}

export default class App extends React.PureComponent {
  render() {
    const isFabricEnabled = global.nativeFabricUIManager != null;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <Text style={[styles.text, { marginVertical: 10 }]}>
            isFabricEnabled: {isFabricEnabled + ''}
          </Text>

          <LinearGradientExample />
          {Platform.OS === 'ios' && <BlurExample />}
          <VideoExample />
          <CameraExample />
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export function LinearGradientExample() {
  const [mounted, setMounted] = useState(true);
  const [colors, setColors] = useState(() => Array(3).fill(0).map(randomColor));

  const toggleMounted = useCallback(() => setMounted(!mounted), [mounted]);
  const randomizeColors = useCallback(() => setColors(Array(3).fill(0).map(randomColor)), [colors]);

  return (
    <View style={styles.exampleContainer}>
      <View style={styles.gradient}>
        {mounted && <LinearGradient style={{ flex: 1 }} colors={colors} end={{ x: 0.5, y: 1.0 }} />}
      </View>

      <View style={styles.buttons}>
        <Button title={mounted ? 'Unmount view' : 'Mount view'} onPress={toggleMounted} />
        <Button title="Randomize colors" onPress={randomizeColors} disabled={!mounted} />
      </View>
    </View>
  );
}

export function BlurExample() {
  const uri = 'https://source.unsplash.com/random';
  const text = "Hello, I'm blurring contents underneath!";

  return (
    <View style={[styles.exampleContainer, styles.blurExample]}>
      <Image style={styles.blurImage} source={{ uri }} />
      <BlurView intensity={100} style={styles.blurContainer}>
        <Text style={styles.text}>{text}</Text>
      </BlurView>
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <Text style={styles.text}>{text}</Text>
      </BlurView>
      <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
        <Text style={[styles.text, { color: '#fff' }]}>{text}</Text>
      </BlurView>
    </View>
  );
}

export function VideoExample() {
  const video = useRef(null);
  const [status, setStatus] = useState({});
  const [nativeControls, setNativeControls] = useState(true);

  const togglePlaying = useCallback(() => {
    if (status.isPlaying) {
      video.current.pauseAsync();
    } else {
      video.current.playAsync();
    }
  }, [status.isPlaying]);

  const toggleNativeControls = useCallback(
    () => setNativeControls(!nativeControls),
    [nativeControls]
  );

  const setFullscreen = useCallback(() => video.current.presentFullscreenPlayer(true), [video]);

  return (
    <View style={[styles.exampleContainer, styles.videoExample]}>
      <Video
        ref={video}
        style={styles.video}
        source={{
          uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
        }}
        useNativeControls={nativeControls}
        resizeMode="contain"
        isLooping
        onPlaybackStatusUpdate={(status) => setStatus(() => status)}
      />
      <View style={styles.buttons}>
        <Button title={status.isPlaying ? 'Pause' : 'Play'} onPress={togglePlaying} />
        <Button
          title={nativeControls ? 'Hide controls' : 'Show controls'}
          onPress={toggleNativeControls}
        />
        <Button title="Open fullscreen" onPress={setFullscreen} />
      </View>
    </View>
  );
}

export function CameraExample() {
  const [cameraPermissionStatus, requestCameraPermission] = Camera.useCameraPermissions();
  const camera = useRef<Camera>(null);
  const [cameraType, setCameraType] = useState(CameraType.back);

  const takePicture = useCallback(async () => {
    const result = await camera.current.takePictureAsync({
      quality: 0.7,
    });
    alert(JSON.stringify(result, null, 2));
  }, []);

  const reverse = useCallback(() => {
    setCameraType(cameraType === CameraType.back ? CameraType.front : CameraType.back);
  }, [cameraType]);

  const onCameraReady = useCallback(() => {
    console.log('Camera is ready!');
  }, []);

  if (!cameraPermissionStatus) {
    requestCameraPermission();
    return null;
  }

  return (
    <View style={styles.exampleContainer}>
      <Camera ref={camera} style={styles.camera} type={cameraType} onCameraReady={onCameraReady}>
        <View style={styles.cameraShutterButtonContainer}>
          <TouchableOpacity style={styles.cameraShutterButton} onPress={takePicture} />
        </View>
      </Camera>

      <View style={styles.buttons}>
        <Button title="Take picture" onPress={takePicture} />
        <Button
          title={cameraType === CameraType.back ? 'Switch to front' : 'Switch to back'}
          onPress={reverse}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  scrollContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  exampleContainer: {
    padding: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderStyle: 'solid',
    borderColor: '#242c39',
  },
  gradient: {
    height: 200,
  },
  blurExample: {
    height: 200,
  },
  blurImage: {
    resizeMode: 'cover',
    ...StyleSheet.absoluteFillObject,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  videoExample: {
    justifyContent: 'center',
  },
  video: {
    alignSelf: 'center',
    width: 400,
    height: 200,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    height: 500,
    backgroundColor: 'red',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cameraShutterButtonContainer: {
    width: 70,
    height: 70,
    margin: 20,
    padding: 3,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#fff9',
  },
  cameraShutterButton: {
    flex: 1,
    borderRadius: 35,
    backgroundColor: '#fff',
  },
});
