export function getProductImageSrc(imgId: string, objectName: string) {
  if (imgId.startsWith("http")) return imgId;
  return `/media/${imgId}/${objectName}`;
}
