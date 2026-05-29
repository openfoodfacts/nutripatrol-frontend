import { OpenFoodFacts, NutriPatrol } from "@openfoodfacts/openfoodfacts-nodejs";

/**
 * Custom fetch wrapper to ensure cookies are sent with cross-origin requests.
 * Nutri-Patrol frontend relies on the 'session' cookie from OpenFoodFacts.
 */
const customFetch: typeof fetch = (url, init) => {
    return fetch(url, { ...init, credentials: "include" });
};

// Initialize the main Open Food Facts client
export const offClient = new OpenFoodFacts(customFetch, { 
    host: import.meta.env.VITE_PO_URL || "https://world.openfoodfacts.org" 
});

// Initialize the Nutri-Patrol specific client
// TODO(sdk-bump): Use offClient.nutriPatrol directly once SDK version is bumped
export const npClient = new NutriPatrol(customFetch, { 
    baseUrl: import.meta.env.VITE_API_URL || "https://nutripatrol.openfoodfacts.org" 
});

// For convenience, also expose the integrated client
export const sdk = offClient;
