// app.get('/courses', (req, res) => {
//     res.render("courses/addOrEdit.hbs", {
//         viewTitle: "Insert New Course Details"
//     });
// });

// app.post('/courses', (req, res) => {
// 	course.name = req.body.name();
// 	course.fees = req.body.number();
// 	var url="mongodb://localhost:27017";

// 	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
// 		if(err) throw err;
// 		var dbo=db.db("course_details");
// 		if(req.body._id == ''){
// 			// function insertRecord(req, res) {
// 				var obj={
// 					Course_name: course.name,
// 					Course_fees: course.fees
// 				};
// 				dbo.collection("courses").insert(obj,function(req, data){
// 					if (!err){
// 						res.redirect('/courses/list');
// 					}else{
// 						if (err.name == 'ValidationError') {
// 							handleValidationError(err, req.body);
// 							res.render("courses/addOrEdit.hbs", {
// 								viewTitle: "Insert Course Details",
// 								course: req.body
// 							});
// 						}else{
// 							console.log('Error during record insertion : ' + err);
// 						}
// 					}
// 				});

// 				// course.save((err, doc) => {		
// 				}else{
// 					var dbo=db.db("course_details");
// 					dbo.collection("courses").findOneAndUpdate({ _id: req.body._id }, req.body, { new: true }, (err, doc) => {
// 						if (!err){ res.redirect('/courses/list'); }
// 						else {
// 							if (err.name == 'ValidationError') {
// 								handleValidationError(err, req.body);
// 								res.render("courses/addOrEdit.hbs", {
// 									viewTitle: 'Update Course Details',
// 									course: req.body
// 								});
// 							}
// 							else
// 								console.log('Error during record update : ' + err);
// 						}
// 					});
// 				}

// 	});

//     // if (req.body._id == '')
//     //     insertRecord(req, res);
//     //     else
//     //     updateRecord(req, res);
// });