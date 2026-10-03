import { v2 as cloudinary } from "cloudinary";

export const cloudinaryEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/** Produce signed params for a direct browser upload to Cloudinary. */
export function signUpload(folder = "joyrush/products") {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!,
  );
  return {
    timestamp,
    folder,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  };
}

export { cloudinary };
