const mongoose = require('mongoose');

// var student = new Mongoose();
mongoose.connect('mongodb://localhost:27017/courses_details', { useNewUrlParser: true }, (err) => {
    if (!err) { console.log('MongoDB Connection Succeeded.') }
    else { console.log('Error in DB connection : ' + err) }
});

// Course Schema
const courseSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  fees: {
    type: String,
    required: true
  }
});
const Course = mongoose.model('Course', courseSchema);
module.exports= mongoose;