import { socialApi } from '@/lib/apiService'

interface CloudinaryUploadResponse {
  secure_url?: unknown
  error?: {
    message?: unknown
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const response = await socialApi.getUploadSignature()
  const { timestamp, folder, signature, apiKey, cloudName } = response.data.data

  if (!timestamp || !folder || !signature || !apiKey || !cloudName) {
    throw new Error('The image upload signature is incomplete')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', apiKey)
  formData.append('timestamp', String(timestamp))
  formData.append('folder', folder)
  formData.append('signature', signature)

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
    {
      method: 'POST',
      body: formData,
      credentials: 'omit',
    },
  )

  let result: unknown
  try {
    result = await uploadResponse.json()
  } catch {
    throw new Error(`Cloudinary image upload failed with status ${uploadResponse.status}`)
  }

  const cloudinaryResponse: CloudinaryUploadResponse = isRecord(result)
    ? {
        secure_url: result.secure_url,
        error: isRecord(result.error)
          ? { message: result.error.message }
          : undefined,
      }
    : {}

  if (!uploadResponse.ok) {
    const message = cloudinaryResponse.error?.message
    throw new Error(
      typeof message === 'string' && message
        ? message
        : `Cloudinary image upload failed with status ${uploadResponse.status}`,
    )
  }

  if (typeof cloudinaryResponse.secure_url !== 'string') {
    throw new Error('Cloudinary did not return a secure image URL')
  }

  return cloudinaryResponse.secure_url
}
