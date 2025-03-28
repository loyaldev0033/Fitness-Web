const asyncHandler = require("express-async-handler");

const Collection = require("../models/collectionModel");
const Exercise = require("../models/exerciseModel");

const getCollections = asyncHandler(async (req, res) => {
  try{
    console.log("get collections");

    const { tag } = req.query;
    
    const collections = await Collection.find( { tags: { $in: tag } }).select(["title", "thumbnail"]);

    for (let i = 0; i < collections.length; i++){
      var count = await Exercise.countDocuments({ collections: {$in: collections[i].id }});
      collections[i]._doc = {
        ...collections[i]._doc,
        count: count,
      }
    }
    res.status(200).json(collections);
  } catch(e) {
    console.log(e);
  }
  
});

const getAllCollections = asyncHandler(async (req, res) => {
  try{
    console.log("get all collections");

    const collections = await Collection.find( {} ).select(["title", "thumbnail"]).populate('tags', 'id name');

    for (let i = 0; i < collections.length; i++){
      var count = await Exercise.countDocuments({ collections: {$in: collections[i].id }});
      collections[i]._doc = {
        ...collections[i]._doc,
        count: count,
      }
    }
    
    res.status(200).json(collections);
  } catch(e) {
    console.log(e);
  }
  
});

const getCollection = asyncHandler(async (req, res) => {
  try{
    console.log("get collection");

    const collection = await Collection.findOne( {_id: req.params.id} ).select(["title", "thumbnail"]).populate('tags', 'id name');
    
    var count = await Exercise.countDocuments({ collections: {$in: collection.id }});
    collection._doc = {
      ...collection._doc,
      count: count,
    }
  
    res.status(200).json(collection);
  } catch(e) {
    console.log(e);
  }
  
});

const addCollection = asyncHandler(async (req, res) => {
  try{
    console.log("addCollection");
    const {title, thumbnail, tags} = req.body;
    
    const documentToInsert = {
      title: title,
      thumbnail: thumbnail,
      tags: tags
    };
    
    const collection = await Collection.create(documentToInsert);
    if (collection){
      res.status(200).json({result: true});
    }
    else{
      res.status(200).json({result: false});
    }

  } catch(e) {
    console.log(e);
  }
  
});

const updateCollection = asyncHandler(async (req, res) => {
  try{
    console.log("updateCollection");
    const {_id, title, thumbnail, tags} = req.body;
    
    await Collection.findOneAndUpdate({_id: _id}, {title: title, thumbnail: thumbnail, tags: tags}).then(doc => {
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

const deleteCollection = asyncHandler(async (req, res) => {
  try{
    console.log("deleteCollection");
    
    await Collection.findOneAndDelete({_id: req.params.id})
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
  getCollections,
  getCollection,
  getAllCollections,
  addCollection,
  updateCollection,
  deleteCollection
};
