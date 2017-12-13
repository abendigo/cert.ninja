export function getApiBaseUrl() {
  if (window.location.host === 'localhost:3000') return 'http://localhost:3001';
  return '';
}
