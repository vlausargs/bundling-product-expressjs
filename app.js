require('dotenv').config('./env')

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

const usersRouter  = require('./routes/users');
const loginRouter  = require('./routes/auth');

// app.use('/posts', ()=>{
//     console.log("post middleware")
// })
app.use(bodyParser.json());

app.use('/users', usersRouter);
app.use('/', loginRouter);

app.get('/',(req,res)=>{
    res.send('home get api')
})

app.get('/posts',(req,res)=>{
    res.send('get all post api')
})

mongoose.connect(process.env.DB_CONNECTION,{useNewUrlParser:true})
.then(()=>console.log("callback connect db"))
.catch(err => console.log(err))


app.listen(3000);