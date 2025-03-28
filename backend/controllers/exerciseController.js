const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const Exercise = require("../models/exerciseModel");
const User = require("../models/userModel");

const getExerciseHistory = asyncHandler(async (req, res) => {
  try{
    
    var { page = 1, perPage = 10, search, sortBy, category, equipment, goal, collection } = req.query;
    console.log("get_exercise_history " + page + ' ' + perPage + ' ' + search + ' ' + sortBy + ' ' + category + ' ' + equipment + ' ' + goal + ' ' + collection);

    const pipeline = [
      {
        $match: { email: req.user.email },
      },
      {
        $lookup: {
          from: "exercises",
          localField: "histories.exerciseId",
          foreignField: "_id",
          as: "populatedExercises",
        },
      },
      {
        $project: {
          _id: 1,
          favorites: 1,
          histories: 1,
          populatedExercises: '$populatedExercises',
        }
      },
      {
        $unwind: '$populatedExercises',
      },
      {
        $addFields: {
          'history': {
            $filter: {
              input: '$histories',
              as: 'history',
              cond: { $eq: ['$$history.exerciseId', '$populatedExercises._id'] }
            }
          }
        }
      },
      {
        $project: {
          _id: '$populatedExercises._id',
          title: '$populatedExercises.title',
          vimeoId: '$populatedExercises.vimeoId',
          thumbnail: '$populatedExercises.thumbnail',
          description: '$populatedExercises.description',
          categories: '$populatedExercises.categories',
          viewcount: { $arrayElemAt: ['$history.viewcount', 0] },
          lastview: { $arrayElemAt: ['$history.lastview', 0] },
          isFavorite: { $in: ['$populatedExercises._id', '$favorites'] } // Check if _id is in favorites array
        },
      },
      
    ];
 
    if(category) {
      const categoryId = new mongoose.Types.ObjectId(category);
      pipeline.push({
        $match: { 'categories' : { $in : [categoryId] } },
      });
    }

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'title': { $regex: new RegExp(search, 'i') } },
            { 'description': { $regex: new RegExp(search, 'i') } } ,
          ]
        }
      });
    }

    // console.log(pipeline);
    // const results = await User.aggregate(pipeline);
    // console.log(results);

    const totalCount = [
      {
        $count: 'totalMatchingDocuments',
      },
    ];

    const pipelineExercises = [];

    if (sortBy) {
      var order = getSortInfo(sortBy);
      
      pipelineExercises.push({
        $sort: order,
      });
    }

    // Pagination
    if (perPage && page) {
      const skip = (page - 1) * perPage;
      pipelineExercises.push({ $skip: skip });
      pipelineExercises.push({ $limit: parseInt(perPage) });
    }
    
    const facet = {
      $facet: {
        "populatedExercises": pipelineExercises,
        "totalCount": totalCount,
      }
    }
    pipeline.push(facet);
    
//    console.log(pipeline);
//    console.log(pipelineExercises);
//    console.log(totalCount);

   const results = await User.aggregate(pipeline);

    var exercises = [];
    var count = 0;

    if (results.length != 0){
      exercises = results[0].populatedExercises;
      
      if (results[0].totalCount.length != 0 )
        count = results[0].totalCount[0].totalMatchingDocuments;
    }

//    console.log(count);
    console.log(exercises);
    
    res.status(200).json({ count: count, exercises: exercises});
  } catch(e) {
    console.log(e);
  }
  
});

