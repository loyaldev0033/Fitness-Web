const asyncHandler = require("express-async-handler");

const Intro = require("../models/introModel");

const getIntro = asyncHandler(async (req, res) => {
  try{
    console.log("get intro vimeo id");

    const intro = await Intro.findOne({});
    
    res.status(200).json(intro);
  } catch(e) {
    console.log(e);
  }
  
});

const updateIntro = asyncHandler(async (req, res) => {
  try{
    console.log("update intro vimeo id");
    const {vimeoId} = req.body;
    
    await Intro.findOneAndUpdate({}, {vimeoId: vimeoId}).then(doc => {
      console.log('Document updated successfully:', doc);
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

module.exports = {
  getIntro,
  updateIntro,
};
