import { writable } from 'svelte/store';
import Keycloak from 'keycloak-js';
import { keycloakConfig } from '$lib/kcConfig';

const keycloakInstance = writable(null);
const user = writable(null);

const initKeycloak = async () => {
	const keycloak = new Keycloak(keycloakConfig);
	try {
		const authenticated = await keycloak.init({ onLoad: 'login-required' });

		if (authenticated) {
			keycloakInstance.set(keycloak);
			const userProfile = await keycloak.loadUserProfile();
			user.set(userProfile);
		} else {
			await keycloak.login();
		}
	} catch (e) {
		console.error(e);
	}
};

const fetchWithToken = async (url, data) => {

};

export { initKeycloak, keycloakInstance, user };
