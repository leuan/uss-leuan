import { get } from 'svelte/store';
import { keycloakInstance } from '$lib/auth';

const fetchWithToken = async (url, options = {}) => {
    const keycloak = get(keycloakInstance);

    if (!keycloak) {
        throw new Error("Keycloak instance is not available.");
    }

    try {
        await keycloak.updateToken(30);

        const headers = new Headers(options.headers || {});
        headers.append('Authorization', `Bearer ${keycloak.token}`);

        const fetchOptions = {
            ...options,
            headers
        };

        const response = await fetch(url, fetchOptions);

        return response;
    } catch (err) {
        console.error('Error fetching data with token:', err);
        throw err; // Re-throw to allow caller to handle errors
    }
};

export { fetchWithToken };
