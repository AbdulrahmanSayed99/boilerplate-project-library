/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

module.exports = function (app) {
  let mongodb = require('mongodb')
  let mongoose = require('mongoose')
  require('dotenv').config()

	mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  let bookSchema = new mongoose.Schema({
    title : {type: String, required: true},
    comments: [String]
  })
  let Book = mongoose.model('Book', bookSchema)

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      let arrayOfBooks= []
      Book.find({}, (error, results)=>{
        if (!error && results){
          results.forEach(result=>{
            let book = result.toJSON();
          book['commentcount']=book.comments.length
          arrayOfBooks.push(book)
        })


          return res.json(arrayOfBooks)
        }
      })
    })
    
    .post(function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if(!title){
        return res.json('missing required field title')
      }
      let newBook= new Book({
        title, comments: []
      })

      newBook.save((error, savedBook)=>{
        res.json(savedBook)
      })
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      Book.remove({},
        (error, status)=>{
          if (!error && status) {
            return res.json('complete delete successful')
          }
        }
      )
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      Book.findById(bookid, (error, foundBook)=>{
       if (!error && foundBook){
        return res.json(foundBook)
      }
       else return res.json('no book exists')
      })
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!comment){
        return res.json('missing required field comment')
      }
      Book.findByIdAndUpdate(bookid, {$push: {comments: comment}}, {new: true}, (error, updatedBook)=>{
        if (!error && updatedBook){
         return res.json(updatedBook)
        }
        else return res.json('no book exists')
      })
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      Book.findByIdAndRemove(bookid, (error, status)=>{
        if (!error && status){
          return res.json('delete successful')
        }
        else return res.json('no book exists')
      })
    });
  
};
