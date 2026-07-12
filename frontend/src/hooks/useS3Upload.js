import { useState } from 'react';
import { uploadAdminService } from '../services/apiServices';

const useS3Upload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadFile = async (file, purpose = 'CATEGORY_HERO') => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Step 1: Get pre-signed URL from our backend
      setUploadProgress(10);
      const presignData = await uploadAdminService.presignUrl({
        purpose,
        contentType: file.type,
        file_size: file.size,
      });
      
      const { uploadUrl, objectKey } = presignData;
      setUploadProgress(30);

      // Step 2: Upload the raw file directly to S3 via XMLHttpRequest 
      // (to track upload progress, fetch doesn't support upload progress natively)
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 70);
            setUploadProgress(30 + percentComplete); // 30% to 100%
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`S3 upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error('S3 upload failed due to network error'));
        };

        xhr.open('PUT', uploadUrl, true);
        // Important: Content-Type must exactly match what was pre-signed
        xhr.setRequestHeader('Content-Type', file.type);
        // Do NOT send Authorization header for S3 PUT
        xhr.send(file);
      });

      setUploadProgress(100);
      setIsUploading(false);
      return objectKey;
    } catch (err) {
      setIsUploading(false);
      setError(err.message || 'Failed to upload file');
      throw err;
    }
  };

  return { uploadFile, isUploading, uploadProgress, error };
};

export default useS3Upload;
