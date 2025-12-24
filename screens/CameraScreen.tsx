// screens/CameraScreen.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Alert, Modal, FlatList, Image, ActivityIndicator
} from 'react-native';
import {
    Camera, useCameraDevice, useCameraPermission, useMicrophonePermission
} from 'react-native-vision-camera';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For Persistence
import Video from 'react-native-video'; // For Video Playback
import AppLayout from '../components/AppLayout';

// Define the shape of our media items
type MediaItem = {
    type: 'photo' | 'video';
    path: string;
    id: string;
};

const STORAGE_KEY = 'MY_APP_MEDIA_GALLERY';

export default function CameraScreen() {
    // --- 1. Permissions & Device Setup ---
    const { hasPermission: hasCamPermission, requestPermission: requestCamPermission } = useCameraPermission();
    const { hasPermission: hasMicPermission, requestPermission: requestMicPermission } = useMicrophonePermission();
    const device = useCameraDevice('back');
    const camera = useRef<Camera>(null);

    // --- 2. State Management ---
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    // Media List State
    const [mediaList, setMediaList] = useState<MediaItem[]>([]);

    // Viewer State (If this is not null, the Viewer Modal is open)
    const [viewingMedia, setViewingMedia] = useState<MediaItem | null>(null);

    // --- 3. Persistence Logic ---
    useEffect(() => {
        loadMedia();
        if (!hasCamPermission) requestCamPermission();
        if (!hasMicPermission) requestMicPermission();
    }, []);

    const loadMedia = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) setMediaList(JSON.parse(stored));
        } catch (e) {
            console.error("Failed to load media", e);
        }
    };

    const saveMediaItem = async (newItem: MediaItem) => {
        const updatedList = [newItem, ...mediaList];
        setMediaList(updatedList);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    };

    // --- 4. Camera Actions ---
    const takePhoto = async () => {
        if (camera.current) {
            try {
                const photo = await camera.current.takePhoto();
                const newItem: MediaItem = {
                    type: 'photo',
                    path: 'file://' + photo.path,
                    id: Date.now().toString(),
                };
                await saveMediaItem(newItem);
                Alert.alert("Snapped!", "Photo saved to local gallery.");
            } catch (e) {
                console.error(e);
            }
        }
    };

    const toggleRecording = async () => {
        if (camera.current) {
            if (isRecording) {
                await camera.current.stopRecording();
                setIsRecording(false);
            } else {
                setIsRecording(true);
                camera.current.startRecording({
                    onRecordingFinished: async (video) => {
                        const newItem: MediaItem = {
                            type: 'video',
                            path: video.path,
                            id: Date.now().toString(),
                        };
                        await saveMediaItem(newItem);
                        Alert.alert("Recorded!", "Video saved to local gallery.");
                    },
                    onRecordingError: (error) => console.error(error),
                });
            }
        }
    };

    // --- 5. Render Components ---

    // The "Gallery" Item
    const renderMediaItem = ({ item }: { item: MediaItem }) => (
        <TouchableOpacity
            style={styles.mediaCard}
            onPress={() => setViewingMedia(item)} // Opens the Viewer Modal
        >
            {item.type === 'photo' ? (
                <Image source={{ uri: item.path }} style={styles.mediaImage} />
            ) : (
                <View style={[styles.mediaImage, styles.videoPlaceholder]}>
                    <Text style={{color: 'white', fontWeight: 'bold'}}>▶ VIDEO</Text>
                </View>
            )}
            <Text style={styles.mediaLabel}>{item.type.toUpperCase()}</Text>
        </TouchableOpacity>
    );

    if (!hasCamPermission || !hasMicPermission) {
        return (
            <AppLayout title="Camera Gallery">
                <View style={styles.centerContainer}>
                    <Text>Permissions required.</Text>
                    <TouchableOpacity onPress={() => { requestCamPermission(); requestMicPermission(); }}>
                        <Text style={{ color: 'blue' }}>Grant Permissions</Text>
                    </TouchableOpacity>
                </View>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Camera Gallery">
            <View style={styles.container}>
                {/* 1. Open Camera Button */}
                <TouchableOpacity style={styles.openButton} onPress={() => setIsCameraOpen(true)}>
                    <Text style={styles.openButtonText}>📷 Open Camera</Text>
                </TouchableOpacity>

                {/* 2. Gallery List */}
                <FlatList
                    data={mediaList}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMediaItem}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={styles.emptyText}>No media yet.</Text>}
                />
            </View>

            {/* --- MODAL 1: The Camera --- */}
            <Modal
                visible={isCameraOpen}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsCameraOpen(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        {device && (
                            <Camera
                                style={StyleSheet.absoluteFill}
                                device={device}
                                isActive={isCameraOpen}
                                ref={camera}
                                photo={true}
                                video={true}
                                audio={true}
                            />
                        )}
                        <TouchableOpacity onPress={() => setIsCameraOpen(false)} style={styles.closeBadge}>
                            <Text style={styles.closeBadgeText}>✕ Close</Text>
                        </TouchableOpacity>

                        <View style={styles.controls}>
                            <TouchableOpacity onPress={takePhoto} style={styles.captureBtn}>
                                <Text style={styles.btnText}>Photo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={toggleRecording}
                                style={[styles.captureBtn, isRecording ? styles.recordingBtn : null]}
                            >
                                <Text style={styles.btnText}>{isRecording ? "Stop" : "Video"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* --- MODAL 2: The Media Viewer --- */}
            <Modal
                visible={viewingMedia !== null}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setViewingMedia(null)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>

                        {/* Close Button */}
                        <TouchableOpacity onPress={() => setViewingMedia(null)} style={styles.closeBadge}>
                            <Text style={styles.closeBadgeText}>✕ Close Preview</Text>
                        </TouchableOpacity>

                        {/* Content Viewer */}
                        <View style={styles.viewerContent}>
                            {viewingMedia?.type === 'photo' && (
                                <Image
                                    source={{ uri: viewingMedia.path }}
                                    style={styles.fullScreenImage}
                                    resizeMode="contain"
                                />
                            )}

                            {viewingMedia?.type === 'video' && (
                                <Video
                                    source={{ uri: viewingMedia.path }}
                                    style={styles.fullScreenVideo}
                                    controls={true} // Shows native play/pause controls
                                    resizeMode="contain"
                                    onError={(e) => console.log("Video Error:", e)}
                                />
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </AppLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Gallery
    openButton: {
        backgroundColor: '#007AFF', padding: 15, borderRadius: 8,
        alignItems: 'center', marginBottom: 10,
    },
    openButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    listContent: { paddingBottom: 20 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#888' },

    mediaCard: {
        flex: 1, margin: 5, backgroundColor: '#fff',
        borderRadius: 8, padding: 5, elevation: 2, alignItems: 'center',
    },
    mediaImage: {
        width: '100%', height: 120, borderRadius: 4, backgroundColor: '#eee',
    },
    videoPlaceholder: {
        justifyContent: 'center', alignItems: 'center', backgroundColor: '#333',
    },
    mediaLabel: { fontSize: 10, marginTop: 4, color: '#555' },

    // Modal Common Styles
    modalBackground: {
        flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center', alignItems: 'center',
    },
    modalContainer: {
        width: '95%', height: '95%', backgroundColor: 'black',
        borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#444',
    },
    closeBadge: {
        position: 'absolute', top: 20, left: 20, zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 8,
        paddingHorizontal: 16, borderRadius: 20,
    },
    closeBadgeText: { color: 'white', fontWeight: 'bold' },

    // Camera Controls
    controls: {
        position: 'absolute', bottom: 30, width: '100%',
        flexDirection: 'row', justifyContent: 'space-evenly',
    },
    captureBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)', padding: 15,
        borderRadius: 30, width: 80, alignItems: 'center',
    },
    recordingBtn: { backgroundColor: 'rgba(255, 0, 0, 0.7)' },
    btnText: { color: 'white', fontWeight: 'bold' },

    // Viewer Styles
    viewerContent: { flex: 1, justifyContent: 'center', backgroundColor: 'black' },
    fullScreenImage: { width: '100%', height: '100%' },
    fullScreenVideo: { width: '100%', height: '100%' },
});