//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const multer = require("multer");
const encrypt = require("mongoose-encryption");
const fs = require('fs');
const expressLayouts = require('express-ejs-layouts');
const fetch = require('node-fetch');



const GOOGLE_SHEET_URL="https://script.google.com/macros/s/AKfycbw1qa23cJPPWVIbQKMoabdu3AUlIEoeED8IeYf72thNNPOCSx05IhWMTEVxvmsSRNnd/exec";


const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
//app.use(express.static(__dirname+"./public/"));
app.set("view engine", "ejs");
// app.use(expressLayouts);

mongoose.connect("mongodb://localhost:27017/userDBE",{useNewUrlParser : true});
//stackOverFlow
mongoose.set('useCreateIndex', true);

const diarySchema = new mongoose.Schema(
  {
    dates:String,
    content: String,
    image: String
  }
);
const Diary = mongoose.model("Diary", diarySchema);

const userSchema = new mongoose.Schema({
    email : String,
    password : String,
});

userSchema.plugin(encrypt, {secret : process.env.SECRET, encryptedFields:["password"]});

const User = mongoose.model("User", userSchema);


// image uploads code
var Storage = multer.diskStorage({
  destination : "./public/uploads", // "./public/uploads"
  filename : (req, file, callback)=>{
      callback(null, file.fieldname+"_"+Date.now());

  }

});
// middleware of image upload
var upload = multer({
  storage:Storage
}).single('file');




app.get("/", function(req, res){
  res.render("signLog");
});


app.get("/register", function(req,res){
  res.render("register");
});


app.post("/register", function(req, res, next){
     
      let newUser = new User({
        email: req.body.username,
        password : req.body.password,
      
      });
      newUser.save(function(err){
        if(err){
          console.log(err);
        }
        else{
         
            res.render("secrets");
        }
      });
});


app.get("/login", function(req, res){

  res.render("login");
});


app.post("/login", function(req, res){

  User.findOne({email : req.body.username}, function(err, foundUser){
    if(err){
      console.log(err);
    }
    else{
      
      if(foundUser){
        if(foundUser.password === req.body.password){
          res.redirect("/secrets");
          
        }
      }
    }
  });
});

app.get("/secrets", function(req, res){
  res.render("secrets");
});


app.get("/read", function(req, res){

  Diary.find({}, function(err, pages){
    res.render("read", {
      pages: pages
      });
  });
 
});

app.post("/read", function(req, res){
    res.redirect("/read");
       
});



app.get("/compose", function(req, res){
 
  res.render("compose");
});

app.post("/compose", upload, function(req, res){
 
  
          const new_entry = new Diary({
              dates : req.body.date,
              content : req.body.content,
              image:req.file.filename


          });
          new_entry.save();
          
          res.redirect("/secrets");
          
     

});
app.get("/search", function(req, res){
    res.render("search");

});


app.post("/search", function(req, res){
    console.log("hello");
    console.log(req.body.dates);
    console.log('hey');
        Diary.findOne({dates: req.body.dates}, function(err, post){
      res.render("post", {
       post:post
      });
    });
  
  });



app.get("/delete", function(req, res){
    res.render("delete");
});

app.post("/delete", function(req, res){
  
  Diary.deleteMany({dates: req.body.dates})
  .then(function(){console.log("success")})
  .catch(function(error){
    console.log(error); // Failure
   
  });

  res.send("delete operation was successful");
});


app.get("/googleSheet", function(req, res){

  res.render("dashboard");

});
app.post("/googleSheet", function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const mobile_number= req.body.mobile_number;
  const date = req.body.date;
  const special_note = req.body.special_note;
  
  console.log(name);
  console.log(email);
  console.log(mobile_number);
  console.log(date);
  console.log(special_note);
  console.log("hi");


  const url = `${GOOGLE_SHEET_URL}?Name=${encodeURIComponent(name)}&Email=${encodeURIComponent(email)}&MobileNumber=${encodeURIComponent(mobile_number)}&InitialDate=${encodeURIComponent(date)}&SpecialNote=${encodeURIComponent(special_note)}`;
  fetch(url).then(res=>res.json()).then(res => console.log("google sheet res", {res})).catch(e => console.error())

  res.render("success");
});




app.listen(3000, function() {
  console.log("Server started on port 3000");
});
