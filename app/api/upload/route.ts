import { NextResponse } from "next/server";
import crypto from "crypto";

// Cloudinary unsigned uploads won't work for us — we need server-side signed upload
// to keep API secret safe. This route accepts base64 from the client,
// uploads to Cloudinary via their REST API, and returns the secure URL.

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export async function POST(request: Request) {
  try {
    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      return NextResponse.json(
        { error: "Cloudinary credentials not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { base64Data, mimeType, userId, documentId } = body;

    if (!base64Data || !userId || !documentId) {
      return NextResponse.json(
        { error: "Missing required fields: base64Data, userId, documentId" },
        { status: 400 },
      );
    }

    // Build data URI for Cloudinary
    const resolvedMime = mimeType || "image/jpeg";
    const dataUri = `data:${resolvedMime};base64,${base64Data}`;

    // Generate signature for signed upload
    const timestamp = Math.round(Date.now() / 1000);
    const folder = `schemesetu/${userId}`;
    const publicId = documentId;

    // Parameters to sign (must be sorted alphabetically)
    const paramsToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign)
      .digest("hex");

    // Determine resource_type based on mime
    const resourceType = resolvedMime === "application/pdf" ? "raw" : "image";

    // Upload to Cloudinary REST API
    const formData = new FormData();
    formData.append("file", dataUri);
    formData.append("api_key", API_KEY);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);
    formData.append("folder", folder);
    formData.append("public_id", publicId);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

    const cloudRes = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!cloudRes.ok) {
      const errText = await cloudRes.text();
      console.error("[Upload] Cloudinary error:", errText);
      return NextResponse.json(
        { error: `Cloudinary upload failed: ${cloudRes.status}` },
        { status: 502 },
      );
    }

    const cloudData = await cloudRes.json();

    return NextResponse.json({
      url: cloudData.secure_url,
      publicId: cloudData.public_id,
      format: cloudData.format,
      bytes: cloudData.bytes,
      resourceType: cloudData.resource_type,
    });
  } catch (error: unknown) {
    console.error("[Upload] Error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
