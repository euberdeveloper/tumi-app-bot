# [tumi-app-bot](https://t.me/tumi_app_bot)
A telegram bot to receive a message when there is a new spot for tumi events

## Project purpose

At TUM we are in about **50 000** students and a great quantity are exchange or international students. The [TUMI App](https://tumi.esn.world/events) is a pwa where students can register to events organized for international students, but there are usually **few spots available**. Events with even 300 spots can become fully booked in less than 10 minutes. This project consists in a **telegram bot** that **sends you a message** when a new event is published or when there is a new free spot in an event that was fully booked.

## How was it made

The bot has been developed by using **Typescript** and **Node.js**. Initially, it used a **webscraper** that used **puppeteer**; it worked but it was susceptible to the websites' changes and was not so performant. This is why a newer version was developerd that used directly the **GraphQL** api used by the tumi pwa. **Redis** has been used as database, **Telegraf** as bot library and **Bull.js** as a scheduler. The deploy has been done with **Docker** (swarms).

## How does it work

It is quite simple:
1. The **telegram bot** is started; it has the **/start**, **/stop**, **/help**, **/author** and **/version** commands.
2. A **scheduler** is started by using bull.js
3. Every time the scheduler fires, it **gets the updated events**, **saves them on redis**, **checks if there are changes** (new event id or change of an event's spots from 0 to a positive number) and, if there are changes, **sends a telegram message** to all the registered users.
4. Every time a user **starts or stops** the bot, it is **added or removed** to the redis database, so that the bot knows to whom send the messages.

## How was it deployed

There is a **Dockerfile** that is used to create an **image** of the bot, that is automatically published on **DockerHub** through a **Github Action**. In the `deploy` folder, there is the `docker-compose.yml` file that is used by **docker swarm** to serve the bot, the redis db and the **watchtower updater**.
