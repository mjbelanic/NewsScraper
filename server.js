var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
// Requiring Comment and Article models
var Comment = require("./models/Note.js");
var Article = require("./models/Article.js");

//Scraping tools
var request = require("request");
var cheerio = require("cheerio");

mongoose.Promise = Promise;

var app = express();

app.use(bodyParser.urlencoded({extended: false}));

//Make public static directory
app.use(express.static("public"));

app.use(methodOverride("_method"));
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine" , "handlebars");


//Database configuration with mongoose
// mongoose.connect("mongodb://localhost/newsScraper");
mongoose.connect("mongodb://heroku_87tckjb6:fjepbbts77gbfve61qt7dt1dee@ds243325.mlab.com:43325/heroku_87tckjb6");
var db = mongoose.connection;

//Show errors
db.on("error" , function(error){
    console.log("Mongoose Error: " , error);
});

db.once("open", function(){
    console.log("Mongoose connection successful.");
});

//Routes
app.get("/", function(req, res){

    //remove all articles the user has not saved.
    var count = 0;
    
    var collection = db.collection('articles');
    collection.deleteMany({ saved: false}, function(err,result){
        console.log("Unsaved articles removed.")
    })
    request("http://www.c-sharpcorner.com/" , function(error, response, html){
        var $ = cheerio.load(html);
        $("ul#RecentActivity li.media div.media-body").each(function(i, element){
            var results = {};
            results.title = $(this).children("a").text();
            results.link = $(this).children("a").attr("href");
            results.author = $(this).children("a.author").text();

            // Using our Article model, create a new entry
            // This effectively passes the result object to the entry (and the title and link)
            var entry = new Article(results);
            // Now, save that entry to the db
            entry.save(function(err, doc, next) {
              // Log any errors
              if (err) {
                console.log(err);
              }
            });
        });
        res.redirect("/articles")
    });
});

app.get("/articles", function(req, res) {
    // Grab every doc in the Articles array
    Article.find({}, function(error, doc) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Or send the doc to the browser as a json object
      else {
        var articleList = {articles: doc}
        res.render("articles",articleList);
      }
    });
  });

//find saved articles
  app.get("/saved", function(req, res) {
    // Grab every doc in the Articles array
    Article.find({saved: true}, function(error, doc) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Or send the doc to the browser as a json object
      else {
        var articleList = {articles: doc}
        res.render("articles",articleList);
      }
    });
  });
  
  // Get a document item and change its saved value to the opposite
  app.post("/saved/:id", function(req, res) {
    var isTrueSet = req.body.saved === "true";
      Article.findOneAndUpdate({_id: req.params.id}, {$set:{saved: !isTrueSet}}
      , function(err, results){
        if(err){
          console.log(err);
        }else{
         res.redirect("/articles");
        }
      });
});

// Create a new note or replace an existing note
app.get("/comments/:id", function(req, res) {
  Comment.find({"_id": req.params.id}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      var commentList = {comment: doc}
      console.log(commentList);
      res.json(commentList);
    }
  });
});



  // Create a new note or replace an existing note
  app.post("/comment/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    var newComment = new Comment(req.body);
  
    // And save the new note the db
    newComment.save(function(error, doc) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Otherwise
      else {
        // Use the article id to find and update it's note
        Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "comment": doc._id }})
        // Execute the above query
        .exec(function(err, doc) {
          // Log any errors
          if (err) {
            console.log(err);
          }
          else {
            // Or send the document to the browser
            res.redirect("/articles");
          }
        });
      }
    });
  });

//Port 3000
app.listen(3000, function(){
    console.log("App running on port 3000!");
});