require('/Users/nickcox/projects/two_hardest_problems/node_modules/dotenv')
  .config({ path: '/Users/nickcox/projects/two_hardest_problems/.env' });

var http = require('http'),
    path = require('path');
    nodeModuleDir = process.env.NODE_MODULE_DIR,
    unirest = require(path.resolve(nodeModuleDir, 'unirest')),
    Twit = require(path.resolve(nodeModuleDir, 'twit')),
    titles = [],
    titleToUse = '';

var T = new Twit({
  consumer_key:         process.env.CONSUMER_KEY,
  consumer_secret:      process.env.CONSUMER_SECRET,
  access_token:         process.env.ACCESS_TOKEN,
  access_token_secret:  process.env.ACCESS_TOKEN_SECRET
});

var chooseRandom = function (arr) {
  var index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

var tweetBody = function (firstProblem, secondProblem) {
  return "The two hardest problems in computer science are " + firstProblem + " and " + secondProblem + ".";
}

var topStorySections = [
  'world',
  'national',
  'politics',
  'business',
  'opinion',
  'technology',
  'science',
  'health',
  'sports',
  'arts',
  'fashion',
]

var composeTweet = function(titleToUse){
  unirest.post("https://textanalysis.p.mashape.com/textblob-noun-phrase-extraction")
    .header("X-Mashape-Key", process.env.MASHAPE_API_KEY)
    .header("Content-Type", "application/x-www-form-urlencoded")
    .header("Accept", "application/json")
    .send("text=" + titleToUse)
    .end(function (result) {
       var phrases = result.body.noun_phrases,
           firstProblem = chooseRandom(phrases),
           secondProblem = chooseRandom(phrases);
      while (firstProblem === secondProblem){
        firstProblem = chooseRandom(phrases);
        secondProblem = chooseRandom(phrases);
      }
      var botStatus = tweetBody(firstProblem, secondProblem);
      T.post('statuses/update', { status: botStatus }, function(err, data, response) {
        console.log(data)
      });
    });
}

var nyTimesUrl = "http://api.nytimes.com/svc/topstories/v1/" + chooseRandom(topStorySections) + ".json?api-key=" + process.env.NY_TIMES_API_KEY;

http.get(nyTimesUrl, function(res){
  res.setEncoding('utf-8');
  var body = '';
  res.on('data', function(chunk) {
    body += chunk;
  });
  res.on('end', function() {
    var newBody = JSON.parse(body);
        results = newBody.results;
        resLength = results.length;
    for (var i = 0; i < resLength; i++) {
      title = results[i].title;
      titles.push(title);
    }
    titleToUse = chooseRandom(titles);
    while (titleToUse.length <= 2){
      titleToUse = chooseRandom(titles);
    }
    composeTweet(titleToUse);
  });
}).on('error', function(e){
  console.log(e);
});
