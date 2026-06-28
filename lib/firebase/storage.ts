import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { firebaseEnabled, storage } from "@/lib/firebase/config";

const fallbackImageUrl = "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=900&q=80";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseBucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "issue-images";

function getImageMeta(dataUrl: string) {
  const mimeType = dataUrl.match(/data:(.*);base64/)?.[1] ?? "image/jpeg";
  const extension = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";
  return { mimeType, extension };
}

async function uploadToSupabase(issueId: string, dataUrl: string): Promise<string> {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseBucket) {
    throw new Error("Supabase Storage is not configured.");
  }

  const { mimeType, extension } = getImageMeta(dataUrl);
  const blob = await (await fetch(dataUrl)).blob();
  const filePath = `issues/${issueId}-${Date.now()}.${extension}`;
  const uploadUrl = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/${supabaseBucket}/${filePath}`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
      "Content-Type": mimeType,
      "x-upsert": "true",
    },
    body: blob,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Supabase image upload failed.");
  }

  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${supabaseBucket}/${filePath}`;
}

export async function uploadIssueImage(issueId: string, dataUrl?: string): Promise<string> {
  if (!dataUrl) return fallbackImageUrl;
  if (!dataUrl.startsWith("data:image")) return dataUrl;

  try {
    if (supabaseUrl && supabaseAnonKey) {
      return await uploadToSupabase(issueId, dataUrl);
    }

    if (!firebaseEnabled || !storage) return fallbackImageUrl;

    const { mimeType, extension } = getImageMeta(dataUrl);
    const imageRef = ref(storage, `issues/${issueId}.${extension}`);
    await uploadString(imageRef, dataUrl, "data_url", { contentType: mimeType });
    return await getDownloadURL(imageRef);
  } catch (error) {
    throw new Error(error instanceof Error ? `Image upload failed: ${error.message}` : "Image upload failed.");
  }
}
