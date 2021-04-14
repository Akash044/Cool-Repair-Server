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

const admin = require("firebase-admin");
const serviceAccount = require("./prime-books-auth-firebase-adminsdk-qbt80-f990eeed6c.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.get("/", (req, res) => {
  res.send("server working");
});

client.connect((err) => {
  const serviceCollection = client
    .db(process.env.DB_NAME)
    .collection(process.env.DB_COL1);
  const reviewsCollection = client
    .db(process.env.DB_NAME)
    .collection(process.env.DB_COL2);
  const adminsCollection = client
    .db(process.env.DB_NAME)
    .collection(process.env.DB_COL3);
  const appointmentsCollection = client
    .db(process.env.DB_NAME)
    .collection(process.env.DB_COL4);

  //  ALL BOOKS SECTION START HERE
  // read all books
  app.get("/services", (req, res) => {
    serviceCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  // read specific book by id
  app.get("/service/:id", (req, res) => {
    serviceCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
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

  //   app.patch("/update/:id", (req, res) => {
  //     collection
  //       .updateOne(
  //         { _id: ObjectId(req.params.id) },
  //         {
  //           $set: {
  //             name: req.body.name,
  //             age: req.body.age,
  //             studyAt: req.body.studyAt,
  //           },
  //         }
  //       )
  //       .then((res) => console.log(res));
  //   });

  //  delete a Service
  app.delete("/deleteService/:id", (req, res) => {
    serviceCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });
  // ALL BOOKS SECTION END HERE

  //APPOINTMENT SECTION START HERE
  // add Appointment
  app.post("/addAppointment", (req, res) => {
    const orderInfo = req.body;
    appointmentsCollection.insertOne(orderInfo).then((result) => {
      console.log("data added successfully");
      res.send(result);
    });
  });

  // read Appointments
  app.get("/allAppointment/:email", (req, res) => {
    const userIdToken = req.headers.authorization.split(" ")[1];
    admin
      .auth()
      .verifyIdToken(userIdToken)
      .then((decodedToken) => {
        const decodedTokenEmail = decodedToken.email;
        if (req.params.email === decodedTokenEmail) {
          adminsCollection
            .find({ email: req.params.email })
            .toArray((err, documents) => {
              if (documents.length) {
                res.send('admin');
              } else {
                appointmentsCollection
                  .find({ email: req.params.email })
                  .toArray((err, documents) => {
                    res.send(documents);
                  });
              }
            });
        }
      })
      .catch((error) => {});
  });
  // ORDER SECTION END HERE

  //REVIEW SECTION START HERE
  app.get("/reviews", (req, res) => {
    reviewsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/addReview", (req, res) => {
    const orderInfo = req.body;
    reviewsCollection.insertOne(orderInfo).then((result) => {
      console.log("data added successfully");
      res.send(result);
    });
  });
});
app.listen(process.env.PORT || 8080);
