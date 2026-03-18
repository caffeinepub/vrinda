import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";

actor {
  type Song = {
    videoId : Text;
    title : Text;
    artist : Text;
  };

  type Preferences = {
    favoriteMood : Text;
    recentlyPlayed : List.List<Text>;
  };

  type PreferencesView = {
    favoriteMood : Text;
    recentlyPlayed : [Text];
  };

  type UserData = {
    preferences : Preferences;
    likedSongs : List.List<Song>;
  };

  module Song {
    public func compare(song1 : Song, song2 : Song) : Order.Order {
      switch (Text.compare(song1.artist, song2.artist)) {
        case (#equal) { Text.compare(song1.title, song2.title) };
        case (order) { order };
      };
    };
  };

  let users = Map.empty<Principal, UserData>();

  // Initialize user data if not exists
  func getUserData(caller : Principal) : UserData {
    switch (users.get(caller)) {
      case (null) {
        let newUserData : UserData = {
          preferences = {
            favoriteMood = "";
            recentlyPlayed = List.empty<Text>();
          };
          likedSongs = List.empty<Song>();
        };
        users.add(caller, newUserData);
        newUserData;
      };
      case (?userData) { userData };
    };
  };

  // Preferences functions
  public shared ({ caller }) func savePreferences(favoriteMood : Text, recentlyPlayed : [Text]) : async () {
    let userData = getUserData(caller);

    let newRecentlyPlayed = List.empty<Text>();
    var count = 0;
    for (videoId in recentlyPlayed.values()) {
      if (count < 20) {
        newRecentlyPlayed.add(videoId);
        count += 1;
      };
    };

    let newPreferences : Preferences = {
      favoriteMood;
      recentlyPlayed = newRecentlyPlayed;
    };

    let updatedUserData : UserData = {
      preferences = newPreferences;
      likedSongs = userData.likedSongs;
    };

    users.add(caller, updatedUserData);
  };

  public query ({ caller }) func getPreferences() : async PreferencesView {
    let userData = getUserData(caller);
    {
      favoriteMood = userData.preferences.favoriteMood;
      recentlyPlayed = userData.preferences.recentlyPlayed.toArray();
    };
  };

  // Liked songs functions
  public shared ({ caller }) func likeSong(videoId : Text, title : Text, artist : Text) : async () {
    let userData = getUserData(caller);
    let likedSongs = userData.likedSongs;

    // Check if song already liked
    for (song in likedSongs.values()) {
      if (song.videoId == videoId) {
        Runtime.trap("Song already liked");
      };
    };

    let newSong : Song = {
      videoId;
      title;
      artist;
    };
    likedSongs.add(newSong);

    let updatedUserData : UserData = {
      preferences = userData.preferences;
      likedSongs;
    };

    users.add(caller, updatedUserData);
  };

  public shared ({ caller }) func unlikeSong(videoId : Text) : async () {
    let userData = getUserData(caller);
    let filteredSongs = userData.likedSongs.filter(
      func(song) {
        song.videoId != videoId;
      }
    );

    if (filteredSongs.size() == userData.likedSongs.size()) {
      Runtime.trap("Song not found in liked songs");
    };

    let updatedUserData : UserData = {
      preferences = userData.preferences;
      likedSongs = filteredSongs;
    };

    users.add(caller, updatedUserData);
  };

  public query ({ caller }) func getLikedSongs() : async [Song] {
    let userData = getUserData(caller);
    userData.likedSongs.toArray().sort();
  };
};