const getExerciseFavorite = asyncHandler(async (req, res) => {
  try{
    
    var { page = 1, perPage = 10, search, sortBy, category, equipment, goal, collection } = req.query;
    console.log("get_exercise_favorite " + page + ' ' + perPage + ' ' + search + ' ' + sortBy + ' ' + category + ' ' + equipment + ' ' + goal + ' ' + collection);

    const pipeline = [
      {
        $match: { email: req.user.email },
      },
      {
        $lookup: {
          from: "exercises",
          localField: "favorites",
          foreignField: "_id",
          as: "populatedExercises",
        },
      },
      {
        $project: {
          _id: 1,
          favorites: 1,
          histories: 1,
          populatedExercises: '$populatedExercises',
        }
      },
      {
        $unwind: '$populatedExercises',
      },
      {
        $addFields: {
          'history': {
            $filter: {
              input: '$histories',
              as: 'history',
              cond: { $eq: ['$$history.exerciseId', '$populatedExercises._id'] }
            }
          },
        }
      },
      {
        $project: {
          _id: '$populatedExercises._id',
          title: '$populatedExercises.title',
          vimeoId: '$populatedExercises.vimeoId',
          thumbnail: '$populatedExercises.thumbnail',
          description: '$populatedExercises.description',
          categories: '$populatedExercises.categories',
          viewcount: { $ifNull: [ {$arrayElemAt: ['$history.viewcount', 0]} , 0] },
          lastview:  { $ifNull: [ {$arrayElemAt: ['$history.lastview', 0]} , ''], },
          isFavorite: { $in: ['$populatedExercises._id', '$favorites'] } // Check if _id is in favorites array
        },
      },
      
    ];
 
    if(category) {
      const categoryId = new mongoose.Types.ObjectId(category);
      pipeline.push({
        $match: { 'categories' : { $in : [categoryId] } },
      });
    }

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'title': { $regex: new RegExp(search, 'i') } },
            { 'description': { $regex: new RegExp(search, 'i') } } ,
          ]
        }
      });
    }

    const totalCount = [
      {
        $count: 'totalMatchingDocuments',
      },
    ];

    const pipelineExercises = [];

    if (sortBy) {
      var order = getSortInfo(sortBy);
      
      pipelineExercises.push({
        $sort: order,
      });
    }

    // Pagination
    if (perPage && page) {
      const skip = (page - 1) * perPage;
      pipelineExercises.push({ $skip: skip });
      pipelineExercises.push({ $limit: parseInt(perPage) });
    }
    
    const facet = {
      $facet: {
        "populatedExercises": pipelineExercises,
        "totalCount": totalCount,
      }
    }
    pipeline.push(facet);
    
    console.log(pipeline);
    console.log(pipelineExercises);
    console.log(totalCount);

   const results = await User.aggregate(pipeline);

    var exercises = [];
    var count = 0;

    if (results.length != 0){
      exercises = results[0].populatedExercises;
      
      if (results[0].totalCount.length != 0 )
        count = results[0].totalCount[0].totalMatchingDocuments;
    }

    console.log(count);
    console.log(exercises);
    
    res.status(200).json({ count: count, exercises: exercises});
  } catch(e) {
    console.log(e);
  }
  
});


const getExerciseLibrary = asyncHandler(async (req, res) => {
  try{
    var starttime = Date.now();
    var { page = 1, perPage = 10, search, sortBy, category, equipment, goal, collection } = req.query;
        
    console.log("this is category", typeof(category));  
    console.log("this is collection", typeof(collection));  
    console.log("this is equipment", equipment);
    const userData = await User.findOne({email: req.user.email}).select(["histories", "favorites"]);

    const pipeline = [

    ];

    if(category) {
      const categoryId = new mongoose.Types.ObjectId(category);
      console.log("thj is categoryId", categoryId);
      pipeline.push({
        $match: { 'categories' : { $in : [categoryId] } },
      });
    }

    if(collection) {
      const collectionId = new mongoose.Types.ObjectId(collection);
      pipeline.push({
        $match: { 'collections' : { $in : [collectionId] } },
      });
    } 

    if (equipment && equipment !== "[]") {
      console.log("this is equipment", JSON.parse(equipment)); // Log the first element
      const equipmentIds = JSON.parse(equipment).map(e => new mongoose.Types.ObjectId(e)); // Convert each element to ObjectId
      console.log("thj is equipment", equipmentIds);
      pipeline.push({
        $match: { 'equipments': { $in: equipmentIds } },
      });
    }

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'title': { $regex: new RegExp(search, 'i') } },
            { 'description': { $regex: new RegExp(search, 'i') } } ,
          ]
        }
      });
    }

    pipeline.push({
      $project: {
        _id: 1,
        title: 1,
        vimeoId: 1,
        thumbnail: 1,
        description: 1,
      }
    });
    
    const totalCount = [
      {
        $count: 'totalMatchingDocuments',
      },
    ];

    const pipelineExercises = [];

    if (sortBy) {
      var order = getSortInfo(sortBy);
      
      pipelineExercises.push({
        $sort: order,
      });
    }

    // Pagination
    if (perPage && page) {
      const skip = (page - 1) * perPage;
      pipelineExercises.push({ $skip: skip });
      pipelineExercises.push({ $limit: parseInt(perPage) });
    }
    
    const facet = {
      $facet: {
        "populatedExercises": pipelineExercises,
        "totalCount": totalCount,
      }
    }
    pipeline.push(facet);
        
    const results = await Exercise.aggregate(pipeline);

    var exercises = [];
    var count = 0;

    if (results.length != 0){
      exercises = results[0].populatedExercises;
      
      if (results[0].totalCount.length != 0 )
        count = results[0].totalCount[0].totalMatchingDocuments;
      console.log("this is count", count);
    }

    for (var i = 0; i < exercises.length; i++){
      
      var history = null;
      for (var j = 0; j < userData?.histories.length; j++){
        
        if (userData?.histories[j].exerciseId.toString() == exercises[i]._id.toString()){
          history = userData?.histories[j];
          break;
        }
      }
      
      //console.log(exercises[i]._id);
      //console.log(userData?.favorites.includes(exercises[i]._id));

      exercises[i] = {
        ...exercises[i],
        isFavorite: userData?.favorites.includes(exercises[i]._id),
        viewcount: history != null ? history.viewcount : 0,
        lastview: history != null ? history.lastview : '',
      }
    }

    res.status(200).json({count: count, exercises: exercises});
  } catch(e) {
    console.log(e);
  }
  
});

