const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleware
app.use(cors());
app.use(express.json());


const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(401).send({ error: true, message: 'unauthorized access' });
    }
    // bearer token
    const token = authorization.split(' ')[1];
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ error: true, message: 'unauthorized access' })
      }
      req.decoded = decoded;
      next();
    })
  }


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jp8yltl.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db("adventureDB").collection("users");
    const classCollection = client.db("adventureDB").collection("classes");
    const selectCollection = client.db("adventureDB").collection("selected");





    

    app.post('/jwt', (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
  
        res.send({ token })
      })





    //user related api
    app.get('/users', async (req, res) => {
        const result = await usersCollection.find().toArray();
        res.send(result);
      });
    app.post('/users', async (req, res) => {
        const user = req.body;
        console.log(user);
        const query = { email: user.email }
        const existingUser = await usersCollection.findOne(query);
  
        if (existingUser) {
          return res.send({ message: 'user exists' })
        }
  
        const result = await usersCollection.insertOne(user);
        res.send(result);
      });



//admin related api
app.get('/users/admin/:email',verifyJWT, async (req, res) => {
  const email = req.params.email;
  console.log(email);
  const query = { email: email }
  const user = await usersCollection.findOne(query);
  const result = { admin: user?.role === 'admin' }
  res.send(result);
})

app.patch('/users/admin/:id', async (req, res) => {
  const id = req.params.id;
  console.log('id of user',id);
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      role: 'admin'
    },
  };
  console.log(updateDoc);

  const result = await usersCollection.updateOne(filter, updateDoc);
  res.send(result);

})


// instructor related api
app.get('/users/instructor/:email',verifyJWT, async (req, res) => {
  const email = req.params.email;
  console.log(email);
  const query = { email: email }
  const user = await usersCollection.findOne(query);
  const result = { instructor: user?.role === 'instructor' }
  res.send(result);
})
app.patch('/users/instructor/:id', async (req, res) => {
  const id = req.params.id;
  console.log('id of user',id);
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      role: 'instructor'
    },
  };
  console.log(updateDoc);

  const result = await usersCollection.updateOne(filter, updateDoc);
  res.send(result);

})







// class related apis
app.get('/class', async (req, res) => {
  const result = await classCollection.find().toArray();
  res.send(result);
})

app.post('/class', async (req, res) => {
  const newClass = req.body;
  const result = await classCollection.insertOne(newClass)
  res.send(result);
})

//get classes by email
app.get('/myclass', async (req, res) => {
  const email = req.query.email;
  console.log('email coming', email);
  const query = { instructorEmail: email };
  const result = await classCollection.find(query).toArray();
  res.send(result);
});





 // cart collection apis
 app.get('/select', async (req, res) => {
  const email = req.query.email;

  const query = { email: email };
  const result = await selectCollection.find(query).toArray();
  res.send(result);
});

app.post('/select', async (req, res) => {
  const item = req.body;
  console.log(item);
  const result = await selectCollection.insertOne(item);
  console.log(result);
  res.send(result);
})












    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);









app.get('/', (req, res) =>{
    res.send('Adventure server listening')
} )

app.listen(port, () => {
console.log(`Aperture server listening on ${port}`);
})