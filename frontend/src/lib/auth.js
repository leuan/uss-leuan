import { writable } from 'svelte/store';
import Keycloak from 'keycloak-js';
import { keycloakConfig } from '$lib/kcConfig';

const keycloakInstance = writable(null);
const user = writable(null);
let keycloak;

const initKeycloak = async () => {
	if (import.meta.env.MODE === 'development') {
		const keycloakMock = {
			logout: async () => {
				return true;
			},
			accountManagement: async () => {
				return true;
			},
			updateToken: async (x) => {
				return true;
			},
			token: '-'
		};

		const mockUserProfile = {
			firstName: 'MOCK FIRST NAME'
		};

		keycloak = keycloakMock;
		keycloakInstance.set(keycloak);
		user.set(mockUserProfile);
		return;
	}
	keycloak = new Keycloak(keycloakConfig);
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

const logout = async () => {
	return keycloak.logout();
};

const account = async () => {
	return keycloak.accountManagement();
};
export { initKeycloak, keycloakInstance, user, logout, account };
