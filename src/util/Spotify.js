let accessToken = "";
let clientID = "4377783abe9548079777b70c980d605e";
const redirectUri = "http://dirty-attention.surge.sh";
const Spotify = {
	getAccessToken() {
		if (accessToken) {
			return accessToken;
		}
		const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
		const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
		if (accessTokenMatch && expiresInMatch) {
			accessToken = accessTokenMatch[1];
			const expiresIn = Number(expiresInMatch[1]);

			window.setTimeout(() => (accessToken = ""), expiresIn * 1000);
			window.history.pushState("Access Token", null, "/");
			return accessToken;
		} else {
			const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
			window.location = accessUrl;
		}
	},
	search(term) {
		const accessToken = Spotify.getAccessToken();

		console.log(term);
		return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		})
			.then((response) => {
				return response.json();
			})
			.then((jsonResponse) => {
				console.log(jsonResponse);
				if (!jsonResponse.tracks) {
					return [];
				} else {
					let tracks = jsonResponse.tracks.items.map((track) => ({
						id: track.id,
						name: track.name,
						artist: track.artists[0].name,
						album: track.album.name,
						uri: track.uri,
						preview: track.preview_url,
					}));
					return tracks;
				}
			});
	},
	savePlaylist(name, trackUris) {
		if (!name || !trackUris.length) {
			return;
		}
		const accessToken = Spotify.getAccessToken();
		const headers = {
			Authorization: `Bearer ${accessToken}`,
		};
		let userId;

		return fetch("https://api.spotify.com/v1/me", {
			headers: headers,
		})
			.then((response) => {
				return response.json();
			})
			.then((jsonResponse) => {
				userId = jsonResponse.id;
				return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
					headers: headers,
					method: "POST",
					body: JSON.stringify({ name: name }),
				})
					.then((response) => {
						return response.json();
					})
					.then((jsonResponse) => {
						const playlistID = jsonResponse.id;
						return fetch(
							`https://api.spotify.com/v1/users/${userId}/playlists/${playlistID}/tracks`,
							{
								headers: headers,
								method: "POST",
								body: JSON.stringify({
									uris: trackUris,
								}),
							}
						);
					});
			});
	},
};
export default Spotify;
