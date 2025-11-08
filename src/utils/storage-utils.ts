export const checkLocalStorageQuota = (): { hasSpace: boolean; used: number; remaining: number } => {
  if (typeof window === 'undefined') {
    return { hasSpace: true, used: 0, remaining: 0 };
  }

  try {
    // Test if we can write to localStorage
    const testKey = 'quota-test';
    const testData = 'a'.repeat(1024 * 1024); // 1MB test data
    
    localStorage.setItem(testKey, testData);
    localStorage.removeItem(testKey);
    
    return { hasSpace: true, used: 0, remaining: 1024 * 1024 * 5 }; // Assume 5MB remaining
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      // Calculate used space
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length * 2; // Approximate byte size
        }
      }
      
      return { 
        hasSpace: false, 
        used: Math.round(used / 1024), // KB
        remaining: 0 
      };
    }
    return { hasSpace: true, used: 0, remaining: 1024 * 1024 * 5 };
  }
};

export const compressImageIfNeeded = (dataUrl: string, maxSizeKB: number = 100): Promise<string> => {
  return new Promise((resolve) => {
    if (!dataUrl.startsWith('data:image') || dataUrl.length <= maxSizeKB * 1024) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Reduce size until it fits
      while ((width * height * 4) > maxSizeKB * 1024 && width > 50 && height > 50) {
        width = Math.floor(width * 0.8);
        height = Math.floor(height * 0.8);
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressedDataUrl);
    };
    
    img.onerror = () => resolve(dataUrl); // Fallback to original if compression fails
    img.src = dataUrl;
  });
};