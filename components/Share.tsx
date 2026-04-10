import { Alert, Share } from "react-native";

export async function triggerShare(message?: string, url?: string) {
  try {
    const result = await Share.share({
      message: message ?? "Check out this product at ShopCheap!",
      url: url ?? 'https://www.shopcheapug.com', // Optional URL
    });

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        console.log("Shared with activity type:", result.activityType);
      } else {
        console.log("Content shared successfully!");
      }
    } else if (result.action === Share.dismissedAction) {
      console.log("Share dismissed by user.");
    }
  } catch (error: any) {
    Alert.alert("Error", error.message);
  }
}
