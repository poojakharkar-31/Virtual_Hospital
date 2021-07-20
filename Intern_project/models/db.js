const mongoose = require('mongoose');

// var student = new Mongoose();
mongoose.connect('mongodb://localhost:27017/students_details', { useNewUrlParser: true }, (err) => {
    if (!err) { console.log('MongoDB Connection Succeeded.') }
    else { console.log('Error in DB connection : ' + err) }
});

// var course = new Mongoose();
// course.connect('mongodb://localhost:27017/course_details', { useNewUrlParser: true }, (err) => {
//     if (!err) { console.log('MongoDB Connection Succeeded.') }
//     else { console.log('Error in DB connection : ' + err) }
// });


require('./student.model');

module.exports = exports = mongoose;
