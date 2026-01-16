# @tarxemo/react-uploader

[![npm version](https://img.shields.io/npm/v/@tarxemo/react-uploader.svg)](https://www.npmjs.com/package/@tarxemo/react-uploader)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A React file uploader component with drag-and-drop support, progress tracking, and file validation.

## Features

✅ **Drag & Drop** - Intuitive drag-and-drop interface  
✅ **File Validation** - Type and size restrictions  
✅ **Progress Tracking** - Upload progress indication  
✅ **Multiple Files** - Support for multiple file uploads  
✅ **Preview** - Image preview support  
✅ **TypeScript Support** - Full type definitions  
✅ **Customizable** - Flexible styling options

## Installation

\`\`\`bash
npm install @tarxemo/react-uploader
\`\`\`

## Quick Start

\`\`\`tsx
import { FileUploader } from '@tarxemo/react-uploader';

function UploadPage() {
  const handleUpload = async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    return response.json();
  };
  
  return (
    <FileUploader
      onUpload={handleUpload}
      accept="image/*"
      maxSize={5 * 1024 * 1024}  // 5MB
      multiple
    />
  );
}
\`\`\`

## API Reference

### FileUploader Props

\`\`\`tsx
interface FileUploaderProps {
  onUpload: (files: File[]) => Promise<any>;
  accept?: string;           // File types (e.g., "image/*", ".pdf")
  maxSize?: number;          // Max file size in bytes
  multiple?: boolean;        // Allow multiple files
  maxFiles?: number;         // Max number of files
  showPreview?: boolean;     // Show image previews
  disabled?: boolean;
  className?: string;
  onError?: (error: Error) => void;
}
\`\`\`

## Usage Examples

### Image Upload with Preview

\`\`\`tsx
<FileUploader
  onUpload={handleUpload}
  accept="image/jpeg,image/png,image/webp"
  maxSize={10 * 1024 * 1024}  // 10MB
  multiple
  maxFiles={5}
  showPreview
/>
\`\`\`

### PDF Upload

\`\`\`tsx
<FileUploader
  onUpload={handleUpload}
  accept=".pdf"
  maxSize={20 * 1024 * 1024}  // 20MB
  multiple={false}
/>
\`\`\`

### With Error Handling

\`\`\`tsx
<FileUploader
  onUpload={handleUpload}
  accept="image/*"
  maxSize={5 * 1024 * 1024}
  onError={(error) => {
    console.error('Upload error:', error);
    toast.error(error.message);
  }}
/>
\`\`\`

## License

MIT
# react-uploader
