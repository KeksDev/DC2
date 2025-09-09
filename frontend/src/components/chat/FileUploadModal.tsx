'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileList) => Promise<void>;
  maxSize: number;
  acceptedTypes: Record<string, string[]>;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  maxSize,
  acceptedTypes
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    // Check file size
    if (file.size > maxSize) {
      alert(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
      return;
    }

    // Check file type using acceptedTypes
    const allowedMimeTypes = Object.keys(acceptedTypes);
    const isAllowed = allowedMimeTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAllowed) {
      alert('File type not supported');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Create a FileList-like object with the single file
      const fileList = {
        0: selectedFile,
        length: 1,
        item: (index: number) => index === 0 ? selectedFile : null,
        [Symbol.iterator]: function* () {
          yield selectedFile;
        }
      } as FileList;
      
      await onUpload(fileList);
      setSelectedFile(null);
      onClose();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[var(--dark-bg)] rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Upload File
        </h2>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-[var(--primary)] bg-[var(--primary)] bg-opacity-10'
              : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {selectedFile ? (
            <div className="space-y-2">
              <div className="text-[var(--text-primary)] font-medium">
                {selectedFile.name}
              </div>
              <div className="text-[var(--text-secondary)] text-sm">
                {formatFileSize(selectedFile.size)}
              </div>
              <div className="text-[var(--privacy)] text-sm flex items-center justify-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Will be encrypted
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <svg className="w-12 h-12 text-[var(--text-muted)] mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div>
                <p className="text-[var(--text-primary)] mb-1">
                  Drop a file here or click to browse
                </p>
                <p className="text-[var(--text-secondary)] text-sm">
                  Maximum size: {Math.round(maxSize / (1024 * 1024))}MB
                </p>
                <p className="text-[var(--text-secondary)] text-xs mt-1">
                  Supported: Images, PDFs, Text, Audio, Video
                </p>
              </div>
              <input
                type="file"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    handleFileSelect(files[0]);
                  }
                }}
                className="hidden"
                id="fileInput"
                accept={Object.entries(acceptedTypes).map(([type, exts]) => 
                  type.endsWith('/*') ? type : exts.join(',')
                ).join(',')}
              />
              <label
                htmlFor="fileInput"
                className="inline-block px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--secondary)] cursor-pointer transition-colors"
              >
                Choose File
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <motion.button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              onClose();
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FileUploadModal;