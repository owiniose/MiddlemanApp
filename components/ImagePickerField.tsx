import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Text from './Text';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../config/firebase';
import { getApp } from 'firebase/app';

const STORAGE_BUCKET = getApp().options.storageBucket ?? '';

// Uploads a base64 image to Firebase Storage via the REST API.
// Avoids the Firebase JS Storage SDK entirely because it internally
// creates Blobs from ArrayBuffers, which React Native does not support.
async function uploadImage(base64Data: string, storagePath: string): Promise<string> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Not authenticated');

  const boundary = `boundary${Date.now()}`;
  const encodedPath = encodeURIComponent(storagePath);

  // Multipart/related body constructed as a plain string.
  // The image part is base64-encoded (Content-Transfer-Encoding: base64),
  // which Firebase Storage / GCS accepts per RFC 2045.
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `{"contentType":"image/jpeg"}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: image/jpeg\r\n` +
    `Content-Transfer-Encoding: base64\r\n\r\n` +
    base64Data +
    `\r\n--${boundary}--`;

  const response = await fetch(
    `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o` +
    `?uploadType=multipart&name=${encodedPath}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return (
    `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/` +
    `${encodedPath}?alt=media&token=${data.downloadTokens}`
  );
}

type Props = {
  value: string | null | undefined;
  onChange: (url: string) => void;
  uploadPath: string;
  width?: number;
  height?: number;
  shape?: 'square' | 'circle';
  aspect?: [number, number];
};

export default function ImagePickerField({
  value,
  onChange,
  uploadPath,
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
      const url = await uploadImage(base64, uploadPath);
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
