require('dotenv').config()
const express=require('express');
const app=express();
const cors=require('cors');
const bodyParser=require('body-parser');
app.set('view engine','hbs')
app.use(express.static('public'));
const port=5000
const mongoose=require('mongoose');
mongoose.connect('mongodb+srv://rishitha:rishithapassword@cluster0.91phm.mongodb.net/netflix?retryWrites=true&w=majority&appName=Cluster0',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db=mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '))
db.once('open',()=>{
    console.log("connected to mongodb");
})
const User=require('./models/User')
const session=require('express-session');
const MongoStore=require('connect-mongo');
app.use(session({
    secret:'abcd1234',
    resave:false,
    saveUninitialized:false,
    store:new MongoStore({mongoUrl:'mongodb+srv://rishitha:rishithapassword@cluster0.91phm.mongodb.net/netflix?retryWrites=true&w=majority&appName=Cluster0'
    }),
    cookie:{
        maxAge: 1000*60*60*24*7
    }
}))

const passport = require('passport');
const LocalStrategy=require('passport-local').Strategy;
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(cors());

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const authRoutes=require('./routes/authRoutes');
const dashboard=require('./routes/dashboard');
const addMovie=require('./routes/addMovie')
const myList= require('./routes/mylist')
const watchedMovies= require('./routes/watchedMovie')
const getMovies=require('./routes/getMovies')

app.use('/',authRoutes)
app.use('/',dashboard)
app.use('/', addMovie)
app.use('/', myList)
app.use('/',watchedMovies)
app.use('/',getMovies)

app.listen(port,()=>{
    console.log(`API is running on port ${port}`)
})