const getExerciseRecommended = asyncHandler(async (req, res) => {
  try{
    const {perPage} = req.query;
    console.log("getExerciseRecommended " + perPage);
    console.log("getExerciseRecommended " + req.user.email);
    const pipeline = [
      {
        $match: { email: req.user.email },
      },
      {
        $facet: {
          userData: [
            {
              $project: {
                level: 1,
                histories: 1,
                favorites: 1,
              }
            }
          ],
          exercise: [
            {
              $project: {
                histories: 1,
                level: 1,
              }
            },
            {
              $lookup: {
                from: "exercises",
                localField: "histories.exerciseId",
                foreignField: "_id",
                as: "populatedExercises",
              },
            },
            {
              $unwind: '$populatedExercises',
            },
            {
              $addFields: {
                'history': {
                  $filter: {
                    input: '$histories',
                    as: 'history',
                    cond: { $eq: ['$$history.exerciseId', '$populatedExercises._id'] }
                  }
                }
              }
            },
            // {
            //   $project: {
            //     _id: '$populatedExercises._id',
            //   }
            // },
            {
              $sort: { 'history.viewcount' : -1 }
            },
            {
              $project: {
                level: 1,
                viewcount: '$history.viewcount',
                exerciseId: '$populatedExercises._id',
                categories: '$populatedExercises.categories'
              }
            },
            {
              $limit: 1
            }
          ]
        }
      },
      
    ];

    const result = await User.aggregate(pipeline);
    console.log("this is result", result[0].userData);
    var level = -1;
    var category = null;

    //console.log(result[0]);
    //console.log(result[0].userData);

    if (result.length != 0){
      if (result[0].userData.length != 0){
        level = result[0].userData[0].level;
      }
      
      if (result[0].exercise.length != 0){
        const categories = result[0].exercise[0].categories;
        if (categories.length != 0)
          category = categories[0];
      }
    }


    var query = [];
    query.push({ difficulty : level });
    if (category) {
      query.push({categories: {$in: [category]}});
    }
    
    const exercises = await Exercise.find({$and: query}).select(["title", "vimeoId", "thumbnail", "description"]).sort({popularity: -1}).limit(perPage);
    
    var favorites = result[0].userData[0].favorites.map(obj => obj.toString());
  
    for (var i = 0; i < exercises.length; i++){
      var index = result[0].userData[0].histories.findIndex(history => history.exerciseId == exercises[i]._id);
      var history;
      if (index != -1)
        history = result[0].userData[0].histories[index];

      exercises[i]._doc = {
        ...exercises[i]._doc,
        isFavorite: favorites.includes(exercises[i]._id.toString()) ? true : false,
        lastview: history != null ? history.lastview : '',
        viewcount: history != null ? history.viewcount: 0,
      }
    }
    //console.log({count: exercises.length, exercises: exercises});
    res.status(200).json({count: exercises.length, exercises: exercises});
  } catch(e) {
    console.log(e);
  }
});

