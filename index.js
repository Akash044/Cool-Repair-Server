const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectID;
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const app = express();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ieei5.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));


app.get("/", (req, res) => {
  res.send("server working");
});

client.connect((err) => {
  const serviceCollection = client
    .db(process.env.DB_NAME)
    .collection(process.env.DB_COL1);

  const reviewCollection = client
    .db(process.env.DB_NAME)
    .collection(process.env.DB_COL2);

  const adminCollection = client
    .db(process.env.DB_NAME)
    .collection(process.env.DB_COL3);
    
  const appointmentCollection = client
    .db(process.env.DB_NAME)
    .collection(process.env.DB_COL4);

  // SERVICES SECTION START HERE
  // read all services
  app.get("/services", (req, res) => {
    serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  // read specific services by id
  app.get("/service/:id", (req, res) => {
   
        serviceCollection.find({ _id: ObjectId(req.params.id) })
        .toArray((err, documents) => {
          console.log("come in");
            res.send(documents[0]);
          });
      });
  // insert new Service
  app.post("/addService", (req, res) => {
    const serviceInfo = req.body;
    serviceCollection.insertOne(serviceInfo).then((result) => {
      console.log("data added successfully");
      res.send(result);
    });
  });
  //  delete a Service
  app.delete("/deleteService/:id", (req, res) => {
    serviceCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });
  // SERVICES SECTION END HERE


  //APPOINTMENT SECTION START HERE
  // add Appointment
  app.post("/addAppointment", (req, res) => {
    const appointmentInfo = req.body;
    appointmentCollection.insertOne(appointmentInfo).then((result) => {
      console.log("appointment added successfully");
      res.send(result);
    });
  });
  // read Appointments email
  app.get("/allAppointment/:email", (req, res) => {
    appointmentCollection
      .find({ email: req.params.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });
  // read all Appointments
  app.get("/allAppointment", (req, res) => {
    appointmentCollection.find({})
    .toArray((err, documents) => {
      res.send(documents);
    });
  });
  // read Appointment by id
  app.get("/appointment/:id", (req, res) => {
    appointmentCollection.find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });
  // update a appointment status
  app.patch("/updateStatus/:id", (req, res) => {
    console.log(req.params.id, req.body.status);
    appointmentCollection
      .updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: {serStatus: req.body.status}
        }
      )
      .then((result) => {
        res.send(result.modifiedCount > 0)
      });
  });
  // APPOINTMENT SECTION END HERE


  //REVIEW SECTION START HERE
  app.get("/reviews", (req, res) => {
    reviewCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/addReview", (req, res) => {
    const serviceReview = req.body;
    console.log(serviceReview);
    reviewCollection.insertOne(serviceReview).then((result) => {
      console.log("data added successfully");
      res.send(result);
    });
  });
  //REVIEW SECTION END HERE


   //ADMIN SECTION START HERE
   //add admin
  app.post("/addAdmin", (req, res) => {
    const adminEmail = req.body;
    console.log(adminEmail);
    adminCollection.insertOne(adminEmail)
    .then((result) => {
      console.log("data added successfully");
      res.send(result.insertedCount > 0);
    });
  });

//Check is admin or not
  app.get("/isAdmin/:email", (req, res) => {
    const email = req.params.email;
    console.log(email);
    adminCollection.find({ email: email })
    .toArray((err, documents) => {
      res.send(documents.length > 0) ;
      });
  });
   //ADMIN SECTION END HERE

});
app.listen(process.env.PORT || 8080);
