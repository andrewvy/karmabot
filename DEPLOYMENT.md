# Deploying Karmabot

### MongoDB

Deploy Karmabot to Heroku and add a MongoLab DB (free tier is fine!)

### Environment

#### SLACK_TOKEN

```
heroku config:add SLACK_TOKEN=...
```

### Note

Heroku free tier applications will idle. Use [UptimeRobot](http://uptimerobot.com) or similar to prevent your instance from sleeping or pay for a production dyno.