const getExercise = asyncHandler(async (req, res) => {
  try{
    const {exerciseId} = req.query;
    console.log("this is ", exerciseId);
    const exercise = await Exercise.findById(exerciseId)
      .populate("categories")
      .populate("equipments");

    var exerciseData = exercise._doc;
    
    var user = await User.findOne({email: req.user.email}).select(["notes", "histories", "favorites"]);
    const note = user.notes.find(note => note.exerciseId.equals(exerciseId));

    const category = exercise.categories.length != 0 ? exercise.categories[0] : null;
    const relatedExercises = await getRelatedExercises(user, category);

    exerciseData = {
      ...exerciseData,
      relatedExercises: relatedExercises,
      note: note ? note.note : '',
    }
    console.log(exerciseData);

    res.status(200).json(exerciseData);

    exercise.popularity ++;
    exercise.save();

    const historyIndex = user.histories.findIndex(history => history.exerciseId.equals(exerciseId));

    if (historyIndex !== -1) {
      user.histories[historyIndex].viewcount++;
      user.histories[historyIndex].lastview = new Date();
    } else {
      user.histories.push({
        exerciseId: exerciseId,
        viewcount: 1,
        lastview: new Date(),
      });
    }
    
    await user.save();

  } catch(error){
    console.log(error);
  }
  
});

const updateNote = asyncHandler(async (req, res) => {
  try{
    const {exerciseId, note} = req.query;
    console.log("updateNote " + exerciseId + ' ' + note);
    
    const user = await User.findOne({ email: req.user.email }).select("notes");
    
    const noteIndex = user.notes.findIndex(note => note.exerciseId.equals(exerciseId));
    
    if (noteIndex !== -1) {
      user.notes[noteIndex].note = note;
    } else {
      user.notes.push({
        exerciseId: exerciseId,
        note: note
      });
    }
    
    const updatedUser = await user.save();
    
    if (updatedUser) {
      console.log('Note updated or added successfully.');
    } else {
      console.log('Error updating or adding note.');
    }
    res.status(200).json();
  } catch(error){
    console.log(error);
  }
});

const updateFavorite = asyncHandler(async (req, res) => {
  try{
    const {exerciseId, isFavorite} = req.query;
    console.log("updateFavorite " + exerciseId + ' ' + isFavorite);
    const user = await User.findOne({email: req.user.email}).select('favorites');
   
    const indexToRemove = user.favorites.indexOf(exerciseId);
    var result = false;

    if (indexToRemove > -1 && isFavorite == 'false'){
      user.favorites.splice(indexToRemove, 1);
      result = false;
    }
      
    else if (indexToRemove == -1 && isFavorite == 'true') {
      user.favorites.push(exerciseId);
      result = true;
    }
    
    const updatedUser = user.save();
    
    if (updatedUser) {
      console.log('Favorite updated or added successfully.');
    } else {
      console.log('Error updating or adding note.');
    }
    res.status(200).json({res: result});
    
  } catch(error){
    console.log(error);
  }
});

const getRelatedExercises = async (userData, category) => {
  var results = [];

  if (userData && category) {
    results = await Exercise.find({categories: {$in: [category]}})
    .select(["title", "vimeoId", "thumbnail", "description"])
    .sort({'popularity' : 1}).limit(5);

    for (var i = 0; i < results.length; i++){
      
      var history = null;
      for (var j = 0; j < userData?.histories.length; j++){
        
        if (userData?.histories[j].exerciseId.toString() == results[i]?._id.toString()){
          history = userData?.histories[j];
          break;
        }
      }
      
      results[i]._doc = {
        ...results[i]._doc,
        isFavorite: userData?.favorites.includes(results[i]?._id),
        viewcount: history != null ? history.viewcount : 0,
        lastview: history != null ? history.lastview : '',
      }
    }
  }
  
  return results;
}

