type UploadSignatureParams = Record<string, string | number>

export function getCloudinaryConfig() {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  }
}

export function assertCloudinaryEnv() {
  const config = getCloudinaryConfig()

  if (!config.cloudName || !config.apiKey || !config.apiSecret) {
    throw new Error('Faltan variables de entorno de Cloudinary')
  }

  return config
}

export async function signCloudinaryParams(_params: UploadSignatureParams) {
  assertCloudinaryEnv()
  return {
    signature: 'mock-signature',
    timestamp: Math.floor(Date.now() / 1000),
  }
}
