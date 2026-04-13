import 'dotenv/config';
import path from 'path';

export default ({ config }) => {
    // Load environment-specific env file
    const envFile = process.env.APP_VARIANT === 'production' ? '.env.prod' : '.env.dev';
    require('dotenv').config({ path: path.resolve(__dirname, envFile) });

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

