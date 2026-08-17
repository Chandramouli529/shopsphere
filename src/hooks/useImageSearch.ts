import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert } from "react-native";

/** Returns a callback that requests camera (falling back to photo library)
 * permission, lets the user take/pick a photo, then navigates to /search in
 * "visual search" mode with that photo. Shared by every screen that has a
 * camera icon next to search, so the permission/fallback/error handling
 * lives in exactly one place. */
export function useImageSearch() {
  const router = useRouter();

  return useCallback(async () => {
    try {
      const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
      let result: ImagePicker.ImagePickerResult;
      if (cameraPerm.status === "granted") {
        result = await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true });
      } else {
        const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (libPerm.status !== "granted") {
          Alert.alert(
            "Permission needed",
            "Allow camera or photo access in Settings to search by image."
          );
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({ quality: 0.6, allowsEditing: true });
      }
      if (!result.canceled && result.assets?.[0]) {
        router.push({ pathname: "/search", params: { imageUri: result.assets[0].uri } });
      }
    } catch {
      Alert.alert("Something went wrong", "Couldn't open the camera. Please try again.");
    }
  }, [router]);
}
