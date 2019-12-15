const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const mongodb = require("mongodb");
const app = express();
var request = require("request");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

dotenv.config();

//get all tasks
app.get("/tasks", (req, res) => {
  MongoClient.connect(
    process.env.DATABASE_CONNECTION,
    { useUnifiedTopology: true },
    (err, db) => {
      console.log("connected to db!");
      const dbo = db.db("irobot");
      dbo
        .collection("tasks")
        .find({})
        .toArray((err, results) => {
          res.send(results);
        });
      db.close();
    }
  );
});

//get tasks for a specific robot with name
app.get("/tasks/:name", (req, res) => {
  let name = req.params.name;
  MongoClient.connect(
    process.env.DATABASE_CONNECTION,
    { useUnifiedTopology: true },
    (err, db) => {
      console.log("connected to db!");
      const dbo = db.db("irobot");
      dbo
        .collection("tasks")
        .find({})
        .toArray((err, TasksResults) => {
          var options = {
            method: "GET",
            url: "https://irobot-api.herokuapp.com/robots",
            headers: {}
          };
          request(options, function(error, responseRobots) {
            if (error) throw new Error(error);
            let list = [];
            responseRobots.body = responseRobots.body.replace("\\", "");
            TasksResults.forEach(element => {
              list.push("'" + element.x + ", " + element.y + "'");
            });

            let lista = "[" + list.toString() + "]";

            data = {
              rb1x: JSON.parse(responseRobots.body)[0].x,
              rb1y: JSON.parse(responseRobots.body)[0].y,
              rb2x: JSON.parse(responseRobots.body)[1].x,
              rb2y: JSON.parse(responseRobots.body)[1].y,
              list: lista
            };

            var options = {
              method: "POST",
              url: "https://robowat.herokuapp.com/upload",
              headers: {},
              formData: data
            };
            request(options, function(error, response) {
              if (error) throw new Error(error);

              if (name == "Corki") {
                let Corki = [];
                JSON.parse(response.body).r1.forEach(element => {
                  Corki.push(element[0]);
                  Corki.push(element[1]);
                });
                res.send(Corki);
              } else if (name == "Rumble") {
                let Rumble = [];
                JSON.parse(response.body).r2.forEach(element => {
                  Rumble.push(element[0]);
                  Rumble.push(element[1]);
                });
                res.send(Rumble);
              } else {
                res.send("please check the name use Corki or Rumble");
              }
            });
          });
        });
      db.close();
    }
  );
});

app.post("/tasks", (req, res) => {
  MongoClient.connect(
    process.env.DATABASE_CONNECTION,
    { useUnifiedTopology: true },
    (err, db) => {
      console.log("connected to db!");
      const task = req.body;
      const dbo = db.db("irobot");
      dbo.collection("tasks").insertOne(task, (err, response) => {
        res.send(response.ops[0]);
      });
      db.close();
    }
  );
});

app.delete("/tasks/:id", (req, res) => {
  MongoClient.connect(
    process.env.DATABASE_CONNECTION,
    { useUnifiedTopology: true },
    (err, db) => {
      console.log("connected to db!");
      const task = req.params.id;
      //console.log(task);
      const dbo = db.db("irobot");
      dbo
        .collection("tasks")
        .deleteOne({ _id: new mongodb.ObjectID(task) }, (err, response) => {
          res.send("" + response.deletedCount);
        });
      db.close();
    }
  );
});

// get robots with position
app.get("/robots", (req, res) => {
  MongoClient.connect(
    process.env.DATABASE_CONNECTION,
    { useUnifiedTopology: true },
    (err, db) => {
      console.log("connected to db!");
      const dbo = db.db("irobot");
      dbo
        .collection("robots")
        .find({})
        .toArray((err, results) => {
          res.send(results);
        });
      db.close();
    }
  );
});

//update robot postion
app.post("/robots", (req, res) => {
  MongoClient.connect(
    process.env.DATABASE_CONNECTION,
    { useUnifiedTopology: true },
    (err, db) => {
      console.log("connected to db!");
      const robot = req.body;
      const dbo = db.db("irobot");
      const mydata = { name: robot.name };
      const newvalues = { $set: { x: robot.x, y: robot.y } };
      dbo.collection("robots").updateOne(mydata, newvalues, (err, response) => {
        res.send("" + response.modifiedCount);
      });
      db.close();
    }
  );
});

// get robot with name
app.get("/robots/:name", (req, res) => {
  MongoClient.connect(
    process.env.DATABASE_CONNECTION,
    { useUnifiedTopology: true },
    (err, db) => {
      console.log("connected to db!");
      const dbo = db.db("irobot");
      dbo
        .collection("robots")
        .findOne({ name: req.params.name }, (req, results) => {
          res.send(results);
        });
      db.close();
    }
  );
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Example app listening on port http://localhost:3000!");
});
