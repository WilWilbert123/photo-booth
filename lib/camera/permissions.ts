export async function checkCameraPermissions(): Promise<'prompt' | 'granted' | 'denied' | 'unsupported'> {
  if (typeof window === 'undefined' || !navigator.mediaDevices) {
    return 'unsupported';
  }

  // Verify HTTPS context (localhost is valid)
  if (
    window.location.protocol !== 'https:' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return 'unsupported';
  }

  try {
    if (navigator.permissions && navigator.permissions.query) {
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return permission.state as 'prompt' | 'granted' | 'denied';
    }
  } catch {
    // Fallback if permission query is not supported
  }

  return 'prompt';
}
