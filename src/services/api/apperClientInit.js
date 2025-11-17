let apperClientInstance = null;

export const getApperClient = () => {
  if (!apperClientInstance) {
    if (!window.ApperSDK) {
      console.warn('ApperSDK not available on window object');
      return null;
    }

    try {
      const { ApperClient } = window.ApperSDK;
      const projectId = import.meta.env.VITE_APPER_PROJECT_ID;
      const publicKey = import.meta.env.VITE_APPER_PUBLIC_KEY;

      if (!projectId) {
        console.error('VITE_APPER_PROJECT_ID is required');
        return null;
      }

      apperClientInstance = new ApperClient({
        apperProjectId: projectId,
        apperPublicKey: publicKey,
      });

      return apperClientInstance;
    } catch (error) {
      console.error('Failed to initialize ApperClient:', error);
      return null;
    }
  }

  return apperClientInstance;
};

export const resetApperClient = () => {
  apperClientInstance = null;
};