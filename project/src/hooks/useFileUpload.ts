import { useState, useCallback } from 'react';

type FileSlot = {
  file: File | null;
  previewUrl?: string;
  error?: string | null;
  progress?: number;
};

type UseFileUploadOptions = {
  maxSizeMB?: number;
  accept?: string;
};

const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const { maxSizeMB = 10, accept = 'image/*' } = options;
  const [slots, setSlots] = useState<Record<string, FileSlot>>({});
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = useCallback((file: File): string | null => {
    if (!file) return 'No file selected';
    
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) return `File too large (max ${maxSizeMB} MB)`;

    if (accept) {
      const parts = accept.split(',').map(s => s.trim()).filter(Boolean);
      const ok = parts.some(p => {
        if (p.endsWith('/*')) {
          return file.type.startsWith(p.slice(0, -2));
        }
        if (p.startsWith('.')) {
          return file.name.toLowerCase().endsWith(p.toLowerCase());
        }
        return file.type === p;
      });
      if (!ok) return 'Unsupported file type';
    }
    return null;
  }, [accept, maxSizeMB]);

  const createPreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve('');
      }
    });
  }, []);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newSlots: Record<string, FileSlot> = {};

    for (const file of fileArray) {
      const error = validateFile(file);
      const previewUrl = await createPreview(file);
      const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      newSlots[id] = {
        file,
        previewUrl: previewUrl || undefined,
        error: error || undefined,
        progress: 0
      };
    }

    setSlots(prev => ({
      ...prev,
      ...newSlots
    }));

    return Object.keys(newSlots);
  }, [validateFile, createPreview]);

  const removeFile = useCallback((slotId: string) => {
    setSlots(prev => {
      const newSlots = { ...prev };
      delete newSlots[slotId];
      return newSlots;
    });
  }, []);

  const updateProgress = useCallback((slotId: string, progress: number) => {
    setSlots(prev => ({
      ...prev,
      [slotId]: {
        ...prev[slotId],
        progress
      }
    }));
  }, []);

  const clearAll = useCallback(() => {
    setSlots({});
  }, []);

  const getFiles = useCallback(() => {
    return Object.entries(slots).reduce((acc, [id, slot]) => {
      if (slot.file) {
        acc[id] = slot.file;
      }
      return acc;
    }, {} as Record<string, File>);
  }, [slots]);

  return {
    slots,
    isDragging,
    addFiles,
    removeFile,
    updateProgress,
    clearAll,
    getFiles,
    setIsDragging,
    hasFiles: Object.keys(slots).length > 0,
    hasErrors: Object.values(slots).some(slot => slot.error)
  };
};

export default useFileUpload;
