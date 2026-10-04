/** Where an upload is filed in Cloudinary (see app/api/cloudinary/sign). */
export type UploadContext = "product" | "review" | "branding" | "content";

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Upload an image straight from the browser to Cloudinary with a signature
 * from our server, and return its https URL. Throws a user-readable Error.
 */
export async function uploadImage(file: File, context: UploadContext): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("That file isn't an image.");
  if (file.size > MAX_BYTES) throw new Error("Image is too large (max 10 MB).");

  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context }),
  });
  const sign = await signRes.json().catch(() => ({}));
  if (!signRes.ok) {
    throw new Error(sign.error ?? "Uploads aren't set up — paste an image link instead.");
  }

  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", sign.apiKey);
  fd.append("timestamp", String(sign.timestamp));
  fd.append("signature", sign.signature);
  fd.append("folder", sign.folder);
  const up = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, {
    method: "POST",
    body: fd,
  });
  const data = await up.json().catch(() => ({}));
  if (!up.ok || typeof data.secure_url !== "string") throw new Error("Upload failed. Please try again.");
  return data.secure_url;
}
