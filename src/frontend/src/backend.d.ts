import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Song {
    title: string;
    artist: string;
    videoId: string;
}
export interface PreferencesView {
    favoriteMood: string;
    recentlyPlayed: Array<string>;
}
export interface backendInterface {
    getLikedSongs(): Promise<Array<Song>>;
    getPreferences(): Promise<PreferencesView>;
    likeSong(videoId: string, title: string, artist: string): Promise<void>;
    savePreferences(favoriteMood: string, recentlyPlayed: Array<string>): Promise<void>;
    unlikeSong(videoId: string): Promise<void>;
}