const getExercisesAdmin = asyncHandler(async (req, res) => {
  try{
    var { page = 1, perPage = 10, search, sortBy, category, equipment, goal, collection } = req.query;
    console.log(page + ' ' + perPage + ' ' + search + ' ' + sortBy + ' ' + category + ' ' + equipment + ' ' + goal + ' ' + collection);
    
    const pipeline = [

    ];

    if(category) {
      const categoryId = new mongoose.Types.ObjectId(category);
      pipeline.push({
        $match: { 'categories' : { $in : [categoryId] } },
      });
    }

    if(collection) {
      const collectionId = new mongoose.Types.ObjectId(collection);
      pipeline.push({
        $match: { 'collections' : { $in : [collectionId] } },
      });
    } 

    if(equipment) {
      const equipmentId = new mongoose.Types.ObjectId(equipment);
      pipeline.push({
        $match: { 'equipments' : { $in : [equipmentId] } },
      });
    } 

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'title': { $regex: new RegExp(search, 'i') } },
            { 'description': { $regex: new RegExp(search, 'i') } } ,
            { 'vimeoId': { $regex: new RegExp(search, 'i') } } ,
          ]
        }
      });
    }

    const totalCount = [
      {
        $count: 'totalMatchingDocuments',
      },
    ];

    const pipelineExercises = [];

    if (sortBy) {
      var order = getSortInfo(sortBy);
      
      pipelineExercises.push({
        $sort: order,
      });
    }

    // Pagination
    if (perPage && page) {
      const skip = (page - 1) * perPage;
      pipelineExercises.push({ $skip: skip });
      pipelineExercises.push({ $limit: parseInt(perPage) });
    }
    
    const facet = {
      $facet: {
        "populatedExercises": pipelineExercises,
        "totalCount": totalCount,
      }
    }
    pipeline.push(facet);
    
    const results = await Exercise.aggregate(pipeline);

    var exercises = [];
    var count = 0;

    if (results.length != 0){
      exercises = results[0].populatedExercises;
      
      if (results[0].totalCount.length != 0 )
        count = results[0].totalCount[0].totalMatchingDocuments;
    }

    //console.log( "time = " + (Date.now() - starttime).toString() );

//    const count = await Exercise.countDocuments(query);

//    console.log("count = " + count );
//    console.log(exercises);

    res.status(200).json({count: count, exercises: exercises});
  } catch(e) {
    console.log(e);
  }
  
});

const getExerciseAdmin = asyncHandler(async (req, res) => {
  try{

    const exercise = await Exercise.findOne({_id: req.params.id});

    res.status(200).json(exercise);

  } catch(error){
    console.log(error);
  }
  
});

const getSortInfo = (sortBy) => {
  let orderBy, orderDir;

  switch (sortBy){
    case "Popularity":
      orderBy = 'popularity';
      orderDir = -1;
      break;
    case "NameAtoZ":
      orderBy = 'title';
      orderDir = 1;
      break;
    case "NameZtoA":
      orderBy = 'title';
      orderDir = -1;
      break;
    case "NewestAdded":
      orderBy = 'createdAt';
      orderDir = 1;
      break;
    case "OldestAdded":
      orderBy = 'createdAt';
      orderDir = -1;
      break;
    case "LastViewed":
      orderBy = 'lastview';
      orderDir = -1;
      break;
    default:
      orderBy = 'title';
      orderDir = 1; 
      break;
  }

  return { [orderBy]: orderDir };
};

