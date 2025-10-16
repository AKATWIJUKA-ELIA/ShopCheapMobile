import { Share, Alert } from "react-native";

export async function triggerShare(p0: string, p1: string, { message, url }: { message?: string; url?: string; }) {
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
  } catch (error) {
    Alert.alert("Error", error.message);
  }
}
