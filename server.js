/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: _Shao Qiao____ Student ID: 145954210_ Date: 2023-03-09_
*
*  Online (Cyclic) Link: https://adorable-frog-skirt.cyclic.app
*
********************************************************************************/ 

var express = require("express");
var app = express();
var HTTP_PORT = process.env.PORT || 8080;
app.use(express.static('public'));
const blogData = require('./blog-service');
const path=require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
// const postsData = require('./data/posts.json');

const upload = multer();
const storage = multer.memoryStorage();
app.use(express.static("public"));

cloudinary.config({
  cloud_name: 'dvogv4xnj',
  api_key: '372426185215898',
  api_secret: 'Yyt_I6jU5XAQofQgyFhnmaD9TBQ',
  secure: true
});
const exphbs=require("express-handlebars");
app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');
const Handlebars = require('handlebars');
const stripJs = require('strip-js');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});
app.engine('.hbs', exphbs.engine({ 
  extname: '.hbs',
  helpers: { navLink: function(url, options){
    return '<li' + 
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
        '><a href="' + url + '">' + options.fn(this) + '</a></li>';
},
equal: function (lvalue, rvalue, options) {
  if (arguments.length < 3)
      throw new Error("Handlebars Helper equal needs 2 parameters");
  if (lvalue != rvalue) {
      return options.inverse(this);
  } else {
      return options.fn(this);
  }
},
safeHTML: function(context){
  return stripJs(context);
},

formatDate: function(dateObj){
  let year = dateObj.getFullYear();
  let month = (dateObj.getMonth() + 1).toString();
  let day = dateObj.getDate().toString();
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
},
}
}));

app.get('/', function(req, res) {
  res.redirect('/blog');
});

app.get('/about', function(req, res) {
  res.render('about', {
    title: 'About Me'
  });
});

app.get('/blog', async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};
  try{
      // declare empty array to hold "post" objects
      let posts = [];
      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogData.getPublishedPostsByCategory(req.query.category);
          }else{
          // Obtain the published "posts"
          posts = await blogData.getPublishedPosts();
        }
      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
      // get the latest post from the front of the list (element 0)
        let post = posts[0]; 
      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;
      viewData.post = post;
  }catch(err){
      viewData.message = "no results";
  }
  try{
      // Obtain the full list of "categories"
      let categories = await blogData.getCategories();
      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }
  // render the "blog" view with all of the data (viewData)
        res.render("blog", {data: viewData})
});

app.post("/posts/add", upload.single("featureImage"), (req,res)=>{

  if(req.file){
      let streamUpload = (req) => {
          return new Promise((resolve, reject) => {
              let stream = cloudinary.uploader.upload_stream(
                  (error, result) => {
                      if (result) {
                          resolve(result);
                      } else {
                          reject(error);
                      }
                  }
              );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
          });
      };
        async function upload(req) {
          let result = await streamUpload(req);
          console.log(result);
          return result;
      }
        upload(req).then((uploaded)=>{
          processPost(uploaded.url);
      });
  }else{
      processPost("");
  }
  function processPost(imageUrl){
      req.body.featureImage = imageUrl;

      blogData.addPost(req.body).then(post=>{
          res.redirect("/posts");
      }).catch(err=>{
          res.status(500).send(err);
      })
  }   
});
app.get("/posts/delete/:id", (req, res) => {
  console.log("step first");
  blogData.deletePostById(req.params.id)
    .then(() => {
      res.redirect("/posts");
      console.log("step two"); 
    })
    .catch((err) => {
      res.status(500).send("(Unable to Remove Post  / Post  not found)");
    });
});

app.get('/posts/add', function(req, res) {
  res.render('addPost',{
      title: 'Add Post'
    });
  }); 

  app.get("/posts",async (req, res) => {
    let data;
    try {
      if (req.query.category) {
        data = await getPublishedPostsByCategory(req.query.category);
      } else if (req.query.minDate) {
        data = await getPostsByMinDate(req.query.minDate);
      } else {
        data = await blogData.getAllPosts();
      }
    } catch (err) {
      console.error(err);
      return res.render("posts", { message: "No results" });
    }
  
    // Format the postDate field for each post in the data array
    data.forEach(post => {
      post.postDate = post.postDate.toISOString().split('T')[0];
    });
  
    if (data.length > 0) {
      res.render("posts", { posts: data });
    } else {
      res.render("posts", { message: "No results" });
    }
  });
 
app.get('/post/:id', (req, res) => {
    const { id } = req.params;
    blogData.getPostById(id)
  .then(post => res.json(post))
    .catch(err => res.status(err.status || 500).json({ error: err.message }));
});

app.get("/categories/delete/:id", (req, res) => {
  blogData.deleteCategoryById(req.params.id)
    .then(() => {
      res.redirect("/categories");
    })
    .catch(() => {
      console.log("Unable to remove category / Category not found");
    });
});
app.get("/categories", (req, res) => {
  blogData.getCategories()
    .then((data) => {
          if(data.length > 0)  res.render("categories", { categories: data });
      else res.render("categories", { message: "No Results" });
          })
    // Error Handling
    .catch(() => {
      res.render("categories", { message: "no results" });
    });
});

app.post("/categories/add", (req, res) => {
    let newObject = {};
  newObject.category= req.body.category ;
   console.log(req.body.category);
if (req.body.category != "") {
 blogData.addCategory(newObject)
   .then(() => {
     res.redirect("/categories");
   })
   .catch(() => {
     console.log("Some error occured");
   });
}
});

app.get('/categories/add', function(req, res) {
  res.render('addCategory',{
      title: 'Add Category'
    });
  }); 
  app.get('/blog/:id', async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
    try{
        // declare empty array to hold "post" objects
        let posts = [];
        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }
        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
  
        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
    }catch(err){
        viewData.message = "no results";
    }
    try{
        // Obtain the post by "id"
        viewData.post = await blogData.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }
    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();
  
        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
  });
app.get('*', (req, res) => {
  res.status(404).send('Page not found');
});





blogData.initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`Server is listening on port ${HTTP_PORT}`);
    });
  })
  .catch((error) => {
    console.log(`Failed to initialize data: ${error}`);
  });
