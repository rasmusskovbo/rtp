function load() {
    var feed ="http://www.espn.com/blog/feed?blog=nflnation";
    new GFdynamicFeedControl(feed, "feedControl");
}

google.load("feeds", "1");
google.setOnLoadCallback(load);