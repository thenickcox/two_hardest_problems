This is the source code for [@2_hard_problems](https://twitter.com/2_hard_problems), a Twitter bot that periodically tweets the two hardest problems in computer science.

## What is this?

There's an age-old saying in computer science:

```
There are only two hard things in Computer Science: cache invalidation and naming things.

-- Phil Karlton
```

This seminal quote spawned jokey riffs. To boot:

![Tweet text](http://s24.postimg.org/wfi1n4qdx/Screen_Shot_2015_09_26_at_11_12_23_PM.png)

This bot generates variations of this joke.

## How it works

The bot picks a headline from the [New York Times Top Stories API](http://developer.nytimes.com/docs/top_stories_api/) in one of a [given list of sections](https://github.com/thenickcox/two_hardest_problems/blob/master/index.js#L25-L35), then runs it through the [Text Analysis noun phrase extraction API](https://market.mashape.com/textanalysis/textanalysis#textblob-noun-phrase-extraction) to find the noun phrases, then it posts them to the Twitter API.

## Prior Art

This bot is influenced by [Darius Kazemi]((https://twitter.com/tinysubversions))'s [talk](https://www.youtube.com/watch?v=l_F9jxsfGCw) at XOXO. (It only had a little bit to do with Twitter bots, but he gave me the idea to make a bot around generating a formulaic joke.)

## Known issues

The code is terrible. Give me a break. I threw this together in, like, an hour. I'm working on it, okay?
