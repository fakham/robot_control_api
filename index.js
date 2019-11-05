const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const mongodb = require("mongodb");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

dotenv.config();

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
