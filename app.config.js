export default ({ config }) => {
    return {
        ...config,
        extra: {
            ...config.extra,
            apiBaseUrl: process.env.API_BASE_URL || 'https://cheery-cod-687.convex.site/v1',
            authToken: process.env.AUTH_TOKEN ||"",
            eas: {
                projectId: "4423d503-7764-4c08-b1bf-65888dfee794"
            }
        }
    };
};
