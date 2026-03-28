import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Text from './Text';
import * as ImagePicker from 'expo-image-picker';

const CLOUDINARY_CLOUD = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD!;
const CLOUDINARY_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_PRESET!;

async function uploadImage(base64Data: string): Promise<string> {
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: `data:image/jpeg;base64,${base64Data}`,
        upload_preset: CLOUDINARY_PRESET,
        public_id: `upload_${Date.now()}`,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.secure_url as string;
}

type Props = {
  value: string | null | undefined;
  onChange: (url: string) => void;
  width?: number;
  height?: number;
  shape?: 'square' | 'circle';
  aspect?: [number, number];
};

export default function ImagePickerField({
  value,
  onChange,
  width = 120,
  height = 120,
  shape = 'square',
  aspect = [1, 1],
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Permission to access photos is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect,
      quality: 0.75,
      base64: true,
    });

    if (result.canceled) return;

    const base64 = result.assets[0].base64;
    if (!base64) {
      setError('Could not read image data.');
      return;
    }

    setError('');
    setUploading(true);
    try {
      const url = await uploadImage(base64);
      onChange(url);
    } catch (e: any) {
      setError(e?.message ?? 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const borderRadius = shape === 'circle' ? Math.min(width, height) / 2 : 10;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        onPress={pick}
        style={[styles.container, { width, height, borderRadius }]}
        activeOpacity={0.8}
      >
        {uploading ? (
          <ActivityIndicator color="#0f766e" />
        ) : value ? (
          <Image source={{ uri: value }} style={[styles.image, { borderRadius }]} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderText}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {value && !uploading && (
        <TouchableOpacity onPress={pick} style={styles.changeBtn}>
          <Text style={styles.changeBtnText}>Change Photo</Text>
        </TouchableOpacity>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 8 },
  container: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { alignItems: 'center', gap: 4 },
  placeholderIcon: { fontSize: 22 },
  placeholderText: { fontSize: 11, color: '#9ca3af', fontWeight: '600' },
  changeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  changeBtnText: { fontSize: 12, color: '#0f766e', fontWeight: '600' },
  errorText: { fontSize: 12, color: '#ef4444', textAlign: 'center' },
});
