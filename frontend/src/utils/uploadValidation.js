export const UPLOAD_LIMITS = {
  IMAGE_MAX_BYTES: 2 * 1024 * 1024,       // 2 MB
  DOCUMENT_MAX_BYTES: 10 * 1024 * 1024,   // 10 MB
  IMAGE_ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  IMAGE_ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  DOCUMENT_ALLOWED_TYPES: ['application/pdf', 'application/zip'], // Note: Assuming zip is allowed for documents based on previous code
};

/**
 * Validates an image or document file before upload.
 * Returns null if valid, or an error message string if invalid.
 * Call this on file input change AND on drag-and-drop.
 *
 * @param {File} file
 * @param {'image' | 'document'} purpose
 * @returns {string | null}
 */
export function validateUploadFile(file, purpose) {
  if (!file) return 'No file selected.';
  
  if (file.size === 0) {
    return 'File is empty or could not be read.';
  }

  if (purpose === 'image') {
    const ext = '.' + file.name.split('.').pop().toLowerCase();

    if (!UPLOAD_LIMITS.IMAGE_ALLOWED_TYPES.includes(file.type)) {
      return 'Only JPEG, PNG, and WebP images are supported.';
    }

    if (!UPLOAD_LIMITS.IMAGE_ALLOWED_EXTENSIONS.includes(ext)) {
      return 'File extension does not match the image type. Please use a valid image file.';
    }

    if (file.size > UPLOAD_LIMITS.IMAGE_MAX_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return `Image is too large (${sizeMB} MB). Maximum allowed size is 2 MB.`;
    }

    return null; // valid
  }

  if (purpose === 'document') {
    // Note: PDF is strict in MD file, but zip might be allowed in existing codebase.
    // Assuming strict PDF as per MD file
    if (file.type !== 'application/pdf') {
      return 'Only PDF files are supported for documents.';
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return 'File extension must be .pdf.';
    }

    if (file.size > UPLOAD_LIMITS.DOCUMENT_MAX_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return `Document is too large (${sizeMB} MB). Maximum allowed size is 10 MB.`;
    }

    return null; // valid
  }

  return 'Unknown upload purpose.';
}
