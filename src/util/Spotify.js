import React from "react";
let accessToken = "";
let clientID = "4377783abe9548079777b70c980d605e";
const redirectUri = "http://localhost:3000/";
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
		alert("inside spotify");
		const accessToken = Spotify.getAccessToken();

		console.log(term);
		return Spotify.fetch(
			`https://api.spotify.com/v1/search?type=track&q=${term}`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		)
			.then((response) => {
				return response.json();
			})
			.then((jsonResponse) => {
				if (!jsonResponse.tracks) {
					return [];
				} else {
					return jsonResponse.tracks.items.map((track) => ({
						id: track.id,
						name: track.name,
						artist: track.artist[0].name,
						album: track.album.name,
						uri: track.uri,
					}));
				}
			});
	},
	savePlaylist(name, trackUris) {
		let accessToken = Spotify.getAccessToken;
		let headers = {
			Authorization: `Bearer ${accessToken}`,
		};
		let userId;
		if (!name || !trackUris.length) {
			return;
		}

		return Spotify.fetch("https://api.spotify.com/v1/me", {
			headers: headers,
		})
			.then((response) => {
				return response.json();
			})
			.then((jsonResponse) => {
				userId = jsonResponse.id;
				return fetch(`/v1/users/{user_id}/playlists`, {
					headers: headers,
					method: "POST",
					body: JSON.stringify({ name: name }),
				})
					.then((response) => {
						return response.json();
					})
					.then((jsonResponse) => {
						const playlistID = jsonResponse.id;
						return fetch(`/v1/users/${userId}/playlists/${playlistID}/tracks`, {
							headers: headers,
							method: "POST",
							body: JSON.stringify({
								uris: trackUris,
							}),
						});
					});
			});
	},
};
export default Spotify;
