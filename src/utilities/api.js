
export const dba = "snackersajman";

//export const baseURL = "http://localhost:8000/"
export const baseURL = "https://jarcrm-fwe8dfg5f6h0eabe.uaenorth-01.azurewebsites.net/";

export const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
};
