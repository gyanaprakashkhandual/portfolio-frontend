// Environment Configuration
// Dynamically switches between development, staging, and production environments

const getEnvironmentConfig = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
  const nodeEnv = process.env.NODE_ENV || "development";

  return {
    baseUrl,
    nodeEnv,
    isDevelopment: nodeEnv === "development",
    isProduction: nodeEnv === "production",

    // API Endpoints
    api: {
      music: `${baseUrl}/api/music`,
      skills: `${baseUrl}/api/skills`,
      blogs: `${baseUrl}/api/blogs`,
      experience: `${baseUrl}/api/experience`,
      education: `${baseUrl}/api/education`,
      projects: `${baseUrl}/api/projects`,
      contact: `${baseUrl}/api/contact`,
      docs: `${baseUrl}/api/docs`,
    },

    // Helper function to get music activity URL
    getMusicActivityUrl: (musicId: string) => `${baseUrl}/api/music/${musicId}`,
  };
};

export const envConfig = getEnvironmentConfig();

// Export individual endpoints for convenience
export const {
  baseUrl,
  api,
  isDevelopment,
  isProduction,
  getMusicActivityUrl,
} = envConfig;
