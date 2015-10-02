require('/Users/nickcox/projects/two_hardest_problems/node_modules/dotenv')
  .config({ path: '/Users/nickcox/projects/two_hardest_problems/.env' });

var http = require('http'),
    path = require('path'),
    Q    = require('q'),
    nodeModuleDir = process.env.NODE_MODULE_DIR,
    unirest = require(path.resolve(nodeModuleDir, 'unirest')),
    Twit = require(path.resolve(nodeModuleDir, 'twit')),
    headlines = [],
    headlineToUse = '';

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

var getNounPhrases = function(headline){
  var deferred = Q.defer();
  unirest.post("https://textanalysis.p.mashape.com/textblob-noun-phrase-extraction")
    .header("X-Mashape-Key", process.env.MASHAPE_API_KEY)
    .header("Content-Type", "application/x-www-form-urlencoded")
    .header("Accept", "application/json")
    .send("text=" + headline)
    .end(function (result) {
       var phrases = result.body.noun_phrases,
           firstProblem = chooseRandom(phrases),
           secondProblem = chooseRandom(phrases);
      while (firstProblem === secondProblem){
        firstProblem = chooseRandom(phrases);
        secondProblem = chooseRandom(phrases);
      }
      var problems = [firstProblem, secondProblem];
      deferred.resolve(problems);
    });
  return deferred.promise;
}

var composeTweet = function(problems){
  var deferred = Q.defer();

  var tweetBody = function (problems) {
    return "The two hardest problems in computer science are " + problems[0] + " and " + problems[1] + ".";
  }

  T.post('statuses/update', { status: tweetBody(problems) }, function(err, data, response) {
    if (err) {
      deferred.reject(err);
    }
    console.log(data);
    deferred.resolve(data);
  });
  return deferred.promise;
}

var getNYTimesHeadline = function(){
  var deferred = Q.defer(),
      nyTimesUrl = "http://api.nytimes.com/svc/topstories/v1/" +
                   chooseRandom(topStorySections) +
                   ".json?api-key=" +
                   process.env.NY_TIMES_API_KEY;
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
        headline = results[i].title;
        headlines.push(headline);
      }
      headlineToUse = chooseRandom(headlines);
      deferred.resolve(headlineToUse);
    });
  }).on('error', function(e){
    deferred.reject(e);
  });
  return deferred.promise;
}

getNYTimesHeadline()
  .then(function(headline){
    return getNounPhrases(headline)
  })
  .then(function(nounPhrases){
    return composeTweet(nounPhrases)
  })
  .done();
