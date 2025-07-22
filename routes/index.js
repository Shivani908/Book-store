var express = require('express');
var router = express.Router();
const path = require("path");
const fs = require("fs");
const BookCollection = require('../models/BookSchema');
const { checkPrice } = require("../utils/middlewares");
const upload = require("../utils/multer");
const {sendMail} = require("../utils/sendmail")

/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index');
});


router.get('/library', async function(req, res, next) {
  try{
    const books = await BookCollection.find();
    res.render('library',{books : books});
  }
  catch(error){
     console.log(error);
     res.send (error)
  }
 
});




router.get('/about', function(req, res, next) {
  res.render('about');
});



router.get('/create', function(req, res, next) {
  res.render('create');
});




// router.post('/create', upload.single("posters"), checkPrice, async function(req, res, next) {
//   try{
//     const newBook = await  new BookCollection({
//       ...req.body,
//       posters: req.file.filename,}
//     );
//     newBook.name.toLocaleUpperCase()
//     await newBook.save()
//     res.redirect("/library");
//   }
//   catch (error){
//      console.log(error);
//      res.send(error);  
//   }

// });



router.post(
  "/create",
  upload.single("poster"),
  checkPrice,
  async function (req, res, next) {
      try {
          const newBook = await new BookCollection({
              ...req.body,
              poster: req.file.filename,
          });

          await newBook.save();
          res.redirect("/library");
      } catch (error) {
          console.log(error);
          res.send(error);
      }
  }
);


router.get('/details/:id', async function(req, res, next) {
  try{
    const book = await BookCollection.findById(req.params.id) 
    res.render('details',{ book : book });
  }
  catch(error){ 
    console.log(error);
    res.send(error)
  }
  
});




router.get("/update/:id", async function (req, res, next) {
  try {
      const book = await BookCollection.findById(req.params.id);
      res.render("update", { book: book });
  } catch (error) {
      console.log(error);
      res.send(error);
  }
});

router.post("/update/:id",upload.single("posters"),  async function (req, res, next) {
  try {
      const updateBook = {...req.body};
      if(req.file){
        updateBook.poster = req.file.filename;
        fs.unlinkSync(
          path.join(
            __dirname,
            `../public/images/${req.body.oldimage}`
          )
        );
      }
      
      await BookCollection.findByIdAndUpdate(req.params.id, updateBook);
      res.redirect(`/details/${req.params.id}`);
      
  } catch (error) {
      console.log(error);
      res.send(error);
  }
});




router.get("/delete/:id", async function (req, res, next) {
    try {
    const book = await BookCollection.findByIdAndDelete(req.params.id);

    fs.unlinkSync(path.join(__dirname, `../public/images/${book.poster}`));

    res.redirect("/library");
} catch (error) {
    console.log(error);
    res.send(error);
}

  // const book = BookCollection.findByIdAndDelete(req.params.id);
  // console.log(book);
});




// router.get('/delete/:id', async  function(req, res, next) {
//   try{
//     await BookCollection.findByIdAndDelete(req.params.id)
//     res.redirect("/library")
//   }
//   catch(error){
//     console.log(error);
//     res.send(error)
//   }
  
// });


router.post("/sendmail", function(req, res, next){
  sendMail(req, res);
});


module.exports = router;
