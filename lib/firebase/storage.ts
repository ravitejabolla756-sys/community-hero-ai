import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { firebaseEnabled, storage } from "@/lib/firebase/config";

const fallbackImageUrl = "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=900&q=80";

export async function uploadIssueImage(issueId: string, dataUrl?: string): Promise<string> {
  if (!dataUrl) return fallbackImageUrl;
  if (!dataUrl.startsWith("data:image")) return dataUrl;
  if (!firebaseEnabled || !storage) return dataUrl;

  try {
    const mimeType = dataUrl.match(/data:(.*);base64/)?.[1] ?? "image/jpeg";
    const extension = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";
    const imageRef = ref(storage, `issues/${issueId}.${extension}`);
    await uploadString(imageRef, dataUrl, "data_url", { contentType: mimeType });
    return await getDownloadURL(imageRef);
  } catch (error) {
    throw new Error(error instanceof Error ? `Image upload failed: ${error.message}` : "Image upload failed.");
  }
}
