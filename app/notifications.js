// notifications.js
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Send a notification to all users
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
export const sendNotification = async (title, message) => {
  try {
    await addDoc(collection(db, "notifications"), {
      title,
      message,
      timestamp: serverTimestamp(),
    });
    console.log("✅ Notification sent:", title);
  } catch (error) {
    console.error("❌ Error sending notification:", error);
  }
};
