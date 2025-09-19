import React, { useState, useRef } from 'react'

const ImageUploader = ({ onImageUploaded, currentImageUrl = null, className = '' }) => {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)

  const handleFiles = async (files) => {
    const file = files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `recipes/${fileName}`

      // Get signed upload URL from API
      const signResponse = await fetch('/api/admin/sign-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          path: filePath,
          contentType: file.type
        })
      })

      if (!signResponse.ok) {
        throw new Error('Failed to get upload URL')
      }

      const { success, url, error } = await signResponse.json()

      if (!success) {
        throw new Error(error || 'Failed to get upload URL')
      }

      // Upload file directly to Supabase Storage
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image')
      }

      // Construct public URL
      const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/recipe-images/${filePath}`

      setUploadProgress(100)
      onImageUploaded(publicUrl, file.name)

    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const onButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
        disabled={uploading}
      />

      {currentImageUrl ? (
        <div className="relative">
          <img
            src={currentImageUrl}
            alt="Recipe"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
            <button
              type="button"
              onClick={onButtonClick}
              disabled={uploading}
              className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white text-gray-700 px-4 py-2 rounded-md shadow-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Change Image'}
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 transition-colors ${
            dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">Uploading image...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                <button
                  type="button"
                  onClick={onButtonClick}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Upload an image
                </button>
                <p className="text-gray-500">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ImageUploader
