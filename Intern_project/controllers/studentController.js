const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Student = mongoose.model('Student');

router.get('/students', (req, res) => {
    res.render("students/addOrEdit.hbs", {
        viewTitle: "Insert Student"
    });
});

router.post('/students', (req, res) => {
    if (req.body._id == '')
        insertRecord(req, res);
        else
        updateRecord(req, res);
});


function insertRecord(req, res) {
    var student = new Student();
    student.name = req.body.name();
    student.email = req.body.email();
    student.phone = req.body.phone();
    student.branch = req.body.branch();
    student.date = req.body.date();
    student.save((err, doc) => {
        if (!err)
            res.redirect('/students/list');
        else {
            if (err.name == 'ValidationError') {
                handleValidationError(err, req.body);
                res.render("students/addOrEdit.hbs", {
                    viewTitle: "Insert Student Details",
                    student: req.body
                });
            }
            else
                console.log('Error during record insertion : ' + err);
        }
    });
}

function updateRecord(req, res) {
    Student.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true }, (err, doc) => {
        if (!err) { res.redirect('/students/list'); }
        else {
            if (err.name == 'ValidationError') {
                handleValidationError(err, req.body);
                res.render("students/addOrEdit.hbs", {
                    viewTitle: 'Update Student Details',
                    student: req.body
                });
            }
            else
                console.log('Error during record update : ' + err);
        }
    });
}


router.get('/list', (req, res) => {
    Student.find((err, docs) => {
        if (!err) {
            res.render("students/list.hbs", {
                list: docs
            });
        }
        else {
            console.log('Error in retrieving student list :' + err);
        }
    });
});


function handleValidationError(err, body) {
    for (field in err.errors) {
        switch (err.errors[field].path) {
            case 'name':
                body['nameError'] = err.errors[field].message;
                break;
            case 'email':
                body['emailError'] = err.errors[field].message;
                break;
            default:
                break;
        }
    }
}

router.get('/:id', (req, res) => {
    Student.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.render("students/addOrEdit.hbs", {
                viewTitle: "Update Student Details",
                student: doc
            });
        }
    });
});

router.get('/delete/:id', (req, res) => {
        Student.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.redirect('/students/list');
        }
        else { console.log('Error in student delete :' + err); }
    });
});

module.exports = router;