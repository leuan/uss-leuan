import { writable } from 'svelte/store';
import Keycloak from 'keycloak-js';
import { keycloakConfig } from '$lib/kcConfig';

const keycloakInstance = writable(null);
const user = writable(null);

const mockKeycloak = {
	token: "-",
	updateToken: async (x) => {
		return;
	}
}

const mockUserProfile = {
	username: "test"
}

const initKeycloak = async () => {
	//use mocks for dev mode
	if (import.meta.env.MODE === 'development') {
		keycloakInstance.set(mockKeycloak);
		user.set(mockUserProfile)
		return;
	}
	
	const keycloak = new Keycloak(keycloakConfig);
	try {
		const authenticated = await keycloak.init({
			onLoad: 'check-sso',
			silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
		});

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

const fetchWithToken = async (url, data) => {};

export { initKeycloak, keycloakInstance, user };
