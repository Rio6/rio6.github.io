# IstroStats – Istrolid Game Data Collector {title}
## 2020-03-24 {date}

I’ve been playing the game [Istrolid](http://www.istrolid.com/) for almost 4 years. Other than it’s simple and fun, the most intriguing part of this game is it’s modibility. Since it’s written in Coffeescript, and no code obfuscation was applied, so I can easily add in my own code into the game. In fact, most repos on my [Gist](https://gist.github.com/Rio6) are plugins for this game.

This time, I made a game data collector. It mainly collects the time each players stays online and their match records. There’s also some faction and server informations.

There are 2 parts in the backend. One uses websocket to connect to game’s root server and updates its database with [SQLAlchemy](https://www.sqlalchemy.org/). Another uses [CherryPy](https://cherrypy.org/) to provide API and other web services. Since both parts connects to the same database, I can have the datas updated while the web server is asleep.

For the frontend, I use [Bootstrap](https://getbootstrap.com/) and [JQuery](https://jquery.com/) for a simple setup, and [Mako](https://www.makotemplates.org/) to reduce duplicate codes. The HTML files contains the layout of the each page, then a script uses AJAX to obtain informations from API, and they get put into the page by JQuery. Bootstrap looks good with its defauilt style sheets, so I don’t have to do the annoying CSS stuff XD.

Before I wasn’t very famaliar with SQL. All I knew was easy things like SELECT * FROM players WHERE name = “HELLO"; Through this project, I learned more things, like GROUP BY, ORDER BY, JOIN ON. Leveling up my SQL skill!

I put the whole project on [Github](https://github.com/Rio6/IstroStats/), and the service is currently running here: <http://istrostats.ddns.net/>

![](img/istrostats.png =100%x*)
