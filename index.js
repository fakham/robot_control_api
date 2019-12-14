const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const mongodb = require("mongodb");
const app = express();
const axios = require('axios');
const FormData = require('form-data');
var request = require('request');
var querystring = require('querystring');

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

  let name = req.params.name
  MongoClient.connect(
    process.env.DATABASE_CONNECTION,
    { useUnifiedTopology: true },
    (err, db) => {
      console.log("connected to db!");
      const dbo = db.db("irobot");
      dbo.collection("tasks").find({}).toArray((err, TasksResults) => {
        var options = {
          'method': 'GET',
          'url': 'https://irobot-api.herokuapp.com/robots',
          'headers': {
          }
        };
        request(options, function (error, responseRobots) { 
          if (error) throw new Error(error);
          let list = []
          responseRobots.body = responseRobots.body.replace("\\", '');
          TasksResults.forEach(element => {
            list.push(element.x+", "+element.y)
          });

          //
          
          data = {
            'rb1x': JSON.parse(responseRobots.body)[0].x,
            'rb1y': JSON.parse(responseRobots.body)[0].y,
            'rb2x': JSON.parse(responseRobots.body)[1].x,
            'rb2y': JSON.parse(responseRobots.body)[1].y,
            //'list': "['3, 2','3, 3','4, 1','2, 1','0, 1']",
            'list': list.toString().replace('"', '\'')
          } 

          res.send(data)
          
          //var request = require('request');
          var options = {
            'method': 'POST',
            'url': 'https://robowat.herokuapp.com/upload',
            'headers': {
            },
            formData: data
          };
          request(options, function (error, response) { 
            if (error) throw new Error(error);
            //res.send(response.body);
            console.log(response.body);
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


/*



*/

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
