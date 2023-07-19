const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const port = process.env.PORT || 5000;
const app = express();

// middle ware------------------------
app.use(cors())
app.use(express.json())

// Database connection-------------------------------
const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.geiv5ao.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


// All api----------------------
async function run() {
    try {
        const productCollection = client.db('alphabet-task').collection('products');
        const usersCollection = client.db('alphabet-task').collection('users');
        const orderCollection = client.db('alphabet-task').collection('orderlist');
        const cartCollection = client.db('alphabet-task').collection('cartlist');


        app.get('/products', async (req, res) => {
            const query = {};
            const products = await productCollection.find(query).toArray();
            res.send(products)
        })

        // get single Product-----------------
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.findOne(query);
            res.send(result)
        })

        // Save User to Database-----------------
        app.post('/usersignup', async (req, res) => {
            const newUser = req?.body;
            const query = { email: newUser?.email };
            const user = await usersCollection.findOne(query)
            if (!user) {
                const result = await usersCollection.insertOne(newUser);
                console.log(result);
                res.send(result)
                return
            }
            res.send({ message: 'User already registerd' })
        })
        app.post('/userlogin', async (req, res) => {
            const loginuser = req?.body;

            const query = {
                email: loginuser?.email,
                password: loginuser?.password
            };
            const user = await usersCollection.findOne(query)
            if (!user) {
                res.send({ message: "Invalid Email Password" })
                return
            }
            const userDetails = {
                _id: user?._id,
                name: user?.name,
                email: user?.email
            }
            res.send({ acknowledged: true, userDetails })

        })
        // Get User-------------
        app.get('/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const user = await usersCollection.findOne(query);
            const userDetails = {
                _id: user?._id,
                name: user?.name,
                email: user?.email
            }
            res.send(userDetails)
        })

        app.post('/order', async (req, res) => {
            const orderProduct = req.body;
            const result = await orderCollection.insertOne(orderProduct);
            res.send(result)
        })

        app.get('/orderlist/:id', async (req, res) => {
            const id = req.params.id;
            const query = { u_id: id };
            const orderlist = await orderCollection.find(query).toArray();
            res.send(orderlist)
        })

        app.delete('/order-delete/:pid/:uid', async (req, res) => {
            const pid = req.params?.pid;
            const uid = req.params?.uid;
            const query = { p_id: pid, u_id: uid };
            const result = await orderCollection.deleteOne(query)
            res.send(result);
        })

        app.post('/addtocart', async (req, res) => {
            const product = req.body;
            const result = await cartCollection.insertOne(product);
            res.send(result)
        })

        app.get('/allcart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { u_id: id };
            const cartList = await cartCollection.find(query).toArray()
            res.send(cartList)
        })
        app.delete('/cart-delete/:pid/:uid', async (req, res) => {
            const pid = req.params?.pid;
            const uid = req.params?.uid;
            const query = { p_id: pid, u_id: uid };
            const result = await cartCollection.deleteOne(query);
            res.send(result)
        })

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', async (req, res) => {
    res.send('Alphabet Server is running')
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

