'use strict';

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

class Bot {
  chooseRandom(arr) {
    var index = Math.floor(Math.random() * arr.length);
    return arr[index];
  }
  getNounPhrases(headline) {
    var _this = this;
    var deferred = Q.defer();
    unirest.post("https://textanalysis.p.mashape.com/textblob-noun-phrase-extraction")
      .header("X-Mashape-Key", process.env.MASHAPE_API_KEY)
      .header("Content-Type", "application/x-www-form-urlencoded")
      .header("Accept", "application/json")
      .send("text=" + headline)
      .end(function (result) {
         var phrases = result.body.noun_phrases,
             firstProblem = _this.chooseRandom(phrases),
             secondProblem = _this.chooseRandom(phrases);
        while (firstProblem === secondProblem){
          firstProblem = _this.chooseRandom(phrases);
          secondProblem = _this.chooseRandom(phrases);
        }
        var problems = [firstProblem, secondProblem];
        deferred.resolve(problems);
      });
    return deferred.promise;
  }
  leads(){
    return ['two hardest', 'only two hard'];
  }
  subjects() {
    return ['computer science', 'programming', 'computers'];
  }
  composeTweet(problems) {
    var deferred = Q.defer();

    var _this = this;
    var tweetBody = function (problems) {
      var lead = _this.leads()[Math.floor(Math.random() * _this.leads.length)];
      var subject = _this.subjects()[Math.floor(Math.random() * _this.subjects().length)];
      deferred.resolve(`The ${lead} problems in ${subject} are ${problems[0]} and ${problems[1]}.`);
    }
    return deferred.promise;
  }
  postTweet(tweet) {
    console.log("Posting tweet: " + tweet);
    T.post('statuses/update', { status: tweet }, function(err, data, response) {
      if (err) {
        console.log(err);
      }
      console.log(data);
    });
  }
  getHeadline() {
    var deferred = Q.defer(),
        _this = this,
        apiUrl = `http://gateway-a.watsonplatform.net/calls/data/GetNews?apikey=${process.env.WATSON_API_KEY}&outputMode=json&start=now-1d&end=now&count=10&&return=enriched.url.title`;
    http.get(apiUrl, function(res){
      res.setEncoding('utf-8');
      var body = '';
      res.on('data', function(chunk) {
        body += chunk;
      });
      res.on('end', function() {
        console.log(body);
        var newBody = JSON.parse(body);
        var results = newBody.result.docs;
        var resLength = results.length;
        for (var i = 0; i < resLength; i++) {
          var headline = results[i].source.enriched.url.title;
          headlines.push(headline);
        }
        headlineToUse = _this.chooseRandom(headlines);
        deferred.resolve(headlineToUse);
      });
    }).on('error', function(e){
      deferred.reject(e);
    });
    return deferred.promise;
  }
}

var run = ( () => {
  const bot = new Bot();

  bot.getHeadline()
     .then(function(headline){
       return bot.getNounPhrases(headline)
      })
      .then(function(nounPhrases){
        return bot.composeTweet(nounPhrases)
      })
      .then(function(tweet){
        return bot.postTweet(tweet);
      })
      .done();
})();
