import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

type DomainRedirect = {
	[key: string]: {
		scope: string[];
		access_type: string;
		prompt: string;
		login_hint?: string;
	};
};

const domainRedirect: DomainRedirect = {
	'example.com': {
		scope: [
			'https://www.exampleapis.com/auth/userinfo.email',
			'https://www.exampleapis.com/auth/userinfo.profile',
		],
		access_type: 'online', // 'online' (default) or 'offline' (gets refresh_token). The differences between these are as follows:
		// 'online': Will only get an access token. This is useful if you only need to authenticate the user once. Examples include sign-in, sign-up, and password reset.
		// 'offline': Will get an access token and a refresh token. This is useful if you need to authenticate the user multiple times. Examples include sending emails, accessing user data, and updating user data.
		prompt: 'consent', // 'none' (default), 'consent', 'select_account', or 'consent select_account'. The differences between these are as follows:
		// 'none': Will never prompt the user for authorization. If the user has not previously authorized the application, the user will be redirected to the consent screen.
		// 'consent': Will always prompt the user for consent. This is useful if you need to ensure that the user sees the consent screen.
		// 'select_account': Will prompt the user to select an account. This allows multiple accounts to be signed in.
		// 'consent select_account': Will prompt the user to select an account and to consent to the requested scopes. This allows multiple accounts to be signed in.
	},
	'gmail.com': {
		scope: [
			'https://www.googleapis.com/auth/userinfo.email',
			'https://www.googleapis.com/auth/userinfo.profile',
		],
		access_type: 'online',
		prompt: 'consent',
	},
	'zacknetic.org': {
		scope: [
			'https://www.googleapis.com/auth/userinfo.email',
			'https://www.googleapis.com/auth/userinfo.profile',
		],
		access_type: 'online',
		prompt: 'consent',
	},
};

export async function login(email: string): Promise<string> {
	const domain = email.split('@')[1];
	if (!domainRedirect[domain]) throw new Error('Unauthorized domain');

	let newRedirectInfo = domainRedirect[domain];
	newRedirectInfo.login_hint = email;

	const authUrl = oAuth2Client.generateAuthUrl(domainRedirect[domain]);
	return authUrl;
}

export async function verifyToken(token: any): Promise<string> {
	const ticket = await oAuth2Client.verifyIdToken({
		idToken: token,
		audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
	});

	const payload = ticket.getPayload();
	if (!payload) throw new Error('No payload found');

	const domain = payload?.['hd'] as string; // 'hd' is the hosted domain of the user
	if (!domainRedirect[domain]) throw new Error('Unauthorized domain');

	const isExpired = payload.exp < Date.now() / 1000;
	if (!payload.exp || isExpired) throw new Error('Token expired');
    if(!payload.email) throw new Error('No email found in payload');

	return payload.email; // Assuming 'email' is the correct key in the payload
}

export async function getIdToken(code: string): Promise<string> {
	const { tokens } = await oAuth2Client.getToken(code);
	const idToken = tokens.id_token;
	if (!idToken) throw new Error('No idToken found');

	return idToken;
}
