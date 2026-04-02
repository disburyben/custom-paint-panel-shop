// Storage helpers supporting both Vercel Blob and Forge Storage Proxy
import { ENV } from './_core/env';
import { put } from '@vercel/blob';

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string
): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  // 1. Try Vercel Blob if token is available (preferred for Vercel deployments)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(key, data, {
        access: 'public',
        contentType,
      });
      return { key: blob.pathname, url: blob.url };
    } catch (e) {
      console.error("Vercel Blob upload failed, trying fallback:", e);
    }
  }

  // 2. Fallback to Forge Storage Proxy
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey || apiKey === "forge_api_key_placeholder") {
    throw new Error(
      "Storage configuration missing. Please ensure BLOB_READ_WRITE_TOKEN is set in Vercel, or provide BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY."
    );
  }

  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string; }> {
  // For Vercel Blob, the URL is usually static or stored in DB. 
  // If using storage proxy, we might need to fetch a download URL.
  const key = normalizeKey(relKey);
  
  // Try forge if we have credentials
  if (ENV.forgeApiUrl && ENV.forgeApiKey && ENV.forgeApiKey !== "forge_api_key_placeholder") {
    const downloadApiUrl = new URL("v1/storage/downloadUrl", ensureTrailingSlash(ENV.forgeApiUrl));
    downloadApiUrl.searchParams.set("path", key);
    const response = await fetch(downloadApiUrl, {
      method: "GET",
      headers: buildAuthHeaders(ENV.forgeApiKey),
    });
    const url = (await response.json()).url;
    return { key, url };
  }

  // Default to just returning the key as URL (this might not be right for non-public blobs, 
  // but for gallery it should be fine if we store the full URL)
  return { key, url: key };
}
