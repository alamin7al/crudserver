//HUfLi3LHdZNMXiOE
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;
const { query } = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET)
// const fileUpload=require('express-fileupload')
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());
// app.use(fileUpload)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ow5x2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect()
        const database = client.db('userList')
        const usersCollection = database.collection('users')
        const mobileCollection = database.collection('mobile')
        const emailCollection = database.collection('emailcollection')
        const useMobileCollection = database.collection('usermobile')

        //user Post
        app.post('/users', async (req, res) => {
            const NewUser = req.body
            const user = await usersCollection.insertOne(NewUser)
            res.send(user)
        })
        //all user
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({})
            const user = await cursor.toArray()
            res.send(user)
        })
       
        //email find
        app.get('/single', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const cursor = usersCollection.find(query)
            const user = await cursor.toArray()
            res.json(user)
        })
        //
        app.get('/single/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const user = await usersCollection.findOne(query)
            res.send(user)
        })
        app.get('/users/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const user = await usersCollection.findOne(query)
            res.send(user)
        })
        //userDelete
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })
        app.delete('/single/:id', async (req, res) => {
            const id = req.params.id
            // console.log(id);
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
            res.send(result)
        })
        //user Update
        app.put('/users/:id', async (req, res) => {
            const id = req.params.id
            const updateUser = req.body
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    name: updateUser.name,
                    email: updateUser.email,
                    number: updateUser.number,
                    address: updateUser.address,
                    relegion: updateUser.relegion,
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })
        app.put('/single/:id', async (req, res) => {
            const id = req.params.id
            // console.log(id);
            const updateUser = req.body
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    name: updateUser.name,
                    email: updateUser.email,
                    number: updateUser.number,
                    address: updateUser.address,
                    relegion: updateUser.relegion,
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            // console.log(result);
            res.send(result)
        })


        app.post('/mobile', async (req, res) => {
            const mobile = req.body
            const result = await mobileCollection.insertOne(mobile)
            console.log(result);
            res.json(result)
        })
      
        app.post('/usermobile', async (req, res) => {
            const mobile = req.body
            const result = await useMobileCollection.insertOne(mobile)
            console.log(result);
            res.json(result)
        })
        app.get('/usermobile', async (req, res) => {
            const cursor = useMobileCollection.find({})
            const user = await cursor.toArray()
            res.send(user)
        })
        app.get('/mobile', async (req, res) => {
            const email = req.query.email
            const date = req.query.date
            const query = { email: email, date: date }
            const userData = mobileCollection.find(query)
            const result = await userData.toArray()
            res.json(result)
        })
        app.get('/mobile/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await mobileCollection.findOne(query)
            res.send(result)
        })
        app.post('/emailcollection', async (req, res) => {
            const user = req.body
            const result = await emailCollection.insertOne(user)
            res.send(result)
        })
        app.put('/mobile/:id', async (req, res) => {
            const id = req.params.id
            const payment = req.body
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    payment: payment
                }
            }
            const result = await mobileCollection.updateOne(filter, updateDoc)
            res.send(result)
        })
        app.put('/emailcollection', async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const options = { upsert: true }
            const updateDoc = {
                $set: user
            }
            const result = await emailCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        app.put('/emailcollection/admin', async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await emailCollection.updateOne(filter, updateDoc)
            res.send(result)
        })

        app.get('/emailcollection/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await emailCollection.findOne(query)
            let isAdmin = false
            if (user?.role === 'admin') {
                isAdmin = true
            }
            res.send({ admin: isAdmin })
        })

        app.post('/create-payment-intent', async (req, res) => {
            const paymentInfo = req.body;
            const amount = paymentInfo.price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                payment_method_types: ['card']
            });
            res.json({ clientSecret: paymentIntent.client_secret })
        })


     












        console.log('h');
    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Running my CRUD Server');
});

app.listen(port, () => {
    console.log('Running Server on port', port);
})
