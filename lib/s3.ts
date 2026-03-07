// S3-compatible client / presigned URLs — to be implemented
// Use env: S3_BUCKET, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY, S3_ENDPOINT

export async function getPresignedUploadUrl(
  key: string,
  contentType: string
): Promise<{ url: string; key: string }> {
  return { url: "", key };
}

export async function getPublicUrl(key: string): Promise<string> {
  return "";
}
