const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const mongodb = require("mongodb");
const app = express();
const axios = require('axios');
const FormData = require('form-data');

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
      dbo
        .collection("tasks")
        .find({})
        .toArray((err, results) => {
          
          let list = []
          results.forEach(element => {
            list.push(element.x+', '+element.y);
          });
          
          var bodyFormData = new FormData();

          bodyFormData.append('rb1x', 0);
          bodyFormData.append('rb1y', 0);
          bodyFormData.append('rb2x', 1);
          bodyFormData.append('rb2y', 1);
          bodyFormData.append('list', "['3, 2', '3, 3', '4, 1', '2, 1','0, 1']");
          //bodyFormData.set('list', list);

          axios({
            method: 'POST',
            url: 'https://robowat.herokuapp.com/upload',
            data: bodyFormData,
            headers: {'Content-Type': 'form-data'},
          }).then(function (response) {
              res.send(response);
                //console.log(response);
            })
            .catch(function (response) {
              res.send(response);
                //console.log(response);
            });


            


            


          //res.send(results);
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