const addExercises = asyncHandler(async (req, res) => {
  try{
    var titleArray = ["Barbell Bench Press", "Body Weight Squat", "Barbell Back Squat", "Body Weight Push-up", "DB Incline Bench Press"];
    var description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.In metus vulputate eu scele";
    var vimeoId = "265111898";
    var thumbnailArray = 
              [ "https://firebasestorage.googleapis.com/v0/b/cressey-3d9ca.appspot.com/o/exercise_thumbnails%2Fcardimage4.png?alt=media&token=497d2070-6f48-455a-93a2-3435c874a653",
                "https://firebasestorage.googleapis.com/v0/b/cressey-3d9ca.appspot.com/o/exercise_thumbnails%2Fcardimage1.png?alt=media&token=611f63c9-88b4-44ed-b007-139f030d5483",
                "https://firebasestorage.googleapis.com/v0/b/cressey-3d9ca.appspot.com/o/exercise_thumbnails%2Fcardimage4.png?alt=media&token=497d2070-6f48-455a-93a2-3435c874a653",
                "https://firebasestorage.googleapis.com/v0/b/cressey-3d9ca.appspot.com/o/exercise_thumbnails%2Fcardimage5.png?alt=media&token=46ea1019-4efa-4209-9aaa-5b1d89c540f6"
              ];
    var categoriesArray = [
      "65a4ff5cb383c68778765e2b",
      "65a50047b383c68778765e2c",
      "65a50070b383c68778765e2d",
      "65a500c6b383c68778765e2e",
      "65a500dbb383c68778765e2f",
      "65a500e9b383c68778765e30"
    ];

    var collectionsArray = [
      "65a4f3d2b383c68778765e25",
      "65a4f474b383c68778765e26",
      "65a4f4a1b383c68778765e27",
      "65a4f4a9b383c68778765e28",
      "65a4f4bbb383c68778765e29"
    ];

    var equipmentsArray = [
      "65a508cdb383c68778765e32",
      "65a50915b383c68778765e33",
    ];

    var documents = [];
    for (var i = 0; i < 3000; i++) {
      var randId = getRandomInt(0, titleArray.length - 1);
      var title = titleArray[randId];
      randId = getRandomInt(0, thumbnailArray.length - 1);
      var thumbnail = thumbnailArray[randId];
      randId = getRandomInt(0, categoriesArray.length - 1);
      var category = new mongoose.Types.ObjectId(categoriesArray[randId]);
      randId = getRandomInt(0, collectionsArray.length - 1);
      var collection = new mongoose.Types.ObjectId(collectionsArray[randId]);
      randId = getRandomInt(0, equipmentsArray.length - 1);
      var equipment = new mongoose.Types.ObjectId(equipmentsArray[randId]);

      var exercise = {
        title,
        vimeoId,
        thumbnail,
        description,
        popularity: 0,
        categories: [category],
        collections: [collection],
        equipments: [equipment],
      }
      documents.push(exercise);
    }
    await Exercise.insertMany(documents);
    res.status(200).json();
  } catch(error){
    console.log(error);
  }
});

const updateExercises = asyncHandler(async (req, res) => {
  try{
    console.log("update exercises");
    var exercises = await Exercise.find({});
    for (var i = 0; i < exercises.length; i++) {
      exercises[i].difficulty = getRandomInt(1, 3);
      await exercises[i].save();
    }

    res.status(200).json();
  } catch (error){
    console.log(error);
  }
});

const addExerciseAdmin = asyncHandler(async (req, res) => {
  try{
    const {title, description, thumbnail, vimeoId, difficulty, categories, collections, equipments} = req.body;
    const documentToInsert = {
      title,
      vimeoId,
      thumbnail,
      description,
      popularity: 0,
      difficulty,
      categories,
      collections,
      equipments,
    };

    var exercise = await Exercise.create(documentToInsert);
    if (exercise)
      res.status(200).json({result: true});
    else
      res.status(200).json({result: false});

  } catch(error){
    console.log(error);
  }
});

const updateExerciseAdmin = asyncHandler(async (req, res) => {
  try{
    const {_id, title, description, thumbnail, vimeoId, difficulty, categories, collections, equipments} = req.body;

    await Exercise.findOneAndUpdate({_id: _id}, 
      {title: title, description: description, difficulty: difficulty, thumbnail: thumbnail, vimeoId: vimeoId, categories: categories, collections: collections, equipments: equipments})
      .then(doc => {
      console.log('Document updated successfully:', doc);
      res.status(200).json({result: true});
    })
    .catch(error => {
      console.error('Error updating document:', error);
      res.status(200).json({result: false, message: error});
    });
    
  } catch(error){
    console.log(error);
  }
});

const deleteExerciseAdmin = asyncHandler(async (req, res) => {
  try{
    
    await Exercise.findOneAndDelete({_id: req.params.id})
    .then(result => {
      console.log('Document deleted successfully:', result);
      res.status(200).json({result: true});
    })
    .catch(error => {
      console.error('Error deleting document:', error);
      res.status(200).json({result: false, message: error});
    });
  } catch(error){
    console.log(error);
  }
});

function getRandomInt(min, max) {
  // Use Math.floor to round down and convert the result to an integer
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  getExerciseHistory,
  getExerciseLibrary,
  getExerciseFavorite,
  getExerciseRecommended,
  getExercise,
  updateFavorite,
  updateNote,
  addExercises,
  updateExercises,

  addExerciseAdmin,
  updateExerciseAdmin,
  deleteExerciseAdmin,
  getExercisesAdmin,
  getExerciseAdmin
};
