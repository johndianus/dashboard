// Store a value in sessionStorage
export function setSessionValue(key, value) {
  try {
    const json = JSON.stringify(value);
    sessionStorage.setItem(key, json);
  } catch (err) {
    console.error('Failed to save to sessionStorage:', err);
  }
}
  
// Retrieve a value from sessionStorage
export function getSessionValue(key) {
  try {
    const json = sessionStorage.getItem(key);
    return json ? JSON.parse(json) : null;
  } catch (err) {
    console.error('Failed to read from sessionStorage:', err);
    return null;
  }
}
  
// Remove a value from sessionStorage
export function removeSessionValue(key) {
  try {
    sessionStorage.removeItem(key);
  } catch (err) {
    console.error('Failed to remove from sessionStorage:', err);
  }
}
  