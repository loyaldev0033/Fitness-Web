const asyncHandler = require("express-async-handler");

const Category = require("../models/categoryModel");
const Exercise = require("../models/exerciseModel");

const getCategories = asyncHandler(async (req, res) => {
  try{
    console.log("getCategories");
    const categories = await Category.find({ });
    for (let i = 0; i < categories.length; i++){
      var count = await Exercise.countDocuments({ categories: {$in: categories[i].id }});
      
      categories[i]._doc = {
        ...categories[i]._doc,
        count: count,
      }
    }
    res.status(200).json(categories);
  } catch(e) {
    console.log(e);
  }
  
});

const getCategory = asyncHandler(async (req, res) => {
  try{
    console.log("getCategory");
    const id = req.params.id;
    const category = await Category.findOne({ _id: id });

    var count = await Exercise.countDocuments({ categories: {$in: category.id }});

    category._doc = {
      ...category._doc,
      count: count,
    }
    
    res.status(200).json(category);
  } catch(e) {
    console.log(e);
  }
  
});

const addCategory = asyncHandler(async (req, res) => {
  try{
    console.log("addCategory");
    const {title, thumbnail} = req.body;
    
    const documentToInsert = {
      title: title,
      thumbnail: thumbnail,
    };
    
    const category = await Category.create(documentToInsert);
    if (category){
      res.status(200).json({result: true});
    }
    else{
      res.status(200).json({result: false});
    }
  } catch(e) {
    console.log(e);
  }
  
});

const updateCategory = asyncHandler(async (req, res) => {
  try{
    console.log("updateCategory");
    const {_id, title, thumbnail} = req.body;
    
    await Category.findOneAndUpdate({_id: _id}, {title: title, thumbnail: thumbnail})
    .then(doc => {
      res.status(200).json({result: true});
    })
    .catch(error => {
      console.error('Error updating document:', error);
      res.status(200).json({result: false, message: error});
    });

  } catch(e) {
    console.log(e);
  }
  
});

const deleteCategory = asyncHandler(async (req, res) => {
  try{

    const id = req.params.categoryId;
        
    await Category.findOneAndDelete({_id: id})
    .then(result => {
      res.status(200).json({result: true});
    })
    .catch(error => {
      console.error('Error deleting document:', error);
      res.status(200).json({result: false, message: error});
    });

  } catch(e) {
    console.log(e);
  }
  
});

module.exports = {
  getCategories,
  addCategory,
  getCategory,
  updateCategory,
  deleteCategory,
};
