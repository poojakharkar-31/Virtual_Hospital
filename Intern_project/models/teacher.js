const mongoose = require('mongoose');

// Teacher Schema
const TeacherSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },

const Teacher = mongoose.model('Teacher', TeacherSchema);
module.exports.Teacher = Teacher;