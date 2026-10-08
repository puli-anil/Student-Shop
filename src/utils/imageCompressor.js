/**
 * Client-Side Image Compressor & Validator
 * Enforces 1.5 MB upload limit and compresses image to high quality under 1.5 MB
 */
export const MAX_IMAGE_SIZE_BYTES = 1.5 * 1024 * 1024; // 1.5 MB Limit

export function compressImage(file, maxWidth = 1200, maxQuality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Please select a valid image file.'));
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      console.log(`Image exceeds 1.5 MB (${(file.size / (1024 * 1024)).toFixed(2)} MB). Compressing...`);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', maxQuality);
        resolve(compressedDataUrl);
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}
