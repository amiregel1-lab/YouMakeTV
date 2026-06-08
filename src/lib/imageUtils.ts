function compressToJpeg(dataUrl: string, maxW: number, maxH: number, quality: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(dataUrl); return; }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// Compress to poster size (2:3 portrait). Max 400×600, JPEG 75%.
export function compressPosterImage(dataUrl: string): Promise<string> {
  return compressToJpeg(dataUrl, 400, 600, 0.75);
}

// Compress to backdrop/hero size (16:9 landscape). Max 1280×720, JPEG 88%.
// Higher quality than poster because blur is much more visible at full-width hero scale.
export function compressBackdropImage(dataUrl: string): Promise<string> {
  return compressToJpeg(dataUrl, 1280, 720, 0.88);
}
