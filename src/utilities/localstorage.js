
// Asynchronous function to set item in localStorage
export const setItemStorage = async (key, value) => {
    try {
      // Wrap the operation in a promise
      await new Promise((resolve, reject) => {
        try {
          // Convert value to JSON string before saving
          const serializedValue = JSON.stringify(value);
          localStorage.setItem(key, serializedValue);
          resolve(); // Resolve promise when done
        } catch (error) {
          reject("Error saving to localStorage"); // Reject promise if error occurs
        }
      });
    } catch (error) {
      console.error("Error saving to localStorage", error);
    }
  }
  
  // Asynchronous function to get item from localStorage
  export const getItemStorage = async (key) => {
    try {
      // Wrap the operation in a promise
      const value = await new Promise((resolve, reject) => {
        try {
          const serializedValue = localStorage.getItem(key);
          // Parse JSON string back to JavaScript object
          if (serializedValue) {
            resolve(JSON.parse(serializedValue));
          } else {
            resolve(null);
          }
        } catch (error) {
          reject("Error reading from localStorage");
        }
      });
      return value;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return null;
    }
  }