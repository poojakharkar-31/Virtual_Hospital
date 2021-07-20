//backend file
var express=require("express");
var path=require("path");
var http=require("http");
var bodyParser=require("body-parser");
var MongoClient=require("mongodb").MongoClient;
var cookieParser=require("cookie-parser");
var ObjectId=require("mongodb").ObjectId;
const helpers = require('./helpers');
const multer = require('multer');
var nodemailer=require('nodemailer');
const _ = require('lodash');
const cors = require('cors');
var router = express.Router();
const async = require('async');
var url1 = require('url');
const hbs = require("hbs");
// var NavLink= require('NavLink').react-router-dom;

//import {BrowserRouter} from "react-router-dom";

const partialpath = path.join(__dirname, "/templates/partials");
// require('./models/db');
// const studentController = require('./controllers/studentController')
// const mongoose = require('mongoose');
// const Student = mongoose.model('Student');


var engines = require('consolidate');

var app=express();
var server=http.createServer(app);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.engine('html', engines.swig);

app.set("view engine", "html");
app.set("views", path.join(__dirname, '/templates/views/'));
hbs.registerPartials(path.join(__dirname, "/templates/partials"))

app.set(express.static(path.join(__dirname, ('/public'))));

app.use(cookieParser());

// app.use('/students', studentController);


var email, username, password, mobile, branch, email1, password1, branch1;
var course_name, course_fees, course_id, course_info, student_name, student_email, student_phone, student_branch, student_date;

app.get("/", function(req, res){
	res.sendFile(path.join(__dirname, './templates/views/mainpage.html'));
});

app.get("/course", function(req, res){
	res.sendFile(path.join(__dirname, './templates/views/Course.html'));
});

app.get("/contact", function(req, res){
	res.sendFile(path.join(__dirname, './templates/views/Contact.html'));
});


app.get("/register", function(req, res){
	email = req.body.email;
	username = req.body.username;
	password = req.body.password;
	mobile = req.body.phone;
	
	var userid=req.cookies["userid"];
	if(userid!=null && userid!=""){
		res.redirect("/profile");
	}else{
		res.render("register.ejs", {responseMessage: ''});
	}
});

var email;
// console.log(email)

var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);
console.log(otp);

let transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	service : 'Gmail',

	auth: {
		user: 'pooja.kharkar445@gmail.com',
		pass: 'godisone1',
	}

});

app.post("/register", function(req, res, next){
	email = req.body.email;
	username = req.body.username;
	password = req.body.password;
	mobile = req.body.phone;
	branch = req.body.branch;
	

	var url="mongodb://localhost:27017/";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("class_manager");
		dbo.collection("users").find({email:req.body.email}).toArray((err, data)=>{

			if(_.isEmpty(data)) {
				
     			var mailOptions={
     				to: req.body.email,
     				subject: "Otp for registration is: ",
    				html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otp +"</h1>" // html body
    			};

    			transporter.sendMail(mailOptions, (error, info) => {
    			if (error) {
    				return console.log(error);
    			}
    			console.log('Message sent: %s', info.messageId);   
    			console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    			res.redirect("/otp"); 
    			
    			});


			}else if(data.length!=0){
				res.render("register.ejs", {responseMessage : 'exists'});
				db.close();				
			}else{
				console.log('The search erroded');
			}
		});
	});
});


app.get('/otp', function(req, res){
	res.render("otp.ejs", {responseMessage: ''});
});

app.post('/otp', function(req, res){
	res.redirect("/register");
})

app.get('/verify', function(req, res, next){
	res.render('register.ejs', {responseMessage: ''});
})

app.post('/verify',function(req, res, next){
	var url="mongodb://localhost:27017/";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("class_manager");
		if(req.body.otp==otp){
			var obj={
				username: username,
				email: email,
				password: password,
				mobile: mobile,
				branch: branch
			       		//profilepic: req.file.path
			    };
			dbo.collection("users").insert(obj, function(req, data){
			    console.log(obj);
			    res.render("otp.ejs", {responseMessage : 'success'});
			    db.close();					
			});
		}else{
			res.render("otp.ejs", {responseMessage : 'failed'});
		}
	});

});


app.post('/resend',function(req, res, next){
    var mailOptions={
      	to: email,
    	subject: "Otp for registration is: ",
      	html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otp +"</h1>" // html body
    };
     
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);   
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
       	// res.render('otp', {responseMessage : ''});
       	redirect('/otp');
    });

});



app.get("/login_cm", function(req, res){
	var userid=req.cookies["userid"];
	if(userid!=null && userid!=""){
		res.redirect("/profile");
	}else{
		res.render("login_cm.ejs", {responseMessage: ''});
	}
});

// app.post("/login_cm", function(req, res, next){
// 	var email1 = req.body.email;
// 	var password1 = req.body.password;
// 	var branch1 = req.body.branch;

// 	var url="mongodb://localhost:27017/";

// 	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
// 		if(err) throw err;
// 		var dbo=db.db("class_manager");
// 		// if(branch1=='Thane'){
// 			dbo.collection("users").find({email: email1, password: password1, branch: branch1}).toArray(function(err, data){
// 				console.log(data);
// 				if(data.length!=0){

// 					res.cookie("userid", data[0]._id, {expire: Date.now()+36000});
// 					res.redirect("/profile");
// 					db.close();
// 				}else{
// 				//else show error
// 				res.render("login_cm.ejs", {responseMessage : "wrong"});
// 				db.close();
// 			}
// 		});
// 	});
// });
		

app.post("/login_cm", function(req, res, next){
	var email1 = req.body.email;
	var password1 = req.body.password;
	var branch1 = req.body.branch;

	var url="mongodb://localhost:27017/";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("class_manager");
		if(branch1=='Thane'){
			dbo.collection("users").find({email: email1, password: password1, branch: branch1}).toArray(function(err, data){
			console.log(data);
			if(data.length!=0){

				res.cookie("userid", data[0]._id, {expire: Date.now()+36000});
				res.redirect("/profile");
				db.close();
			}else{
				//else show error
				res.render("login_cm.ejs", {responseMessage : "wrong"});
				db.close();
			}
		});
		}else if(branch1=='Kalwa'){
			dbo.collection("users").find({email: email1, password: password1, branch: branch1}).toArray(function(err, data){
			console.log(data);
			if(data.length!=0){

				res.cookie("userid", data[0]._id, {expire: Date.now()+36000});
				res.redirect("/profile_kalwa");
				db.close();
			}else{
				//else show error
				res.render("login_cm.ejs", {responseMessage : "wrong"});
				db.close();
			}
		});
		}else if(branch1=='Kalyan'){
			dbo.collection("users").find({email: email1, password: password1, branch: branch1}).toArray(function(err, data){
			console.log(data);
			if(data.length!=0){

				res.cookie("userid", data[0]._id, {expire: Date.now()+36000});
				res.redirect("/profile_kalyan");
				db.close();
			}else{
				//else show error
				res.render("login_cm.ejs", {responseMessage : "wrong"});
				db.close();
			}
		});
		}else if(branch1=='Vashi'){
			dbo.collection("users").find({email: email1, password: password1, branch: branch1}).toArray(function(err, data){
			console.log(data);
			if(data.length!=0){

				res.cookie("userid", data[0]._id, {expire: Date.now()+36000});
				res.redirect("/profile_vashi");
				db.close();
			}else{
				//else show error
				res.render("login_cm.ejs", {responseMessage : "wrong"});
				db.close();
			}
		});
		}else if(branch1=='Panvel'){
			dbo.collection("users").find({email: email1, password: password1, branch: branch1}).toArray(function(err, data){
			console.log(data);
			if(data.length!=0){

				res.cookie("userid", data[0]._id, {expire: Date.now()+36000});
				res.redirect("/profile_panvel");
				db.close();
			}else{
				//else show error
				res.render("login_cm.ejs", {responseMessage : "wrong"});
				db.close();
			}
		});
		}
		// else if(branch1=='Mulund'){
		// 	dbo.collection("users").find({email: email1, password: password1, branch: branch1}).toArray(function(err, data){
		// 	console.log(data);
		// 	if(data.length!=0){

		// 		res.cookie("userid", data[0]._id, {expire: Date.now()+36000});
		// 		res.redirect("/profile");
		// 		db.close();
		// 	}else{
		// 		//else show error
		// 		res.render("login_cm.ejs", {responseMessage : "wrong"});
		// 		db.close();
		// 	}
		// });
		// }
		
	});
});

app.get("/profile", function(req, res, next){
	var userid=req.cookies["userid"];
	if(userid==null || userid==""){
		res.redirect("/login_cm");
	}else{
		//else get the cookie information and fetch data from databased
		var url="mongodb://localhost:27017";

		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("class_manager");
			dbo.collection("users").find({_id: ObjectId(userid)}).toArray(function(err, data){
				var username=data[0].username;
				var email=data[0].email;
				var password=data[0].password;
				var mobile=data[0].mobile;
				var branch=data[0].branch;
				//var image=data[0].profilepic;
				res.render('profile.ejs', {username: username, email: email, password: password, mobile: mobile, branch: branch});
				db.close();
			});
		});		
	}
});

app.get("/profile_kalwa", function(req, res, next){
	var userid=req.cookies["userid"];
	if(userid==null || userid==""){
		res.redirect("/login_cm");
	}else{
		//else get the cookie information and fetch data from databased
		var url="mongodb://localhost:27017";

		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("class_manager");
			dbo.collection("users").find({_id: ObjectId(userid)}).toArray(function(err, data){
				var username=data[0].username;
				var email=data[0].email;
				var password=data[0].password;
				var mobile=data[0].mobile;
				var branch=data[0].branch;
				//var image=data[0].profilepic;
				res.render('profile_kalwa.ejs', {username: username, email: email, password: password, mobile: mobile, branch: branch});
				db.close();
			});
		});		
	}
});

app.get("/profile_kalyan", function(req, res, next){
	var userid=req.cookies["userid"];
	if(userid==null || userid==""){
		res.redirect("/login_cm");
	}else{
		//else get the cookie information and fetch data from databased
		var url="mongodb://localhost:27017";

		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("class_manager");
			dbo.collection("users").find({_id: ObjectId(userid)}).toArray(function(err, data){
				var username=data[0].username;
				var email=data[0].email;
				var password=data[0].password;
				var mobile=data[0].mobile;
				var branch=data[0].branch;
				//var image=data[0].profilepic;
				res.render('profile_kalyan.ejs', {username: username, email: email, password: password, mobile: mobile, branch: branch});
				db.close();
			});
		});		
	}
});

app.get("/profile_vashi", function(req, res, next){
	var userid=req.cookies["userid"];
	if(userid==null || userid==""){
		res.redirect("/login_cm");
	}else{
		//else get the cookie information and fetch data from databased
		var url="mongodb://localhost:27017";

		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("class_manager");
			dbo.collection("users").find({_id: ObjectId(userid)}).toArray(function(err, data){
				var username=data[0].username;
				var email=data[0].email;
				var password=data[0].password;
				var mobile=data[0].mobile;
				var branch=data[0].branch;
				//var image=data[0].profilepic;
				res.render('profile_vashi.ejs', {username: username, email: email, password: password, mobile: mobile, branch: branch});
				db.close();
			});
		});		
	}
});

app.get("/profile_panvel", function(req, res, next){
	var userid=req.cookies["userid"];
	if(userid==null || userid==""){
		res.redirect("/login_cm");
	}else{
		//else get the cookie information and fetch data from databased
		var url="mongodb://localhost:27017";

		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("class_manager");
			dbo.collection("users").find({_id: ObjectId(userid)}).toArray(function(err, data){
				var username=data[0].username;
				var email=data[0].email;
				var password=data[0].password;
				var mobile=data[0].mobile;
				var branch=data[0].branch;
				//var image=data[0].profilepic;
				res.render('profile_panvel.ejs', {username: username, email: email, password: password, mobile: mobile, branch: branch});
				db.close();
			});
		});		
	}
});

app.get("/forgot_password", function(req, res){
	var userid=req.cookies["userid"];
	if(userid!=null && userid!=""){
		res.redirect("/profile");
	}else{
		res.render("forgot_password.ejs", {responseMessage: ''});
	}
});

app.post("/forgot_password", function(req, res, next){
	var url="mongodb://localhost:27017/";
	var email2=req.body.email2;

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("class_manager");
		dbo.collection("users").find({email:email2}).forEach(function(document) {
			//console.log(document.password);
			
			if(document.email!=0){
				//

				var mailOptions={
     				to: email2,
     				subject: "Password for Portion Tracker ",
    				html: "<h3>Your password Portion Tracker account is: </h3>"  + "<h1 style='font-weight:bold;'>" + document.password +"</h1>" // html body
    			};

    			transporter.sendMail(mailOptions, (error, info) => {
    			if (error) {
    				return console.log(error);
    			}
    			console.log('Message sent: %s', info.messageId);   
    			console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    			res.render("forgot_password.ejs", {responseMessage : 'success'});
    			
    			});

			}
		});	
	});
});

app.get("/login_admin", function(req, res){
	var userid=req.cookies["userid"];
	if(userid!=null && userid!=""){
		res.redirect("/profile");
	}else{
		res.render("login_admin.ejs");
	}
});

app.post("/login_admin", function(req, res, next){
	email_admin=req.body.email;
	console.log(email_admin);
	password_admin=req.body.password;

	if(email_admin == 'admin@gmail.com'){
		if(password_admin == 'adminLec'){
			res.render('admin_home.hbs')
			// res.send("<h1>You have succesfully logged In</h1>");
		// }else{
		// 	res.render('login_admin.ejs', {responseMessage : 'wrong'});
		}
	}

});

//////////////////////ADMIN THANE///////////////////////////////////////////////

app.get("/Thane", function(req, res){
	var url="mongodb://localhost:27017/";
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		var dbo1=db.db("teacher_details")
		dbo.collection("students").find().toArray(function(err, docs){
				dbo1.collection("teachers").find().toArray(function(err, teacherdocs){
					res.render("adminpages/Thane.hbs", {
					list_student: docs,
					list_teacher: teacherdocs
				})
				
			});
			// }else {
			// 	console.log('Error in retrieving teachers list :' + err)
		});
	});
});

app.post("/filterlecturedetails", function(req, res){
	var url="mongodb://localhost:27017";
	let studentname = req.body.student;
	let teachername = req.body.teacher;

	if(studentname=="" && teachername=="")
	{
		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("students_details");
			var dbo1=db.db("teacher_details");
			var dbo2=db.db("lecture_details");
			dbo.collection("students").find().toArray(function(err, docs){
				dbo1.collection("teachers").find().toArray(function(err, teacherdocs){
					dbo2.collection("lectures").find().toArray(function(err, studentdata){
						res.render("adminpages/Thane_lecdetails.hbs", {
							list_student: docs,
							list_teacher: teacherdocs,
							list_lectureinfo: studentdata 
						});
					});
				});
			});
		});
	}


	if(studentname!="" && teachername=="")
	{
		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("students_details");
			var dbo1=db.db("teacher_details");
			var dbo2=db.db("lecture_details");
			dbo.collection("students").find().toArray(function(err, docs){
				dbo1.collection("teachers").find().toArray(function(err, teacherdocs){
					dbo2.collection("lectures").find({Student_name: studentname}).toArray(function(err, studentdata){
						if (err) throw err;
						else
						{
							res.render("adminpages/Thane_lecdetails.hbs",{list_student: docs, list_teacher: teacherdocs, list_lectureinfo:studentdata });
						}
					});
				});
			});
		});
	}

	if(studentname=="" && teachername!="")
	{
		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("students_details");
			var dbo1=db.db("teacher_details");
			var dbo2=db.db("lecture_details");
			dbo.collection("students").find().toArray(function(err, docs){
				dbo1.collection("teachers").find().toArray(function(err, teacherdocs){
					dbo2.collection("lectures").find({Teacher_name: teachername}).toArray(function(err, teacherdata){
						if (err) throw err;
						else
						{
							res.render("adminpages/Thane_lecdetails.hbs",{ list_student: docs, list_teacher: teacherdocs, list_lectureinfo:teacherdata});
						}
					});
				});
			});
		});
	}

	if(studentname!="" && teachername!="")
	{
		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("students_details");
			var dbo1=db.db("teacher_details");
			var dbo2=db.db("lecture_details");
			dbo.collection("students").find().toArray(function(err, docs){
				dbo1.collection("teachers").find().toArray(function(err, teacherdocs){
					dbo2.collection("lectures").find({Teacher_name: teachername, Student_name: studentname}).toArray(function(err, data){
						if (err) throw err;
						else
						{
							res.render("adminpages/Thane_lecdetails.hbs",{ list_student: docs, list_teacher: teacherdocs, list_lectureinfo:data});
						}
					});
				});
			});
		});
	}
})

//////////////////////////////////////////ADMIN KALWA///////////////////////////////////////////////////

app.get("/Kalwa", function(req, res){
	var url="mongodb://localhost:27017/";
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		var dbo1=db.db("teacher_details")
		dbo.collection("students_kalwa").find().toArray(function(err, docs){
				dbo1.collection("teachers_kalwa").find().toArray(function(err, teacherdocs){
					res.render("adminpages/Kalwa.hbs", {
					list_student: docs,
					list_teacher: teacherdocs
				})
				
			});
			// }else {
			// 	console.log('Error in retrieving teachers list :' + err)
		});
	});
});

app.post("/filterlecturedetails_kalwa", function(req, res){
	var url="mongodb://localhost:27017";
	let studentname = req.body.student;
	let teachername = req.body.teacher;
	if(studentname=="" && teachername=="")
	{
		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("students_details");
			var dbo1=db.db("teacher_details");
			var dbo2=db.db("lecture_details");
			dbo.collection("students_kalwa").find().toArray(function(err, docs){
				dbo1.collection("teachers_kalwa").find().toArray(function(err, teacherdocs){
					dbo2.collection("lectures_kalwa").find().toArray(function(err, studentdata){
						res.render("adminpages/Kalwa_lecdetails.hbs", {
							list_student: docs,
							list_teacher: teacherdocs,
							list_lectureinfo: studentdata 
						});
					});
				});
			});
		});
	}


	if(studentname!="" && teachername=="")
	{
		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("students_details");
			var dbo1=db.db("teacher_details");
			var dbo2=db.db("lecture_details");
			dbo.collection("students_kalwa").find().toArray(function(err, docs){
				dbo1.collection("teachers_kalwa").find().toArray(function(err, teacherdocs){
					dbo2.collection("lectures_kalwa").find({Student_name: studentname}).toArray(function(err, studentdata){
						if (err) throw err;
						else
						{
							res.render("adminpages/Kalwa_lecdetails.hbs",{list_student: docs, list_teacher: teacherdocs, list_lectureinfo:studentdata });
						}
					});
				});
			});
		});
	}

	if(studentname=="" && teachername!="")
	{
		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("students_details");
			var dbo1=db.db("teacher_details");
			var dbo2=db.db("lecture_details");
			dbo.collection("students_kalwa").find().toArray(function(err, docs){
				dbo1.collection("teachers_kalwa").find().toArray(function(err, teacherdocs){
					dbo2.collection("lectures_kalwa").find({Teacher_name: teachername}).toArray(function(err, teacherdata){
						if (err) throw err;
						else
						{
							res.render("adminpages/Kalwa_lecdetails.hbs",{ list_student: docs, list_teacher: teacherdocs, list_lectureinfo:teacherdata});
						}
					});
				});
			});
		});
	}

	if(studentname!="" && teachername!="")
	{
		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("students_details");
			var dbo1=db.db("teacher_details");
			var dbo2=db.db("lecture_details");
			dbo.collection("students_kalwa").find().toArray(function(err, docs){
				dbo1.collection("teachers_kalwa").find().toArray(function(err, teacherdocs){
					dbo2.collection("lectures_kalwa").find({Teacher_name: teachername, Student_name: studentname}).toArray(function(err, data){
						if (err) throw err;
						else
						{
							res.render("adminpages/Kalwa_lecdetails.hbs",{ list_student: docs, list_teacher: teacherdocs, list_lectureinfo:data});
						}
					});
				});
			});
		});
	}
})

////////////////////////////ADMIN KALYAN//////////////////////////////////////////////////

app.get("/Kalyan", function(req, res){
	var url="mongodb://localhost:27017/";
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		var dbo1=db.db("teacher_details")
		dbo.collection("students_kalyan").find().toArray(function(err, docs){
				dbo1.collection("teachers_kalyan").find().toArray(function(err, teacherdocs){
					res.render("adminpages/Kalyan.hbs", {
					list_student: docs,
					list_teacher: teacherdocs
				})
				
			});
			// }else {
			// 	console.log('Error in retrieving teachers list :' + err)
		});
	});
});

app.post("/filterlecturedetails_kalyan", function(req, res){
	var url="mongodb://localhost:27017";
	let studentname = req.body.student;
	let teachername = req.body.teacher;

	if(studentname=="" && teachername=="")
	{
		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("students_details");
			var dbo1=db.db("teacher_details");
			var dbo2=db.db("lecture_details");
			dbo.collection("students_kalyan").find().toArray(function(err, docs){
				dbo1.collection("teachers_kalyan").find().toArray(function(err, teacherdocs){
					dbo2.collection("lectures_kalyan").find().toArray(function(err, studentdata){
						res.render("adminpages/Kalyan_lecdetails.hbs", {
							list_student: docs,
							list_teacher: teacherdocs,
							list_lectureinfo: studentdata 
						});
					});
				});
			});
		});
	}


	if(studentname!="" && teachername=="")
	{
		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("students_details");
			var dbo1=db.db("teacher_details");
			var dbo2=db.db("lecture_details");
			dbo.collection("students_kalyan").find().toArray(function(err, docs){
				dbo1.collection("teachers_kalyan").find().toArray(function(err, teacherdocs){
					dbo2.collection("lectures_kalyan").find({Student_name: studentname}).toArray(function(err, studentdata){
						if (err) throw err;
						else
						{
							res.render("adminpages/Kalyan_lecdetails.hbs",{list_student: docs, list_teacher: teacherdocs, list_lectureinfo:studentdata });
						}
					});
				});
			});
		});
	}

	if(studentname=="" && teachername!="")
	{
		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("students_details");
			var dbo1=db.db("teacher_details");
			var dbo2=db.db("lecture_details");
			dbo.collection("students_kalyan").find().toArray(function(err, docs){
				dbo1.collection("teachers_kalyan").find().toArray(function(err, teacherdocs){
					dbo2.collection("lectures_kalyan").find({Teacher_name: teachername}).toArray(function(err, teacherdata){
						if (err) throw err;
						else
						{
							res.render("adminpages/Kalyan_lecdetails.hbs",{ list_student: docs, list_teacher: teacherdocs, list_lectureinfo:teacherdata});
						}
					});
				});
			});
		});
	}

	if(studentname!="" && teachername!="")
	{
		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("students_details");
			var dbo1=db.db("teacher_details");
			var dbo2=db.db("lecture_details");
			dbo.collection("students_kalyan").find().toArray(function(err, docs){
				dbo1.collection("teachers_kalyan").find().toArray(function(err, teacherdocs){
					dbo2.collection("lectures_kalyan").find({Teacher_name: teachername, Student_name: studentname}).toArray(function(err, data){
						if (err) throw err;
						else
						{
							res.render("adminpages/Kalyan_lecdetails.hbs",{ list_student: docs, list_teacher: teacherdocs, list_lectureinfo:data});
						}
					});
				});
			});
		});
	}
})

////////////////////////////////ADMIN VASHI///////////////////////////////////////

app.get("/Vashi", function(req, res){
	var url="mongodb://localhost:27017/";
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		var dbo1=db.db("teacher_details")
		dbo.collection("students_vashi").find().toArray(function(err, docs){
				dbo1.collection("teachers_vashi").find().toArray(function(err, teacherdocs){
					res.render("adminpages/Vashi.hbs", {
					list_student: docs,
					list_teacher: teacherdocs
				})
				
			});
			// }else {
			// 	console.log('Error in retrieving teachers list :' + err)
		});
	});
});

app.post("/filterlecturedetails_vashi", function(req, res){
	var url="mongodb://localhost:27017";
	let studentname = req.body.student;
	let teachername = req.body.teacher;

	if(studentname=="" && teachername=="")
	{
		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("students_details");
			var dbo1=db.db("teacher_details");
			var dbo2=db.db("lecture_details");
			dbo.collection("students_vashi").find().toArray(function(err, docs){
				dbo1.collection("teachers_vashi").find().toArray(function(err, teacherdocs){
					dbo2.collection("lectures_vashi").find().toArray(function(err, studentdata){
						res.render("adminpages/Vashi_lecdetails.hbs", {
							list_student: docs,
							list_teacher: teacherdocs,
							list_lectureinfo: studentdata 
						});
					});
				});
			});
		});
	}

	if(studentname!="" && teachername=="")
	{
		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("students_details");
			var dbo1=db.db("teacher_details");
			var dbo2=db.db("lecture_details");
			dbo.collection("students_vashi").find().toArray(function(err, docs){
				dbo1.collection("teachers_vashi").find().toArray(function(err, teacherdocs){
					dbo2.collection("lectures_vashi").find({Student_name: studentname}).toArray(function(err, studentdata){
						if (err) throw err;
						else
						{
							res.render("adminpages/Vashi_lecdetails.hbs",{list_student: docs, list_teacher: teacherdocs, list_lectureinfo:studentdata });
						}
					});
				});
			});
		});
	}

	if(studentname=="" && teachername!="")
	{
		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("students_details");
			var dbo1=db.db("teacher_details");
			var dbo2=db.db("lecture_details");
			dbo.collection("students_vashi").find().toArray(function(err, docs){
				dbo1.collection("teachers_vashi").find().toArray(function(err, teacherdocs){
					dbo2.collection("lectures_vashi").find({Teacher_name: teachername}).toArray(function(err, teacherdata){
						if (err) throw err;
						else
						{
							res.render("adminpages/Vashi_lecdetails.hbs",{ list_student: docs, list_teacher: teacherdocs, list_lectureinfo:teacherdata});
						}
					});
				});
			});
		});
	}

	if(studentname!="" && teachername!="")
	{
		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("students_details");
			var dbo1=db.db("teacher_details");
			var dbo2=db.db("lecture_details");
			dbo.collection("students_vashi").find().toArray(function(err, docs){
				dbo1.collection("teachers_vashi").find().toArray(function(err, teacherdocs){
					dbo2.collection("lectures_vashi").find({Teacher_name: teachername, Student_name: studentname}).toArray(function(err, data){
						if (err) throw err;
						else
						{
							res.render("adminpages/Vashi_lecdetails.hbs",{ list_student: docs, list_teacher: teacherdocs, list_lectureinfo:data});
						}
					});
				});
			});
		});
	}
})

/////////////////////////////////////ADMIN PANVEL//////////////////////////////////

app.get("/Panvel", function(req, res){
	var url="mongodb://localhost:27017/";
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		var dbo1=db.db("teacher_details")
		dbo.collection("students_panvel").find().toArray(function(err, docs){
				dbo1.collection("teachers_panvel").find().toArray(function(err, teacherdocs){
					res.render("adminpages/Panvel.hbs", {
					list_student: docs,
					list_teacher: teacherdocs
				})
				
			});
			// }else {
			// 	console.log('Error in retrieving teachers list :' + err)
		});
	});
});

app.post("/filterlecturedetails_panvel", function(req, res){
	var url="mongodb://localhost:27017";
	let studentname = req.body.student;
	let teachername = req.body.teacher;

	if(studentname=="" && teachername=="")
	{
		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("students_details");
			var dbo1=db.db("teacher_details");
			var dbo2=db.db("lecture_details");
			dbo.collection("students_panvel").find().toArray(function(err, docs){
				dbo1.collection("teachers_panvel").find().toArray(function(err, teacherdocs){
					dbo2.collection("lectures_panvel").find().toArray(function(err, studentdata){
						res.render("adminpages/Panvel_lecdetails.hbs", {
							list_student: docs,
							list_teacher: teacherdocs,
							list_lectureinfo: studentdata 
						});
					});
				});
			});
		});
	}
	
	if(studentname!="" && teachername=="")
	{
		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("students_details");
			var dbo1=db.db("teacher_details");
			var dbo2=db.db("lecture_details");
			dbo.collection("students_panvel").find().toArray(function(err, docs){
				dbo1.collection("teachers_panvel").find().toArray(function(err, teacherdocs){
					dbo2.collection("lectures_panvel").find({Student_name: studentname}).toArray(function(err, studentdata){
						if (err) throw err;
						else
						{
							res.render("adminpages/Panvel_lecdetails.hbs",{list_student: docs, list_teacher: teacherdocs, list_lectureinfo:studentdata });
						}
					});
				});
			});
		});
	}

	if(studentname=="" && teachername!="")
	{
		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("students_details");
			var dbo1=db.db("teacher_details");
			var dbo2=db.db("lecture_details");
			dbo.collection("students_panvel").find().toArray(function(err, docs){
				dbo1.collection("teachers_panvel").find().toArray(function(err, teacherdocs){
					dbo2.collection("lectures_panvel").find({Teacher_name: teachername}).toArray(function(err, teacherdata){
						if (err) throw err;
						else
						{
							res.render("adminpages/Panvel_lecdetails.hbs",{ list_student: docs, list_teacher: teacherdocs, list_lectureinfo:teacherdata});
						}
					});
				});
			});
		});
	}

	if(studentname!="" && teachername!="")
	{
		MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
			if(err) throw err;
			var dbo=db.db("students_details");
			var dbo1=db.db("teacher_details");
			var dbo2=db.db("lecture_details");
			dbo.collection("students_panvel").find().toArray(function(err, docs){
				dbo1.collection("teachers_panvel").find().toArray(function(err, teacherdocs){
					dbo2.collection("lectures_panvel").find({Teacher_name: teachername, Student_name: studentname}).toArray(function(err, data){
						if (err) throw err;
						else
						{
							res.render("adminpages/Panvel_lecdetails.hbs",{ list_student: docs, list_teacher: teacherdocs, list_lectureinfo:data});
						}
					});
				});
			});
		});
	}
})





app.get("/logout", function(req, res){
	res.clearCookie("userid");
	res.redirect("/login_cm");
});

app.get('/students', (req, res) => {
    res.render("students/addOrEdit.hbs", {
        viewTitle: "Insert Student"
    });
});

app.post('/students', (req, res) => {
	var student_name = req.body.name;
	var student_email = req.body.email;
	var student_phone = req.body.number;
	var student_branch = req.body.branch;
	var student_date = req.body.date;
	var url="mongodb://localhost:27017/";
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		if(req.body._id == ''){
			// function insertRecord(req, res) {
				var obj={
					name: req.body.name ,
					email: req.body.email,
					phone: req.body.phone,
					branch: req.body.branch,
					date: req.body.date
				};
				dbo.collection("students").insert(obj, function(req, data){
					if (!err){
						res.redirect('/list');
					}else{
						if (err.name == 'ValidationError') {
							handleValidationError(err, req.body);
							res.render("students/addOrEdit.hbs", {
								viewTitle: "Insert Student",
								student: req.body
							});
						}else{
							console.log('Error during record insertion : ' + err);
						}
					}
				});
		}
	});
});

	// MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
	// 	if(err) throw err;
	// 	var dbo=db.db("students");
	// 	if (req.body._id == '')
	// 		insertRecord(req, res);
	// 	else
	// 		updateRecord(req, res);
	// });

app.get('/students_kalwa', (req, res) => {
    res.render("students/add_kalwa.hbs", {
        viewTitle: "Insert Student"
    });
});

app.post('/students_kalwa', (req, res) => {
	var student_name = req.body.name;
	var student_email = req.body.email;
	var student_phone = req.body.number;
	var student_branch = req.body.branch;
	var student_date = req.body.date;
	var url="mongodb://localhost:27017/";
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		if(req.body._id == ''){
			// function insertRecord(req, res) {
				var obj={
					name: req.body.name ,
					email: req.body.email,
					phone: req.body.phone,
					branch: req.body.branch,
					date: req.body.date
				};
				dbo.collection("students_kalwa").insert(obj, function(req, data){
					if (!err){
						res.redirect('/list_kalwa');
					}else{
						if (err.name == 'ValidationError') {
							handleValidationError(err, req.body);
							res.render("students/add_kalwa.hbs", {
								viewTitle: "Insert Student",
								student: req.body
							});
						}else{
							console.log('Error during record insertion : ' + err);
						}
					}
				});
		}
	});
});

app.get('/students_kalyan', (req, res) => {
    res.render("students/add_kalyan.hbs", {
        viewTitle: "Insert Student"
    });
});

app.post('/students_kalyan', (req, res) => {
	var student_name = req.body.name;
	var student_email = req.body.email;
	var student_phone = req.body.number;
	var student_branch = req.body.branch;
	var student_date = req.body.date;
	var url="mongodb://localhost:27017/";
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		if(req.body._id == ''){
			// function insertRecord(req, res) {
				var obj={
					name: req.body.name ,
					email: req.body.email,
					phone: req.body.phone,
					branch: req.body.branch,
					date: req.body.date
				};
				dbo.collection("students_kalyan").insert(obj, function(req, data){
					if (!err){
						res.redirect('/list_kalyan');
					}else{
						if (err.name == 'ValidationError') {
							handleValidationError(err, req.body);
							res.render("students/add_kalyan.hbs", {
								viewTitle: "Insert Student",
								student: req.body
							});
						}else{
							console.log('Error during record insertion : ' + err);
						}
					}
				});
		}
	});
});

app.get('/students_vashi', (req, res) => {
    res.render("students/add_vashi.hbs", {
        viewTitle: "Insert Student"
    });
});

app.post('/students_vashi', (req, res) => {
	var student_name = req.body.name;
	var student_email = req.body.email;
	var student_phone = req.body.number;
	var student_branch = req.body.branch;
	var student_date = req.body.date;
	var url="mongodb://localhost:27017/";
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		if(req.body._id == ''){
			// function insertRecord(req, res) {
				var obj={
					name: req.body.name ,
					email: req.body.email,
					phone: req.body.phone,
					branch: req.body.branch,
					date: req.body.date
				};
				dbo.collection("students_vashi").insert(obj, function(req, data){
					if (!err){
						res.redirect('/list_vashi');
					}else{
						if (err.name == 'ValidationError') {
							handleValidationError(err, req.body);
							res.render("students/add_vashi.hbs", {
								viewTitle: "Insert Student",
								student: req.body
							});
						}else{
							console.log('Error during record insertion : ' + err);
						}
					}
				});
		}
	});
});

app.get('/students_panvel', (req, res) => {
    res.render("students/add_panvel.hbs", {
        viewTitle: "Insert Student"
    });
});

app.post('/students_panvel', (req, res) => {
	var student_name = req.body.name;
	var student_email = req.body.email;
	var student_phone = req.body.number;
	var student_branch = req.body.branch;
	var student_date = req.body.date;
	var url="mongodb://localhost:27017/";
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		if(req.body._id == ''){
			// function insertRecord(req, res) {
				var obj={
					name: req.body.name ,
					email: req.body.email,
					phone: req.body.phone,
					branch: req.body.branch,
					date: req.body.date
				};
				dbo.collection("students_panvel").insert(obj, function(req, data){
					if (!err){
						res.redirect('/list_panvel');
					}else{
						if (err.name == 'ValidationError') {
							handleValidationError(err, req.body);
							res.render("students/add_panvel.hbs", {
								viewTitle: "Insert Student",
								student: req.body
							});
						}else{
							console.log('Error during record insertion : ' + err);
						}
					}
				});
		}
	});
});

app.get('/courses', (req, res) => {
    res.render("courses/addOrEdit_course.hbs", {
        viewTitle: "Insert Course Details"
    });
});

app.post('/courses', (req, res) => {
	var course_name = req.body.name;
	var course_fees = req.body.number;
	var chapter1 = req.body.chapter1;
	var chapter2 = req.body.chapter2;
	var chapter3 = req.body.chapter3;
	var chapter4 = req.body.chapter4;
	var chapter5 = req.body.chapter5;
	var chapter6 = req.body.chapter6;
	var course_id = req.body._id;
	var course_info = req.body;
	console.log(course_info);
	var url="mongodb://localhost:27017/";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		if(req.body._id == ''){
			// function insertRecord(req, res) {
				var obj={
					Course_name: course_name,
					Course_fees: course_fees,
					Chapter_1: chapter1,
					Chapter_2: chapter2,
					Chapter_3: chapter3,
					Chapter_4: chapter4,
					Chapter_5: chapter5,
					Chapter_6: chapter6
				};
				dbo.collection("courses").insert(obj, function(req, data){
					if (!err){
						res.redirect('/list_course');
					}else{
						if (err.name == 'ValidationError') {
							handle1ValidationError(err, req.body);
							res.render("courses/addOrEdit_course.hbs", {
								viewTitle: "Insert Course Details",
								course: req.body
							});
						}else{
							console.log('Error during record insertion : ' + err);
						}
					}
				});
		}
	});

    // if (req.body._id == '')
    //     insertRecord(req, res);
    //     else
    //     updateRecord(req, res);
});

app.get('/courses_kalwa', (req, res) => {
    res.render("courses/add_coursekalwa.hbs", {
        viewTitle: "Insert Course Details"
    });
});

app.post('/courses_kalwa', (req, res) => {
	var course_name = req.body.name;
	var course_fees = req.body.number;
	var chapter1 = req.body.chapter1;
	var chapter2 = req.body.chapter2;
	var chapter3 = req.body.chapter3;
	var chapter4 = req.body.chapter4;
	var chapter5 = req.body.chapter5;
	var chapter6 = req.body.chapter6;
	var course_id = req.body._id;
	var course_info = req.body;
	console.log(course_info);
	var url="mongodb://localhost:27017/";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		if(req.body._id == ''){
			// function insertRecord(req, res) {
				var obj={
					Course_name: course_name,
					Course_fees: course_fees,
					Chapter_1: chapter1,
					Chapter_2: chapter2,
					Chapter_3: chapter3,
					Chapter_4: chapter4,
					Chapter_5: chapter5,
					Chapter_6: chapter6
				};
				dbo.collection("courses").insert(obj, function(req, data){
					if (!err){
						res.redirect('/list_coursekalwa');
					}else{
						if (err.name == 'ValidationError') {
							handle1ValidationError(err, req.body);
							res.render("courses/add_coursekalwa.hbs", {
								viewTitle: "Insert Course Details",
								course: req.body
							});
						}else{
							console.log('Error during record insertion : ' + err);
						}
					}
				});
		}
	});
});

app.get('/courses_kalyan', (req, res) => {
    res.render("courses/add_coursekalyan.hbs", {
        viewTitle: "Insert Course Details"
    });
});

app.post('/courses_kalyan', (req, res) => {
	var course_name = req.body.name;
	var course_fees = req.body.number;
	var chapter1 = req.body.chapter1;
	var chapter2 = req.body.chapter2;
	var chapter3 = req.body.chapter3;
	var chapter4 = req.body.chapter4;
	var chapter5 = req.body.chapter5;
	var chapter6 = req.body.chapter6;
	var course_id = req.body._id;
	var course_info = req.body;
	console.log(course_info);
	var url="mongodb://localhost:27017/";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		if(req.body._id == ''){
			// function insertRecord(req, res) {
				var obj={
					Course_name: course_name,
					Course_fees: course_fees,
					Chapter_1: chapter1,
					Chapter_2: chapter2,
					Chapter_3: chapter3,
					Chapter_4: chapter4,
					Chapter_5: chapter5,
					Chapter_6: chapter6
				};
				dbo.collection("courses").insert(obj, function(req, data){
					if (!err){
						res.redirect('/list_coursekalyan');
					}else{
						if (err.name == 'ValidationError') {
							handle1ValidationError(err, req.body);
							res.render("courses/add_coursekalyan.hbs", {
								viewTitle: "Insert Course Details",
								course: req.body
							});
						}else{
							console.log('Error during record insertion : ' + err);
						}
					}
				});
		}
	});
});

app.get('/courses_panvel', (req, res) => {
    res.render("courses/add_coursepanvel.hbs", {
        viewTitle: "Insert Course Details"
    });
});

app.post('/courses_panvel', (req, res) => {
	var course_name = req.body.name;
	var course_fees = req.body.number;
	var chapter1 = req.body.chapter1;
	var chapter2 = req.body.chapter2;
	var chapter3 = req.body.chapter3;
	var chapter4 = req.body.chapter4;
	var chapter5 = req.body.chapter5;
	var chapter6 = req.body.chapter6;
	var course_id = req.body._id;
	var course_info = req.body;
	console.log(course_info);
	var url="mongodb://localhost:27017/";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		if(req.body._id == ''){
			// function insertRecord(req, res) {
				var obj={
					Course_name: course_name,
					Course_fees: course_fees,
					Chapter_1: chapter1,
					Chapter_2: chapter2,
					Chapter_3: chapter3,
					Chapter_4: chapter4,
					Chapter_5: chapter5,
					Chapter_6: chapter6
				};
				dbo.collection("courses").insert(obj, function(req, data){
					if (!err){
						res.redirect('/list_coursepanvel');
					}else{
						if (err.name == 'ValidationError') {
							handle1ValidationError(err, req.body);
							res.render("courses/add_coursepanvel.hbs", {
								viewTitle: "Insert Course Details",
								course: req.body
							});
						}else{
							console.log('Error during record insertion : ' + err);
						}
					}
				});
		}
	});
});

app.get('/courses_vashi', (req, res) => {
    res.render("courses/add_coursevashi.hbs", {
        viewTitle: "Insert Course Details"
    });
});

app.post('/courses_vashi', (req, res) => {
	var course_name = req.body.name;
	var course_fees = req.body.number;
	var chapter1 = req.body.chapter1;
	var chapter2 = req.body.chapter2;
	var chapter3 = req.body.chapter3;
	var chapter4 = req.body.chapter4;
	var chapter5 = req.body.chapter5;
	var chapter6 = req.body.chapter6;
	var course_id = req.body._id;
	var course_info = req.body;
	console.log(course_info);
	var url="mongodb://localhost:27017/";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		if(req.body._id == ''){
			// function insertRecord(req, res) {
				var obj={
					Course_name: course_name,
					Course_fees: course_fees,
					Chapter_1: chapter1,
					Chapter_2: chapter2,
					Chapter_3: chapter3,
					Chapter_4: chapter4,
					Chapter_5: chapter5,
					Chapter_6: chapter6
				};
				dbo.collection("courses").insert(obj, function(req, data){
					if (!err){
						res.redirect('/list_coursevashi');
					}else{
						if (err.name == 'ValidationError') {
							handle1ValidationError(err, req.body);
							res.render("courses/add_coursevashi.hbs", {
								viewTitle: "Insert Course Details",
								course: req.body
							});
						}else{
							console.log('Error during record insertion : ' + err);
						}
					}
				});
		}
	});
});




app.get('/list_course', (req, res) => {
	course_name = course_name;
	course_fees = course_fees;
	
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		dbo.collection("courses").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("courses/list_course.hbs", {
					list_course: docs
			});
			}else {
				console.log('Error in retrieving course list :' + err);
			}
		});
	});
});

app.get('/list_coursekalwa', (req, res) => {
	course_name = course_name;
	course_fees = course_fees;
	
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		dbo.collection("courses").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("courses/list_coursekalwa.hbs", {
					list_course: docs
			});
			}else {
				console.log('Error in retrieving course list :' + err);
			}
		});
	});
});

app.get('/list_coursekalyan', (req, res) => {
	course_name = course_name;
	course_fees = course_fees;
	
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		dbo.collection("courses").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("courses/list_coursekalyan.hbs", {
					list_course: docs
			});
			}else {
				console.log('Error in retrieving course list :' + err);
			}
		});
	});
});

app.get('/list_coursepanvel', (req, res) => {
	course_name = course_name;
	course_fees = course_fees;
	
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		dbo.collection("courses").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("courses/list_coursepanvel.hbs", {
					list_course: docs
			});
			}else {
				console.log('Error in retrieving course list :' + err);
			}
		});
	});
});

app.get('/list_coursevashi', (req, res) => {
	course_name = course_name;
	course_fees = course_fees;
	
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		dbo.collection("courses").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("courses/list_coursevashi.hbs", {
					list_course: docs
			});
			}else {
				console.log('Error in retrieving course list :' + err);
			}
		});
	});
});



// function insertRecord(req, res) {
//     var student = new Student();
//     student.name = req.body.name;
//     student.email = req.body.email;
//     student.phone = req.body.phone;
//     student.branch = req.body.branch;
//     student.date = req.body.date;
//     student.save((err, doc) => {
//         if (!err)
//             res.redirect('students/list');
//         else {
//             if (err.name == 'ValidationError') {
//                 handleValidationError(err, req.body);
//                 res.render("students/addOrEdit.hbs", {
//                     viewTitle: "Insert Student Details",
//                     student: req.body
//                 });
//             }
//             else
//                 console.log('Error during record insertion : ' + err);
//         }
//     });
// }

// function updateRecord(req, res) {
//     Student.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true }, (err, doc) => {
//     // dbo.collection("students").findOneAndUpdate({ _id: req.body._id }, req.body, { new: true }, (err, doc) => {
//         if (!err) { res.redirect('students/list'); }
//         else {
//             if (err.name == 'ValidationError') {
//                 handleValidationError(err, req.body);
//                 res.render("students/addOrEdit.hbs", {
//                     viewTitle: 'Update Student Details',
//                     student: req.body
//                 });
//             }
//             else
//                 console.log('Error during record update : ' + err);
//         }
//     });
// }


app.get('/list', (req, res) => {
	student_name = student_name;
	student_email = student_email;
	student_phone = student_phone;
	student_branch = student_branch;
	student_date = student_date;
	
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		dbo.collection("students").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("students/list.hbs",{
					list: docs
			});
			}else {
				console.log('Error in retrieving students list :' + err);
			}
		});
	});

    // Student.find((err, docs) => {
    //     if (!err) {
    //         res.render("students/list.hbs", {
    //             list: docs
    //         });
    //     }
    //     else {
    //         console.log('Error in retrieving student list :' + err);
    //     }
    // });
});

app.get('/list_kalwa', (req, res) => {
	student_name = student_name;
	student_email = student_email;
	student_phone = student_phone;
	student_branch = student_branch;
	student_date = student_date;
	
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		dbo.collection("students_kalwa").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("students/list_kalwa.hbs",{
					list: docs
			});
			}else {
				console.log('Error in retrieving students list :' + err);
			}
		});
	});
});

app.get('/list_kalyan', (req, res) => {
	student_name = student_name;
	student_email = student_email;
	student_phone = student_phone;
	student_branch = student_branch;
	student_date = student_date;
	
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		dbo.collection("students_kalyan").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("students/list_kalyan.hbs",{
					list: docs
			});
			}else {
				console.log('Error in retrieving students list :' + err);
			}
		});
	});
});

app.get('/list_vashi', (req, res) => {
	student_name = student_name;
	student_email = student_email;
	student_phone = student_phone;
	student_branch = student_branch;
	student_date = student_date;
	
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		dbo.collection("students_vashi").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("students/list_vashi.hbs",{
					list: docs
			});
			}else {
				console.log('Error in retrieving students list :' + err);
			}
		});
	});
});

app.get('/list_panvel', (req, res) => {
	student_name = student_name;
	student_email = student_email;
	student_phone = student_phone;
	student_branch = student_branch;
	student_date = student_date;
	
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		dbo.collection("students_panvel").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("students/list_panvel.hbs",{
					list: docs
			});
			}else {
				console.log('Error in retrieving students list :' + err);
			}
		});
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

function handle1ValidationError(err, body) {
    for (field in err.errors) {
        switch (err.errors[field].path) {
            case 'name':
                body['nameError'] = err.errors[field].message;
                break;
            default:
                break;
        }
    }
}

// app.get('/:id', (req, res) => {
//     Student.findById(req.params.id, (err, doc) => {
//         if (!err) {
//             res.render("students/addOrEdit.hbs", {
//                 viewTitle: "Update Student Details",
//                 student: doc
//             });
//         }
//     });
// });

// app.get('/delete/:id', (req, res) => {
//         Student.findByIdAndRemove(req.params.id, (err, doc) => {
//         if (!err) {
//             res.redirect('/students/list');
//         }
//         else { console.log('Error in student delete :' + err); }
//     });
// });

app.get('/students/delete/:id', (req, res) => {
	var url="mongodb://localhost:27017/";
	var id = req.params.id;
	console.log(req.params.id)
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		dbo.collection("students").deleteOne({_id: ObjectId(req.params.id)}, function(err, docs){
			if (!err) {
				res.redirect('/list');
			}
			else { console.log('Error in student delete :' + err); }
		});
	});
});

app.get('/studentskalwa/delete/:id', (req, res) => {
	var url="mongodb://localhost:27017/";
	var id = req.params.id;
	console.log(req.params.id)
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		dbo.collection("students_kalwa").deleteOne({_id: ObjectId(req.params.id)}, function(err, docs){
			if (!err) {
				res.redirect('/list_kalwa');
			}
			else { console.log('Error in student delete :' + err); }
		});
	});
});

app.get('/studentskalyan/delete/:id', (req, res) => {
	var url="mongodb://localhost:27017/";
	var id = req.params.id;
	console.log(req.params.id)
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		dbo.collection("students_kalyan").deleteOne({_id: ObjectId(req.params.id)}, function(err, docs){
			if (!err) {
				res.redirect('/list_kalyan');
			}
			else { console.log('Error in student delete :' + err); }
		});
	});
});

app.get('/studentsvashi/delete/:id', (req, res) => {
	var url="mongodb://localhost:27017/";
	var id = req.params.id;
	console.log(req.params.id)
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		dbo.collection("students_vashi").deleteOne({_id: ObjectId(req.params.id)}, function(err, docs){
			if (!err) {
				res.redirect('/list_vashi');
			}
			else { console.log('Error in student delete :' + err); }
		});
	});
});

app.get('/studentspanvel/delete/:id', (req, res) => {
	var url="mongodb://localhost:27017/";
	var id = req.params.id;
	console.log(req.params.id)
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		dbo.collection("students_panvel").deleteOne({_id: ObjectId(req.params.id)}, function(err, docs){
			if (!err) {
				res.redirect('/list_panvel');
			}
			else { console.log('Error in student delete :' + err); }
		});
	});
});

app.get('/courses/delete/:id', (req, res) => {
	var url="mongodb://localhost:27017/";
	var id = req.params.id;
	console.log(req.params.id)
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		dbo.collection("courses").deleteOne({_id: ObjectId(req.params.id)}, function(err, docs){
			if (!err) {
				res.redirect('/list_course');
			}
			else { console.log('Error in course delete :' + err); }
		});
	});
});

app.get('/courseskalwa/delete/:id', (req, res) => {
	var url="mongodb://localhost:27017/";
	var id = req.params.id;
	console.log(req.params.id)
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		dbo.collection("courses").deleteOne({_id: ObjectId(req.params.id)}, function(err, docs){
			if (!err) {
				res.redirect('/list_coursekalwa');
			}
			else { console.log('Error in course delete :' + err); }
		});
	});
});

app.get('/courseskalyan/delete/:id', (req, res) => {
	var url="mongodb://localhost:27017/";
	var id = req.params.id;
	console.log(req.params.id)
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		dbo.collection("courses").deleteOne({_id: ObjectId(req.params.id)}, function(err, docs){
			if (!err) {
				res.redirect('/list_coursekalyan');
			}
			else { console.log('Error in course delete :' + err); }
		});
	});
});

app.get('/coursespanvel/delete/:id', (req, res) => {
	var url="mongodb://localhost:27017/";
	var id = req.params.id;
	console.log(req.params.id)
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		dbo.collection("courses").deleteOne({_id: ObjectId(req.params.id)}, function(err, docs){
			if (!err) {
				res.redirect('/list_coursepanvel');
			}
			else { console.log('Error in course delete :' + err); }
		});
	});
});

app.get('/coursesvashi/delete/:id', (req, res) => {
	var url="mongodb://localhost:27017/";
	var id = req.params.id;
	console.log(req.params.id)
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		dbo.collection("courses").deleteOne({_id: ObjectId(req.params.id)}, function(err, docs){
			if (!err) {
				res.redirect('/list_coursevashi');
			}
			else { console.log('Error in course delete :' + err); }
		});
	});
});

app.get('/studentupdate', (req,res)=>{
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	studentid = urlparam.query.id;
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		dbo.collection("students").find({_id: ObjectId(studentid)}).toArray(function(err,data){
			// console.log(data[0].Course_name)
			if (err) throw err
				else{
					if(data.length!=0){
						res.render("students/update_student.hbs",{
							viewTitle: "Update Student Details",
							// course: data
							student:{
								name: data[0].name, 
								email: data[0].email,
								phone: data[0].phone,
								branch: data[0].branch,
								date: data[0].date
							}
							// course_name: Course_name
							// course_fees: Course_fees
						});
					}else{
						res.render("students/addOrEdit.hbs",{
							viewTitle: "Insert Student Details"
						})
					}
				}
		});
	});
});

app.post('/studentupdate', (req, res)=>{
	var url="mongodb://localhost:27017";
	let query={
		_id:ObjectId(studentid)
	}

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		let docobj = {
			$set:{
				name: req.body.name,
				email: req.body.email,
				phone: req.body.phone,
				branch: req.body.branch,
				date: req.body.date
			}
		}
		dbo.collection("students").updateOne(query, docobj, function(err, docs){
				// console.log(docs)
				if (!err){ res.redirect('/list'); }
				else {
					if (err.name == 'ValidationError') {
						handle1ValidationError(err, req.body);
						res.render("students/update_student.hbs", {
							viewTitle: 'Update Student Details',
							student: docobj
						});
					}else{
						console.log('Error during record update : ' + err);
					}

				}
		});
	});
});

app.get('/studentupdate_kalwa', (req,res)=>{
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	studentid1 = urlparam.query.id;
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		dbo.collection("students_kalwa").find({_id: ObjectId(studentid1)}).toArray(function(err,data){
			// console.log(data[0].Course_name)
			if (err) throw err
				else{
					if(data.length!=0){
						res.render("students/update_studentkalwa.hbs",{
							viewTitle: "Update Student Details",
							// course: data
							student:{
								name: data[0].name, 
								email: data[0].email,
								phone: data[0].phone,
								branch: data[0].branch,
								date: data[0].date
							}
							// course_name: Course_name
							// course_fees: Course_fees
						});
					}else{
						res.render("students/add_kalwa.hbs",{
							viewTitle: "Insert Student Details"
						})
					}
				}
		});
	});
});

app.post('/studentupdate_kalwa', (req, res)=>{
	var url="mongodb://localhost:27017";
	let query={
		_id:ObjectId(studentid1)
	}

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		let docobj = {
			$set:{
				name: req.body.name,
				email: req.body.email,
				phone: req.body.phone,
				branch: req.body.branch,
				date: req.body.date
			}
		}
		dbo.collection("students_kalwa").updateOne(query, docobj, function(err, docs){
				// console.log(docs)
				if (!err){ res.redirect('/list_kalwa'); }
				else {
					if (err.name == 'ValidationError') {
						handle1ValidationError(err, req.body);
						res.render("students/update_studentkalwa.hbs", {
							viewTitle: 'Update Student Details',
							student: docobj
						});
					}else{
						console.log('Error during record update : ' + err);
					}

				}
		});
	});
});

app.get('/studentupdate_kalyan', (req,res)=>{
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	studentid2 = urlparam.query.id;
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		dbo.collection("students_kalyan").find({_id: ObjectId(studentid2)}).toArray(function(err,data){
			// console.log(data[0].Course_name)
			if (err) throw err
				else{
					if(data.length!=0){
						res.render("students/update_studentkalyan.hbs",{
							viewTitle: "Update Student Details",
							// course: data
							student:{
								name: data[0].name, 
								email: data[0].email,
								phone: data[0].phone,
								branch: data[0].branch,
								date: data[0].date
							}
							// course_name: Course_name
							// course_fees: Course_fees
						});
					}else{
						res.render("students/add_kalyan.hbs",{
							viewTitle: "Insert Student Details"
						})
					}
				}
		});
	});
});

app.post('/studentupdate_kalyan', (req, res)=>{
	var url="mongodb://localhost:27017";
	let query={
		_id:ObjectId(studentid2)
	}

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		let docobj = {
			$set:{
				name: req.body.name,
				email: req.body.email,
				phone: req.body.phone,
				branch: req.body.branch,
				date: req.body.date
			}
		}
		dbo.collection("students_kalyan").updateOne(query, docobj, function(err, docs){
				// console.log(docs)
				if (!err){ res.redirect('/list_kalyan'); }
				else {
					if (err.name == 'ValidationError') {
						handle1ValidationError(err, req.body);
						res.render("students/update_studentkalyan.hbs", {
							viewTitle: 'Update Student Details',
							student: docobj
						});
					}else{
						console.log('Error during record update : ' + err);
					}

				}
		});
	});
});

app.get('/studentupdate_vashi', (req,res)=>{
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	studentid2 = urlparam.query.id;
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		dbo.collection("students_vashi").find({_id: ObjectId(studentid2)}).toArray(function(err,data){
			// console.log(data[0].Course_name)
			if (err) throw err
				else{
					if(data.length!=0){
						res.render("students/update_studentvashi.hbs",{
							viewTitle: "Update Student Details",
							// course: data
							student:{
								name: data[0].name, 
								email: data[0].email,
								phone: data[0].phone,
								branch: data[0].branch,
								date: data[0].date
							}
							// course_name: Course_name
							// course_fees: Course_fees
						});
					}else{
						res.render("students/add_vashi.hbs",{
							viewTitle: "Insert Student Details"
						})
					}
				}
		});
	});
});

app.post('/studentupdate_vashi', (req, res)=>{
	var url="mongodb://localhost:27017";
	let query={
		_id:ObjectId(studentid2)
	}

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		let docobj = {
			$set:{
				name: req.body.name,
				email: req.body.email,
				phone: req.body.phone,
				branch: req.body.branch,
				date: req.body.date
			}
		}
		dbo.collection("students_vashi").updateOne(query, docobj, function(err, docs){
				// console.log(docs)
				if (!err){ res.redirect('/list_vashi'); }
				else {
					if (err.name == 'ValidationError') {
						handle1ValidationError(err, req.body);
						res.render("students/update_studentvashi.hbs", {
							viewTitle: 'Update Student Details',
							student: docobj
						});
					}else{
						console.log('Error during record update : ' + err);
					}

				}
		});
	});
});

app.get('/studentupdate_panvel', (req,res)=>{
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	studentid2 = urlparam.query.id;
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		dbo.collection("students_panvel").find({_id: ObjectId(studentid2)}).toArray(function(err,data){
			// console.log(data[0].Course_name)
			if (err) throw err
				else{
					if(data.length!=0){
						res.render("students/update_studentpanvel.hbs",{
							viewTitle: "Update Student Details",
							// course: data
							student:{
								name: data[0].name, 
								email: data[0].email,
								phone: data[0].phone,
								branch: data[0].branch,
								date: data[0].date
							}
							// course_name: Course_name
							// course_fees: Course_fees
						});
					}else{
						res.render("students/add_panvel.hbs",{
							viewTitle: "Insert Student Details"
						})
					}
				}
		});
	});
});

app.post('/studentupdate_panvel', (req, res)=>{
	var url="mongodb://localhost:27017";
	let query={
		_id:ObjectId(studentid2)
	}

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		let docobj = {
			$set:{
				name: req.body.name,
				email: req.body.email,
				phone: req.body.phone,
				branch: req.body.branch,
				date: req.body.date
			}
		}
		dbo.collection("students_panvel").updateOne(query, docobj, function(err, docs){
				// console.log(docs)
				if (!err){ res.redirect('/list_panvel'); }
				else {
					if (err.name == 'ValidationError') {
						handle1ValidationError(err, req.body);
						res.render("students/update_studentpanvel.hbs", {
							viewTitle: 'Update Student Details',
							student: docobj
						});
					}else{
						console.log('Error during record update : ' + err);
					}

				}
		});
	});
});

app.get('/courseupdate', (req,res)=>{
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	courseid = urlparam.query.id;
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		dbo.collection("courses").find({_id: ObjectId(courseid)}).toArray(function(err,data){
			// console.log(data[0].Course_name)
			if (err) throw err
				else{
					if(data.length!=0){
						res.render("courses/update_course.hbs",{
							viewTitle: "Update Course Details",
							// course: data
							course:{
								name: data[0].Course_name, 
								number: data[0].Course_fees,
								chapter1: data[0].Chapter_1,
								chapter2: data[0].Chapter_2,
								chapter3: data[0].Chapter_3,
								chapter4: data[0].Chapter_4,
								chapter5: data[0].Chapter_5,
								chapter6: data[0].Chapter_6,
							}
							// course_name: Course_name
							// course_fees: Course_fees
						});
					}else{
						res.render("courses/addOrEdit_course.hbs",{
							viewTitle: "Insert Course Details"
						})
					}
				}
		});
	});
});

app.post('/courseupdate', (req, res)=>{
	var url="mongodb://localhost:27017";
	let query={
		_id:ObjectId(courseid)
	}

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		let docobj = {
			$set:{
				Course_name: req.body.name,
				Course_fees: req.body.number,
				Chapter_1: req.body.chapter1,
				Chapter_2: req.body.chapter2,
				Chapter_3: req.body.chapter3,
				Chapter_4: req.body.chapter4,
				Chapter_5: req.body.chapter5,
				Chapter_6: req.body.chapter6,
			}
		}
		dbo.collection("courses").updateOne(query, docobj, function(err, docs){
				// console.log(docs)
				if (!err){ res.redirect('/list_course'); }
				else {
					if (err.name == 'ValidationError') {
						handle1ValidationError(err, req.body);
						res.render("courses/update_course.hbs", {
							viewTitle: 'Update Course Details',
							course: docobj
						});
					}else{
						console.log('Error during record update : ' + err);
					}

				}
		});
	});
});

app.get('/courseupdatekalwa', (req,res)=>{
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	courseid = urlparam.query.id;
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		dbo.collection("courses").find({_id: ObjectId(courseid)}).toArray(function(err,data){
			// console.log(data[0].Course_name)
			if (err) throw err
				else{
					if(data.length!=0){
						res.render("courses/update_coursekalwa.hbs",{
							viewTitle: "Update Course Details",
							// course: data
							course:{
								name: data[0].Course_name, 
								number: data[0].Course_fees,
								chapter1: data[0].Chapter_1,
								chapter2: data[0].Chapter_2,
								chapter3: data[0].Chapter_3,
								chapter4: data[0].Chapter_4,
								chapter5: data[0].Chapter_5,
								chapter6: data[0].Chapter_6						}
							// course_name: Course_name
							// course_fees: Course_fees
						});
					}else{
						res.render("courses/add_coursekalwa.hbs",{
							viewTitle: "Insert Course Details"
						})
					}
				}
		});
	});
});

app.post('/courseupdatekalwa', (req, res)=>{
	var url="mongodb://localhost:27017";
	let query={
		_id:ObjectId(courseid)
	}

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		let docobj = {
			$set:{
				Course_name: req.body.name,
				Course_fees: req.body.number,
				Chapter_1: req.body.chapter1,
				Chapter_2: req.body.chapter2,
				Chapter_3: req.body.chapter3,
				Chapter_4: req.body.chapter4,
				Chapter_5: req.body.chapter5,
				Chapter_6: req.body.chapter6
			}
		}
		dbo.collection("courses").updateOne(query, docobj, function(err, docs){
				// console.log(docs)
				if (!err){ res.redirect('/list_coursekalwa'); }
				else {
					if (err.name == 'ValidationError') {
						handle1ValidationError(err, req.body);
						res.render("courses/update_coursekalwa.hbs", {
							viewTitle: 'Update Course Details',
							course: docobj
						});
					}else{
						console.log('Error during record update : ' + err);
					}

				}
		});
	});
});

app.get('/courseupdatekalyan', (req,res)=>{
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	courseid = urlparam.query.id;
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		dbo.collection("courses").find({_id: ObjectId(courseid)}).toArray(function(err,data){
			// console.log(data[0].Course_name)
			if (err) throw err
				else{
					if(data.length!=0){
						res.render("courses/update_coursekalyan.hbs",{
							viewTitle: "Update Course Details",
							// course: data
							course:{
								name: data[0].Course_name, 
								number: data[0].Course_fees,
								chapter1: data[0].Chapter_1,
								chapter2: data[0].Chapter_2,
								chapter3: data[0].Chapter_3,
								chapter4: data[0].Chapter_4,
								chapter5: data[0].Chapter_5,
								chapter6: data[0].Chapter_6	
							}
							// course_name: Course_name
							// course_fees: Course_fees
						});
					}else{
						res.render("courses/add_coursekalyan.hbs",{
							viewTitle: "Insert Course Details"
						})
					}
				}
		});
	});
});

app.post('/courseupdatekalyan', (req, res)=>{
	var url="mongodb://localhost:27017";
	let query={
		_id:ObjectId(courseid)
	}

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		let docobj = {
			$set:{
				Course_name: req.body.name,
				Course_fees: req.body.number,
				Chapter_1: req.body.chapter1,
				Chapter_2: req.body.chapter2,
				Chapter_3: req.body.chapter3,
				Chapter_4: req.body.chapter4,
				Chapter_5: req.body.chapter5,
				Chapter_6: req.body.chapter6
			}
		}
		dbo.collection("courses").updateOne(query, docobj, function(err, docs){
				// console.log(docs)
				if (!err){ res.redirect('/list_coursekalyan'); }
				else {
					if (err.name == 'ValidationError') {
						handle1ValidationError(err, req.body);
						res.render("courses/update_coursekalyan.hbs", {
							viewTitle: 'Update Course Details',
							course: docobj
						});
					}else{
						console.log('Error during record update : ' + err);
					}

				}
		});
	});
});

app.get('/courseupdatepanvel', (req,res)=>{
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	courseid = urlparam.query.id;
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		dbo.collection("courses").find({_id: ObjectId(courseid)}).toArray(function(err,data){
			// console.log(data[0].Course_name)
			if (err) throw err
				else{
					if(data.length!=0){
						res.render("courses/update_coursepanvel.hbs",{
							viewTitle: "Update Course Details",
							// course: data
							course:{
								name: data[0].Course_name, 
								number: data[0].Course_fees,
								chapter1: data[0].Chapter_1,
								chapter2: data[0].Chapter_2,
								chapter3: data[0].Chapter_3,
								chapter4: data[0].Chapter_4,
								chapter5: data[0].Chapter_5,
								chapter6: data[0].Chapter_6	
							}
							// course_name: Course_name
							// course_fees: Course_fees
						});
					}else{
						res.render("courses/add_coursepanvel.hbs",{
							viewTitle: "Insert Course Details"
						})
					}
				}
		});
	});
});

app.post('/courseupdatepanvel', (req, res)=>{
	var url="mongodb://localhost:27017";
	let query={
		_id:ObjectId(courseid)
	}

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		let docobj = {
			$set:{
				Course_name: req.body.name,
				Course_fees: req.body.number,
				Chapter_1: req.body.chapter1,
				Chapter_2: req.body.chapter2,
				Chapter_3: req.body.chapter3,
				Chapter_4: req.body.chapter4,
				Chapter_5: req.body.chapter5,
				Chapter_6: req.body.chapter6
			}
		}
		dbo.collection("courses").updateOne(query, docobj, function(err, docs){
				// console.log(docs)
				if (!err){ res.redirect('/list_coursepanvel'); }
				else {
					if (err.name == 'ValidationError') {
						handle1ValidationError(err, req.body);
						res.render("courses/update_coursepanvel.hbs", {
							viewTitle: 'Update Course Details',
							course: docobj
						});
					}else{
						console.log('Error during record update : ' + err);
					}

				}
		});
	});
});

app.get('/courseupdatevashi', (req,res)=>{
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	courseid = urlparam.query.id;
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		dbo.collection("courses").find({_id: ObjectId(courseid)}).toArray(function(err,data){
			// console.log(data[0].Course_name)
			if (err) throw err
				else{
					if(data.length!=0){
						res.render("courses/update_coursevashi.hbs",{
							viewTitle: "Update Course Details",
							// course: data
							course:{
								name: data[0].Course_name, 
								number: data[0].Course_fees,
								chapter1: data[0].Chapter_1,
								chapter2: data[0].Chapter_2,
								chapter3: data[0].Chapter_3,
								chapter4: data[0].Chapter_4,
								chapter5: data[0].Chapter_5,
								chapter6: data[0].Chapter_6	
							}
							// course_name: Course_name
							// course_fees: Course_fees
						});
					}else{
						res.render("courses/add_coursevashi.hbs",{
							viewTitle: "Insert Course Details"
						})
					}
				}
		});
	});
});

app.post('/courseupdatevashi', (req, res)=>{
	var url="mongodb://localhost:27017";
	let query={
		_id:ObjectId(courseid)
	}

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		let docobj = {
			$set:{
				Course_name: req.body.name,
				Course_fees: req.body.number,
				Chapter_1: req.body.chapter1,
				Chapter_2: req.body.chapter2,
				Chapter_3: req.body.chapter3,
				Chapter_4: req.body.chapter4,
				Chapter_5: req.body.chapter5,
				Chapter_6: req.body.chapter6
			}
		}
		dbo.collection("courses").updateOne(query, docobj, function(err, docs){
				// console.log(docs)
				if (!err){ res.redirect('/list_coursevashi'); }
				else {
					if (err.name == 'ValidationError') {
						handle1ValidationError(err, req.body);
						res.render("courses/update_coursevashi.hbs", {
							viewTitle: 'Update Course Details',
							course: docobj
						});
					}else{
						console.log('Error during record update : ' + err);
					}

				}
		});
	});
});

app.get('/teachers', (req, res) => {
	course_name = course_name;
	course_fees = course_fees;
	
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		dbo.collection("courses").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("teachers/add_teacher.hbs", {
					list_course: docs,
					viewTitle: "Insert Teacher Details"
			});
			}else {
				console.log('Error in retrieving course list :' + err);
			}
		});
	});
});

app.post('/teachers', (req, res) => {
	var teacher_name = req.body.name;
	var teacher_email = req.body.email;
	var teacher_phone = req.body.phone;
	var course_name = req.body.course;
	var course_id = req.body._id;
	var course_info = req.body;
	console.log(course_info);
	var url="mongodb://localhost:27017/";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("teacher_details");
		if(req.body._id == ''){
			// function insertRecord(req, res) {
				var obj={
					Teacher_name: teacher_name,
					Teacher_email: teacher_email,
					Teacher_phone: teacher_phone,
					Course_name: course_name
				};
				dbo.collection("teachers").insert(obj, function(req, data){
					if (!err){
						res.redirect('/list_teacher');
					}else{
						if (err.name == 'ValidationError') {
							handle1ValidationError(err, req.body);
							res.render("teachers/add_teacher.hbs", {
								viewTitle: "Insert Teacher Details",
								course: req.body
							});
						}else{
							console.log('Error during record insertion : ' + err);
						}
					}
				});
		}
	});
});

app.get('/list_teacher', (req, res) => {
	// course_name = course_name;
	// course_fees = course_fees;
	
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("teacher_details");
		dbo.collection("teachers").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("teachers/list_teacher.hbs", {
					list_teacher: docs
			});
			}else {
				console.log('Error in retrieving teachers list :' + err);
			}
		});
	});
});

app.get('/teacherupdate', (req,res)=>{
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	teachid = urlparam.query.id;
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo1=db.db("course_details");
		var dbo=db.db("teacher_details");
		dbo.collection("teachers").find({_id: ObjectId(teachid)}).toArray(function(errOne, data){
			// console.log(data[0].Course_name)
			if (errOne) 
				throw err
			dbo1.collection("courses").find().toArray(function(errTwo, docs){
				if(!errTwo){
					res.render("teachers/update_teacher.hbs",{
						list_course: docs,
						teacher:{
								name: data[0].Teacher_name,
								email: data[0].Teacher_email,
								phone: data[0].Teacher_phone, 
								course: data[0].Course_name
							},
						viewTitle: "Update Teacher Details"
					})
				}
			})
				// else{
					// if(dataOne.length!=0){
					// 	res.render("teachers/update_teacher.hbs",{
					// 		viewTitle: "Update Teacher Details",
					// 		// course: data
					// 		// teacher:{
					// 		// 	name: data[0].Teacher_name, 
					// 		// 	course: data[0].Course_name
					// 		// }
							
					// 	});
					// }else{
					// 	res.render("teachers/add_teacher.hbs",{
					// 		viewTitle: "Update Teacher Details"
					// 	})
					// }
				// }
		});

		// var dbo1=db.db("course_details");
		// dbo1.collection("courses").find().toArray(function(err, docs){
		// 	db.close();
		// 	if (!err) {
		// 		res.render("teachers/update_teacher.hbs", {
		// 			list_course: docs
		// 	});
		// 	}else {
		// 		console.log('Error in retrieving course list :' + err);
		// 	}
		// });
	});
});

app.post('/teacherupdate', (req, res)=>{
	var url="mongodb://localhost:27017";
	let query={
		_id:ObjectId(teachid)
	}

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("teacher_details");
		let docobj = {
			$set:{
				Teacher_name: req.body.name,
				Teacher_email: req.body.email,
				Teacher_phone: req.body.phone,
				Course_name: req.body.course
			}
		}
		dbo.collection("teachers").updateOne(query, docobj, function(err, docs){
				// console.log(docs)
				if (!err){ res.redirect('/list_teacher'); }
				else {
					if (err.name == 'ValidationError') {
						handle1ValidationError(err, req.body);
						res.render("teachers/update_teacher.hbs", {
							viewTitle: 'Update Teacher Details',
							teacher: docobj
						});
					}else{
						console.log('Error during record update : ' + err);
					}

				}
		});
	});
});

app.get('/teacher/delete/:id', (req, res) => {
	var url="mongodb://localhost:27017/";
	var id = req.params.id;
	console.log(req.params.id)
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("teacher_details");
		dbo.collection("teachers").deleteOne({_id: ObjectId(req.params.id)}, function(err, docs){
			if (!err) {
				res.redirect('/list_teacher');
			}
			else { console.log('Error in teacher details delete :' + err); }
		});
	});
});

//////////////////teacher details of branch kalwa

app.get('/teachers_kalwa', (req, res) => {
	course_name = course_name;
	course_fees = course_fees;
	
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		dbo.collection("courses").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("teachers/add_teacherkalwa.hbs", {
					list_course: docs,
					viewTitle: "Insert Teacher Details"
			});
			}else {
				console.log('Error in retrieving course list :' + err);
			}
		});
	});
});

app.post('/teachers_kalwa', (req, res) => {
	var teacher_name = req.body.name;
	var teacher_email = req.body.email;
	var teacher_phone = req.body.phone;
	var course_name = req.body.course;
	var course_id = req.body._id;
	var course_info = req.body;
	console.log(course_info);
	var url="mongodb://localhost:27017/";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("teacher_details");
		if(req.body._id == ''){
			// function insertRecord(req, res) {
				var obj={
					Teacher_name: teacher_name,
					Teacher_email: teacher_email,
					Teacher_phone: teacher_phone,
					Course_name: course_name
				};
				dbo.collection("teachers_kalwa").insert(obj, function(req, data){
					if (!err){
						res.redirect('/list_teacherkalwa');
					}else{
						if (err.name == 'ValidationError') {
							handle1ValidationError(err, req.body);
							res.render("teachers/add_teacherkalwa.hbs", {
								viewTitle: "Insert Teacher Details",
								course: req.body
							});
						}else{
							console.log('Error during record insertion : ' + err);
						}
					}
				});
		}
	});
});

app.get('/list_teacherkalwa', (req, res) => {
	// course_name = course_name;
	// course_fees = course_fees;
	
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("teacher_details");
		dbo.collection("teachers_kalwa").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("teachers/list_teacherkalwa.hbs", {
					list_teacher: docs
			});
			}else {
				console.log('Error in retrieving teachers list :' + err);
			}
		});
	});
});

app.get('/teacherupdatekalwa', (req,res)=>{
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	teachid = urlparam.query.id;
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo1=db.db("course_details");
		var dbo=db.db("teacher_details");
		dbo.collection("teachers_kalwa").find({_id: ObjectId(teachid)}).toArray(function(errOne, data){
			// console.log(data[0].Course_name)
			if (errOne) 
				throw err
			dbo1.collection("courses").find().toArray(function(errTwo, docs){
				if(!errTwo){
					res.render("teachers/update_teacherkalwa.hbs",{
						list_course: docs,
						teacher:{
								name: data[0].Teacher_name,
								email: data[0].Teacher_email,
								phone: data[0].Teacher_phone, 
								course: data[0].Course_name
							},
						viewTitle: "Update Teacher Details"
					})
				}
			})
		});
	});
});

app.post('/teacherupdatekalwa', (req, res)=>{
	var url="mongodb://localhost:27017";
	let query={
		_id:ObjectId(teachid)
	}

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("teacher_details");
		let docobj = {
			$set:{
				Teacher_name: req.body.name,
				Teacher_email: req.body.email,
				Teacher_phone: req.body.phone,
				Course_name: req.body.course
			}
		}
		dbo.collection("teachers_kalwa").updateOne(query, docobj, function(err, docs){
				// console.log(docs)
				if (!err){ res.redirect('/list_teacherkalwa'); }
				else {
					if (err.name == 'ValidationError') {
						handle1ValidationError(err, req.body);
						res.render("teachers/update_teacherkalwa.hbs", {
							viewTitle: 'Update Teacher Details',
							teacher: docobj
						});
					}else{
						console.log('Error during record update : ' + err);
					}

				}
		});
	});
});

app.get('/teacherkalwa/delete/:id', (req, res) => {
	var url="mongodb://localhost:27017/";
	var id = req.params.id;
	console.log(req.params.id)
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("teacher_details");
		dbo.collection("teachers_kalwa").deleteOne({_id: ObjectId(req.params.id)}, function(err, docs){
			if (!err) {
				res.redirect('/list_teacherkalwa');
			}
			else { console.log('Error in teacher details delete :' + err); }
		});
	});
});

//////////////////teacher details of KALYAN BRANCH

app.get('/teachers_kalyan', (req, res) => {
	course_name = course_name;
	course_fees = course_fees;
	
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		dbo.collection("courses").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("teachers/add_teacherkalyan.hbs", {
					list_course: docs,
					viewTitle: "Insert Teacher Details"
			});
			}else {
				console.log('Error in retrieving course list :' + err);
			}
		});
	});
});

app.post('/teachers_kalyan', (req, res) => {
	var teacher_name = req.body.name;
	var teacher_email = req.body.email;
	var teacher_phone = req.body.phone;
	var course_name = req.body.course;
	var course_id = req.body._id;
	var course_info = req.body;
	console.log(course_info);
	var url="mongodb://localhost:27017/";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("teacher_details");
		if(req.body._id == ''){
			// function insertRecord(req, res) {
				var obj={
					Teacher_name: teacher_name,
					Teacher_email: teacher_email,
					Teacher_phone: teacher_phone,
					Course_name: course_name
				};
				dbo.collection("teachers_kalyan").insert(obj, function(req, data){
					if (!err){
						res.redirect('/list_teacherkalyan');
					}else{
						if (err.name == 'ValidationError') {
							handle1ValidationError(err, req.body);
							res.render("teachers/add_teacherkalyan.hbs", {
								viewTitle: "Insert Teacher Details",
								course: req.body
							});
						}else{
							console.log('Error during record insertion : ' + err);
						}
					}
				});
		}
	});
});

app.get('/list_teacherkalyan', (req, res) => {
	// course_name = course_name;
	// course_fees = course_fees;
	
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("teacher_details");
		dbo.collection("teachers_kalyan").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("teachers/list_teacherkalyan.hbs", {
					list_teacher: docs
			});
			}else {
				console.log('Error in retrieving teachers list :' + err);
			}
		});
	});
});

app.get('/teacherupdatekalyan', (req,res)=>{
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	teachid = urlparam.query.id;
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo1=db.db("course_details");
		var dbo=db.db("teacher_details");
		dbo.collection("teachers_kalyan").find({_id: ObjectId(teachid)}).toArray(function(errOne, data){
			// console.log(data[0].Course_name)
			if (errOne) 
				throw err
			dbo1.collection("courses").find().toArray(function(errTwo, docs){
				if(!errTwo){
					res.render("teachers/update_teacherkalyan.hbs",{
						list_course: docs,
						teacher:{
								name: data[0].Teacher_name,
								email: data[0].Teacher_email,
								phone: data[0].Teacher_phone, 
								course: data[0].Course_name
							},
						viewTitle: "Update Teacher Details"
					})
				}
			})
		});
	});
});

app.post('/teacherupdatekalyan', (req, res)=>{
	var url="mongodb://localhost:27017";
	let query={
		_id:ObjectId(teachid)
	}

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("teacher_details");
		let docobj = {
			$set:{
				Teacher_name: req.body.name,
				Teacher_email: req.body.email,
				Teacher_phone: req.body.phone,
				Course_name: req.body.course
			}
		}
		dbo.collection("teachers_kalyan").updateOne(query, docobj, function(err, docs){
				// console.log(docs)
				if (!err){ res.redirect('/list_teacherkalyan'); }
				else {
					if (err.name == 'ValidationError') {
						handle1ValidationError(err, req.body);
						res.render("teachers/update_teacherkalyan.hbs", {
							viewTitle: 'Update Teacher Details',
							teacher: docobj
						});
					}else{
						console.log('Error during record update : ' + err);
					}

				}
		});
	});
});

app.get('/teacherkalyan/delete/:id', (req, res) => {
	var url="mongodb://localhost:27017/";
	var id = req.params.id;
	console.log(req.params.id)
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("teacher_details");
		dbo.collection("teachers_kalyan").deleteOne({_id: ObjectId(req.params.id)}, function(err, docs){
			if (!err) {
				res.redirect('/list_teacherkalyan');
			}
			else { console.log('Error in teacher details delete :' + err); }
		});
	});
});

//////////////////teacher details of PANVEL BRANCH

app.get('/teachers_panvel', (req, res) => {
	course_name = course_name;
	course_fees = course_fees;
	
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		dbo.collection("courses").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("teachers/add_teacherpanvel.hbs", {
					list_course: docs,
					viewTitle: "Insert Teacher Details"
			});
			}else {
				console.log('Error in retrieving course list :' + err);
			}
		});
	});
});

app.post('/teachers_panvel', (req, res) => {
	var teacher_name = req.body.name;
	var teacher_email = req.body.email;
	var teacher_phone = req.body.phone;
	var course_name = req.body.course;
	var course_id = req.body._id;
	var course_info = req.body;
	console.log(course_info);
	var url="mongodb://localhost:27017/";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("teacher_details");
		if(req.body._id == ''){
			// function insertRecord(req, res) {
				var obj={
					Teacher_name: teacher_name,
					Teacher_email: teacher_email,
					Teacher_phone: teacher_phone,
					Course_name: course_name
				};
				dbo.collection("teachers_panvel").insert(obj, function(req, data){
					if (!err){
						res.redirect('/list_teacherpanvel');
					}else{
						if (err.name == 'ValidationError') {
							handle1ValidationError(err, req.body);
							res.render("teachers/add_teacherpanvel.hbs", {
								viewTitle: "Insert Teacher Details",
								course: req.body
							});
						}else{
							console.log('Error during record insertion : ' + err);
						}
					}
				});
		}
	});
});

app.get('/list_teacherpanvel', (req, res) => {
	// course_name = course_name;
	// course_fees = course_fees;
	
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("teacher_details");
		dbo.collection("teachers_panvel").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("teachers/list_teacherpanvel.hbs", {
					list_teacher: docs
			});
			}else {
				console.log('Error in retrieving teachers list :' + err);
			}
		});
	});
});

app.get('/teacherupdatepanvel', (req,res)=>{
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	teachid = urlparam.query.id;
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo1=db.db("course_details");
		var dbo=db.db("teacher_details");
		dbo.collection("teachers_panvel").find({_id: ObjectId(teachid)}).toArray(function(errOne, data){
			// console.log(data[0].Course_name)
			if (errOne) 
				throw err
			dbo1.collection("courses").find().toArray(function(errTwo, docs){
				if(!errTwo){
					res.render("teachers/update_teacherpanvel.hbs",{
						list_course: docs,
						teacher:{
								name: data[0].Teacher_name,
								email: data[0].Teacher_email,
								phone: data[0].Teacher_phone, 
								course: data[0].Course_name
							},
						viewTitle: "Update Teacher Details"
					})
				}
			})
		});
	});
});

app.post('/teacherupdatepanvel', (req, res)=>{
	var url="mongodb://localhost:27017";
	let query={
		_id:ObjectId(teachid)
	}

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("teacher_details");
		let docobj = {
			$set:{
				Teacher_name: req.body.name,
				Teacher_email: req.body.email,
				Teacher_phone: req.body.phone,
				Course_name: req.body.course
			}
		}
		dbo.collection("teachers_panvel").updateOne(query, docobj, function(err, docs){
				// console.log(docs)
				if (!err){ res.redirect('/list_teacherpanvel'); }
				else {
					if (err.name == 'ValidationError') {
						handle1ValidationError(err, req.body);
						res.render("teachers/update_teacherpanvel.hbs", {
							viewTitle: 'Update Teacher Details',
							teacher: docobj
						});
					}else{
						console.log('Error during record update : ' + err);
					}

				}
		});
	});
});

app.get('/teacherpanvel/delete/:id', (req, res) => {
	var url="mongodb://localhost:27017/";
	var id = req.params.id;
	console.log(req.params.id)
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("teacher_details");
		dbo.collection("teachers_panvel").deleteOne({_id: ObjectId(req.params.id)}, function(err, docs){
			if (!err) {
				res.redirect('/list_teacherpanvel');
			}
			else { console.log('Error in teacher details delete :' + err); }
		});
	});
});

//////////////////teacher details of VASHI BRANCH

app.get('/teachers_vashi', (req, res) => {
	course_name = course_name;
	course_fees = course_fees;
	
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("course_details");
		dbo.collection("courses").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("teachers/add_teachervashi.hbs", {
					list_course: docs,
					viewTitle: "Insert Teacher Details"
			});
			}else {
				console.log('Error in retrieving course list :' + err);
			}
		});
	});
});

app.post('/teachers_vashi', (req, res) => {
	var teacher_name = req.body.name;
	var teacher_email = req.body.email;
	var teacher_phone = req.body.phone;
	var course_name = req.body.course;
	var course_id = req.body._id;
	var course_info = req.body;
	console.log(course_info);
	var url="mongodb://localhost:27017/";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("teacher_details");
		if(req.body._id == ''){
			// function insertRecord(req, res) {
				var obj={
					Teacher_name: teacher_name,
					Teacher_email: teacher_email,
					Teacher_phone: teacher_phone,
					Course_name: course_name
				};
				dbo.collection("teachers_vashi").insert(obj, function(req, data){
					if (!err){
						res.redirect('/list_teachervashi');
					}else{
						if (err.name == 'ValidationError') {
							handle1ValidationError(err, req.body);
							res.render("teachers/add_teachervashi.hbs", {
								viewTitle: "Insert Teacher Details",
								course: req.body
							});
						}else{
							console.log('Error during record insertion : ' + err);
						}
					}
				});
		}
	});
});

app.get('/list_teachervashi', (req, res) => {
	// course_name = course_name;
	// course_fees = course_fees;
	
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("teacher_details");
		dbo.collection("teachers_vashi").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("teachers/list_teachervashi.hbs", {
					list_teacher: docs
			});
			}else {
				console.log('Error in retrieving teachers list :' + err);
			}
		});
	});
});

app.get('/teacherupdatevashi', (req,res)=>{
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	teachid = urlparam.query.id;
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo1=db.db("course_details");
		var dbo=db.db("teacher_details");
		dbo.collection("teachers_vashi").find({_id: ObjectId(teachid)}).toArray(function(errOne, data){
			// console.log(data[0].Course_name)
			if (errOne) 
				throw err
			dbo1.collection("courses").find().toArray(function(errTwo, docs){
				if(!errTwo){
					res.render("teachers/update_teachervashi.hbs",{
						list_course: docs,
						teacher:{
								name: data[0].Teacher_name,
								email: data[0].Teacher_email,
								phone: data[0].Teacher_phone, 
								course: data[0].Course_name
							},
						viewTitle: "Update Teacher Details"
					})
				}
			})
		});
	});
});

app.post('/teacherupdatevashi', (req, res)=>{
	var url="mongodb://localhost:27017";
	let query={
		_id:ObjectId(teachid)
	}

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("teacher_details");
		let docobj = {
			$set:{
				Teacher_name: req.body.name,
				Teacher_email: req.body.email,
				Teacher_phone: req.body.phone,
				Course_name: req.body.course
			}
		}
		dbo.collection("teachers_vashi").updateOne(query, docobj, function(err, docs){
				// console.log(docs)
				if (!err){ res.redirect('/list_teachervashi'); }
				else {
					if (err.name == 'ValidationError') {
						handle1ValidationError(err, req.body);
						res.render("teachers/update_teachervashi.hbs", {
							viewTitle: 'Update Teacher Details',
							teacher: docobj
						});
					}else{
						console.log('Error during record update : ' + err);
					}

				}
		});
	});
});

app.get('/teachervashi/delete/:id', (req, res) => {
	var url="mongodb://localhost:27017/";
	var id = req.params.id;
	console.log(req.params.id)
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("teacher_details");
		dbo.collection("teachers_vashi").deleteOne({_id: ObjectId(req.params.id)}, function(err, docs){
			if (!err) {
				res.redirect('/list_teachervashi');
			}
			else { console.log('Error in teacher details delete :' + err); }
		});
	});
});

app.get("/lectures/:course", function(req, res){
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		//var dbo1=db.db("course_details");
		var dbo2=db.db("teacher_details");

		dbo2.collection("teachers").find({Course_name: req.params.course}).toArray(function(err, teacherdata){
			//dbo1.collection("courses").find({Course_name: req.params.course}).toArray(function(err, coursedata){
				console.log(teacherdata);
				//console.log(coursedata);


				res.render("lectures/addlecture.hbs",{
					viewTitle: "Schedule Lecture",
					list_teacher: teacherdata,
					
				});
				// var response="";
				// for(i=0; i<teacherdata[0].Teacher_name.length; i++){
				// 	response="<option>"+teacherdata[0].Teacher_name+"</option>";
				// }
				// res.send({list_teacher: response, list_chapter: });

				
			//});
		});
	});
});


app.get("/lectures/chapters/:course", function(req, res){
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo1=db.db("course_details");
		//var dbo2=db.db("teacher_details");

		//dbo2.collection("teachers").find({Course_name: req.params.course}).toArray(function(err, teacherdata){
			dbo1.collection("courses").find({Course_name: req.params.course}).toArray(function(err, coursedata){
				//console.log(teacherdata);
				console.log(coursedata);


				res.render("lectures/addlecture.hbs",{
					viewTitle: "Schedule Lecture",
					//list_teacher: teacherdata,
					list_chapter: coursedata

				});
				// var response="";
				// for(i=0; i<teacherdata[0].Teacher_name.length; i++){
				// 	response="<option>"+teacherdata[0].Teacher_name+"</option>";
				// }
				// res.send({list_teacher: response, list_chapter: });

				
			});
		//});
	});
});


app.get('/lectures', (req, res) => {
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	course = urlparam.query.course;


	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		var dbo1=db.db("course_details");
		var dbo2= db.db("teacher_details");

		
		dbo.collection("students").find().toArray(function(err, studentdata){
			dbo1.collection("courses").find().toArray(function(err, coursedata){
				

				//dbo2.collection("teachers").find({_id: ObjectId(courseid)}).toArray(function(err, teacherdata){
					// console.log(teacherdata);
					//console.log(coursedata);
					// console.log(studentdata);

					res.render("lectures/addlecture.hbs",{
						viewTitle: "Schedule Lecture",
						// list_teacher: teacherdata,
						list_course: coursedata,
						list_student: studentdata,
						// list_chapter: coursedata
					});
					
				//})
			});
			
		});
	});
});




app.post('/lectures', (req, res) => {
	var student_name = req.body.student;
	var course_name = req.body.course;
	var teacher_name = req.body.teacher;
	var course_name = req.body.course;
	var date = req.body.date;
	var stime = req.body.stime;
	var etime = req.body.etime;
	var chapter_name = req.body.chapter;
	var status= req.body.status;
	var lec_id = req.body._id;
	// var course_info = req.body;
	// console.log(course_info);
	var url="mongodb://localhost:27017/";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("lecture_details");
		if(req.body._id == ''){
			// function insertRecord(req, res) {
				var obj={
					Student_name: student_name,
					Course_name: course_name,
					Teacher_name: teacher_name,
					Date: date,
					Start_Time: stime,
					End_Time: etime,
					Chapter_name: chapter_name,
					Status: status,
				};
				dbo.collection("lectures").insert(obj, function(req, data){
					if (!err){
						res.redirect('/list_lecture');
					}else{
						if (err.name == 'ValidationError') {
							handle1ValidationError(err, req.body);
							res.render("lectures/addlecture.hbs", {
								viewTitle: "Schedule Lecture",
								lecture: req.body
							});
						}else{
							console.log('Error during record insertion : ' + err);
						}
					}
				});
		}
	});
});



app.get('/list_lecture', (req, res) => {
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("lecture_details");
		dbo.collection("lectures").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("lectures/list_lecture.hbs", {
					list_lecture: docs
			});
			}else {
				console.log('Error in retrieving lecture list :' + err);
			}
		});
	});
});

app.get('/lectures/delete/:id', (req, res) => {
	var url="mongodb://localhost:27017/";
	var id = req.params.id;
	//console.log(req.params.id)
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("lecture_details");
		dbo.collection("lectures").deleteOne({_id: ObjectId(req.params.id)}, function(err, docs){
			if (!err) {
				res.redirect('/list_lecture');
			}
			else { console.log('Error in student delete :' + err); }
		});
	});
});

app.get('/lectureupdate', (req,res)=>{
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	lectureid = urlparam.query.id;

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		var dbo1=db.db("course_details");
		var dbo2= db.db("teacher_details");
		var dbo3=db.db("lecture_details");

		
		dbo.collection("students").find().toArray(function(err, studentdata){
			dbo1.collection("courses").find().toArray(function(err, coursedata){
				//dbo2.collection("teachers").find().toArray(function(err, teacherdata){
					dbo3.collection("lectures").find({_id: ObjectId(lectureid)}).toArray(function(err,data){
						if(data.length!=0){

							res.render("lectures/update_lecture.hbs",{
								viewTitle: "Update Lecture Details",
								//list_teacher: teacherdata,
								list_course: coursedata,
								list_student: studentdata,
								//list_chapter: coursedata,
								lecture:{
									student : data[0].Student_name,
									course: data[0].Course_name,
									teacher: data[0].Teacher_name,
									date: data[0].Date,
									stime: data[0].Start_Time,
									etime: data[0].End_Time,
									chapter: data[0].Chapter_name,
									status: data[0].Status,

								}
							})
						}else{
							res.render("lectures/addlecture.hbs",{
								viewTitle: "Insert Course Details"
							});
						}
					});
				//});
			});
		});
	});
});
			
app.post('/lectureupdate', (req, res)=>{
	var url="mongodb://localhost:27017";
	let query={
		_id:ObjectId(lectureid)
	}

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("lecture_details");
		let docobj = {
			$set:{
				Student_name: req.body.student,
				Course_name: req.body.course,
				Teacher_name: req.body.teacher,
				Date: req.body.date,
				Start_Time: req.body.stime,
				End_Time: req.body.etime,
				Chapter_name: req.body.chapter,
				Status: req.body.status,
			}
		}
		dbo.collection("lectures").updateOne(query, docobj, function(err, docs){
				// console.log(docs)
				if (!err){ res.redirect('/list_lecture'); }
				else {
					if (err.name == 'ValidationError') {
						handle1ValidationError(err, req.body);
						res.render("lectures/update_lecture.hbs", {
							viewTitle: 'Update Lecture Details',
							course: docobj
						});
					}else{
						console.log('Error during record update : ' + err);
					}

				}
		});
	});
});



/////////////KALWA LECTURE DETAILS///////////////////////

app.get("/lectureskalwa/:course", function(req, res){
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo2=db.db("teacher_details");

		dbo2.collection("teachers_kalwa").find({Course_name: req.params.course}).toArray(function(err, teacherdata){
			//dbo1.collection("courses").find({Course_name: req.params.course}).toArray(function(err, coursedata){
				console.log(teacherdata);
				//console.log(coursedata);


				res.render("lectures/addlecture_kalwa.hbs",{
					viewTitle: "Schedule Lecture",
					list_teacher: teacherdata,
					
				});
				// var response="";
				// for(i=0; i<teacherdata[0].Teacher_name.length; i++){
				// 	response="<option>"+teacherdata[0].Teacher_name+"</option>";
				// }
				// res.send({list_teacher: response, list_chapter: });

				
			//});
		});
	});
});


app.get("/lectureskalwa/chapters/:course", function(req, res){
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo1=db.db("course_details");
		//var dbo2=db.db("teacher_details");

		//dbo2.collection("teachers").find({Course_name: req.params.course}).toArray(function(err, teacherdata){
			dbo1.collection("courses").find({Course_name: req.params.course}).toArray(function(err, coursedata){
				//console.log(teacherdata);
				console.log(coursedata);


				res.render("lectures/addlecture_kalwa.hbs",{
					viewTitle: "Schedule Lecture",
					//list_teacher: teacherdata,
					list_chapter: coursedata

				});
				// var response="";
				// for(i=0; i<teacherdata[0].Teacher_name.length; i++){
				// 	response="<option>"+teacherdata[0].Teacher_name+"</option>";
				// }
				// res.send({list_teacher: response, list_chapter: });

				
			});
		//});
	});
});


app.get('/lectures_kalwa', (req, res) => {
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	course = urlparam.query.course;


	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		var dbo1=db.db("course_details");
		var dbo2= db.db("teacher_details");

		
		dbo.collection("students_kalwa").find().toArray(function(err, studentdata){
			dbo1.collection("courses").find().toArray(function(err, coursedata){
				

				//dbo2.collection("teachers").find({_id: ObjectId(courseid)}).toArray(function(err, teacherdata){
					// console.log(teacherdata);
					//console.log(coursedata);
					// console.log(studentdata);

					res.render("lectures/addlecture_kalwa.hbs",{
						viewTitle: "Schedule Lecture",
						// list_teacher: teacherdata,
						list_course: coursedata,
						list_student: studentdata,
						// list_chapter: coursedata
					});
					
				//})
			});
			
		});
	});
});




app.post('/lectures_kalwa', (req, res) => {
	var student_name = req.body.student;
	var course_name = req.body.course;
	var teacher_name = req.body.teacher;
	var course_name = req.body.course;
	var date = req.body.date;
	var stime = req.body.stime;
	var etime = req.body.etime;
	var chapter_name = req.body.chapter;
	var status= req.body.status;
	var lec_id = req.body._id;
	// var course_info = req.body;
	// console.log(course_info);
	var url="mongodb://localhost:27017/";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("lecture_details");
		if(req.body._id == ''){
			// function insertRecord(req, res) {
				var obj={
					Student_name: student_name,
					Course_name: course_name,
					Teacher_name: teacher_name,
					Date: date,
					Start_Time: stime,
					End_Time: etime,
					Chapter_name: chapter_name,
					Status: status,
				};
				dbo.collection("lectures_kalwa").insert(obj, function(req, data){
					if (!err){
						res.redirect('/list_lecturekalwa');
					}else{
						if (err.name == 'ValidationError') {
							handle1ValidationError(err, req.body);
							res.render("lectures/addlecture_kalwa.hbs", {
								viewTitle: "Schedule Lecture",
								lecture: req.body
							});
						}else{
							console.log('Error during record insertion : ' + err);
						}
					}
				});
		}
	});
});



app.get('/list_lecturekalwa', (req, res) => {
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("lecture_details");
		dbo.collection("lectures_kalwa").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("lectures/list_lecturekalwa.hbs", {
					list_lecture: docs
			});
			}else {
				console.log('Error in retrieving lecture list :' + err);
			}
		});
	});
});

app.get('/lectureskalwa/delete/:id', (req, res) => {
	var url="mongodb://localhost:27017/";
	var id = req.params.id;
	//console.log(req.params.id)
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("lecture_details");
		dbo.collection("lectures_kalwa").deleteOne({_id: ObjectId(req.params.id)}, function(err, docs){
			if (!err) {
				res.redirect('/list_lecturekalwa');
			}
			else { console.log('Error in student delete :' + err); }
		});
	});
});

app.get('/lectureupdate_kalwa', (req,res)=>{
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	lectureid = urlparam.query.id;

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		var dbo1=db.db("course_details");
		var dbo2= db.db("teacher_details");
		var dbo3=db.db("lecture_details");

		
		dbo.collection("students_kalwa").find().toArray(function(err, studentdata){
			dbo1.collection("courses").find().toArray(function(err, coursedata){
				//dbo2.collection("teachers_kalwa").find().toArray(function(err, teacherdata){
					dbo3.collection("lectures_kalwa").find({_id: ObjectId(lectureid)}).toArray(function(err,data){
						if(data.length!=0){

							res.render("lectures/update_lecturekalwa.hbs",{
								viewTitle: "Update Lecture Details",
								//list_teacher: teacherdata,
								list_course: coursedata,
								list_student: studentdata,
								//list_chapter: coursedata,
								lecture:{
									student : data[0].Student_name,
									course: data[0].Course_name,
									teacher: data[0].Teacher_name,
									date: data[0].Date,
									stime: data[0].Start_Time,
									etime: data[0].End_Time,
									chapter: data[0].Chapter_name,
									status: data[0].Status,

								}
							})
						}else{
							res.render("lectures/addlecture_kalwa.hbs",{
								viewTitle: "Insert Course Details"
							});
						}
					});
				//});
			});
		});
	});
});
			
app.post('/lectureupdate_kalwa', (req, res)=>{
	var url="mongodb://localhost:27017";
	let query={
		_id:ObjectId(lectureid)
	}

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("lecture_details");
		let docobj = {
			$set:{
				Student_name: req.body.student,
				Course_name: req.body.course,
				Teacher_name: req.body.teacher,
				Date: req.body.date,
				Start_Time: req.body.stime,
				End_Time: req.body.etime,
				Chapter_name: req.body.chapter,
				Status: req.body.status,
			}
		}
		dbo.collection("lectures_kalwa").updateOne(query, docobj, function(err, docs){
				// console.log(docs)
				if (!err){ res.redirect('/list_lecturekalwa'); }
				else {
					if (err.name == 'ValidationError') {
						handle1ValidationError(err, req.body);
						res.render("lectures/update_lecturekalwa.hbs", {
							viewTitle: 'Update Lecture Details',
							course: docobj
						});
					}else{
						console.log('Error during record update : ' + err);
					}

				}
		});
	});
});


//////////KALYAN LECTURES//////////////////////////////////////////////////////////////////

app.get("/lectureskalyan/:course", function(req, res){
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo2=db.db("teacher_details");

		dbo2.collection("teachers_kalyan").find({Course_name: req.params.course}).toArray(function(err, teacherdata){
			//dbo1.collection("courses").find({Course_name: req.params.course}).toArray(function(err, coursedata){
				console.log(teacherdata);
				//console.log(coursedata);


				res.render("lectures/addlecture_kalyan.hbs",{
					viewTitle: "Schedule Lecture",
					list_teacher: teacherdata,
					
				});
				// var response="";
				// for(i=0; i<teacherdata[0].Teacher_name.length; i++){
				// 	response="<option>"+teacherdata[0].Teacher_name+"</option>";
				// }
				// res.send({list_teacher: response, list_chapter: });

				
			//});
		});
	});
});


app.get("/lectureskalyan/chapters/:course", function(req, res){
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo1=db.db("course_details");
		//var dbo2=db.db("teacher_details");

		//dbo2.collection("teachers").find({Course_name: req.params.course}).toArray(function(err, teacherdata){
			dbo1.collection("courses").find({Course_name: req.params.course}).toArray(function(err, coursedata){
				//console.log(teacherdata);
				console.log(coursedata);


				res.render("lectures/addlecture_kalyan.hbs",{
					viewTitle: "Schedule Lecture",
					//list_teacher: teacherdata,
					list_chapter: coursedata

				});
				// var response="";
				// for(i=0; i<teacherdata[0].Teacher_name.length; i++){
				// 	response="<option>"+teacherdata[0].Teacher_name+"</option>";
				// }
				// res.send({list_teacher: response, list_chapter: });

				
			});
		//});
	});
});


app.get('/lectures_kalyan', (req, res) => {
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	course = urlparam.query.course;


	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		var dbo1=db.db("course_details");
		var dbo2= db.db("teacher_details");

		
		dbo.collection("students_kalyan").find().toArray(function(err, studentdata){
			dbo1.collection("courses").find().toArray(function(err, coursedata){
				

				//dbo2.collection("teachers").find({_id: ObjectId(courseid)}).toArray(function(err, teacherdata){
					// console.log(teacherdata);
					//console.log(coursedata);
					// console.log(studentdata);

					res.render("lectures/addlecture_kalyan.hbs",{
						viewTitle: "Schedule Lecture",
						// list_teacher: teacherdata,
						list_course: coursedata,
						list_student: studentdata,
						// list_chapter: coursedata
					});
					
				//})
			});
			
		});
	});
});




app.post('/lectures_kalyan', (req, res) => {
	var student_name = req.body.student;
	var course_name = req.body.course;
	var teacher_name = req.body.teacher;
	var course_name = req.body.course;
	var date = req.body.date;
	var stime = req.body.stime;
	var etime = req.body.etime;
	var chapter_name = req.body.chapter;
	var status= req.body.status;
	var lec_id = req.body._id;
	// var course_info = req.body;
	// console.log(course_info);
	var url="mongodb://localhost:27017/";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("lecture_details");
		if(req.body._id == ''){
			// function insertRecord(req, res) {
				var obj={
					Student_name: student_name,
					Course_name: course_name,
					Teacher_name: teacher_name,
					Date: date,
					Start_Time: stime,
					End_Time: etime,
					Chapter_name: chapter_name,
					Status: status,
				};
				dbo.collection("lectures_kalyan").insert(obj, function(req, data){
					if (!err){
						res.redirect('/list_lecturekalyan');
					}else{
						if (err.name == 'ValidationError') {
							handle1ValidationError(err, req.body);
							res.render("lectures/addlecture_kalyan.hbs", {
								viewTitle: "Schedule Lecture",
								lecture: req.body
							});
						}else{
							console.log('Error during record insertion : ' + err);
						}
					}
				});
		}
	});
});



app.get('/list_lecturekalyan', (req, res) => {
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("lecture_details");
		dbo.collection("lectures_kalyan").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("lectures/list_lecturekalyan.hbs", {
					list_lecture: docs
			});
			}else {
				console.log('Error in retrieving lecture list :' + err);
			}
		});
	});
});

app.get('/lectureskalyan/delete/:id', (req, res) => {
	var url="mongodb://localhost:27017/";
	var id = req.params.id;
	//console.log(req.params.id)
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("lecture_details");
		dbo.collection("lectures_kalyan").deleteOne({_id: ObjectId(req.params.id)}, function(err, docs){
			if (!err) {
				res.redirect('/list_lecturekalyan');
			}
			else { console.log('Error in student delete :' + err); }
		});
	});
});

app.get('/lectureupdate_kalyan', (req,res)=>{
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	lectureid = urlparam.query.id;

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		var dbo1=db.db("course_details");
		var dbo2= db.db("teacher_details");
		var dbo3=db.db("lecture_details");

		
		dbo.collection("students_kalyan").find().toArray(function(err, studentdata){
			dbo1.collection("courses").find().toArray(function(err, coursedata){
				//dbo2.collection("teachers_kalwa").find().toArray(function(err, teacherdata){
					dbo3.collection("lectures_kalyan").find({_id: ObjectId(lectureid)}).toArray(function(err,data){
						if(data.length!=0){

							res.render("lectures/update_lecturekalyan.hbs",{
								viewTitle: "Update Lecture Details",
								//list_teacher: teacherdata,
								list_course: coursedata,
								list_student: studentdata,
								//list_chapter: coursedata,
								lecture:{
									student : data[0].Student_name,
									course: data[0].Course_name,
									teacher: data[0].Teacher_name,
									date: data[0].Date,
									stime: data[0].Start_Time,
									etime: data[0].End_Time,
									chapter: data[0].Chapter_name,
									status: data[0].Status,

								}
							})
						}else{
							res.render("lectures/addlecture_kalyan.hbs",{
								viewTitle: "Insert Course Details"
							});
						}
					});
				//});
			});
		});
	});
});
			
app.post('/lectureupdate_kalyan', (req, res)=>{
	var url="mongodb://localhost:27017";
	let query={
		_id:ObjectId(lectureid)
	}

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("lecture_details");
		let docobj = {
			$set:{
				Student_name: req.body.student,
				Course_name: req.body.course,
				Teacher_name: req.body.teacher,
				Date: req.body.date,
				Start_Time: req.body.stime,
				End_Time: req.body.etime,
				Chapter_name: req.body.chapter,
				Status: req.body.status,
			}
		}
		dbo.collection("lectures_kalyan").updateOne(query, docobj, function(err, docs){
				// console.log(docs)
				if (!err){ res.redirect('/list_lecturekalyan'); }
				else {
					if (err.name == 'ValidationError') {
						handle1ValidationError(err, req.body);
						res.render("lectures/update_lecturekalyan.hbs", {
							viewTitle: 'Update Lecture Details',
							course: docobj
						});
					}else{
						console.log('Error during record update : ' + err);
					}

				}
		});
	});
});



////////////////////// VASHI BRANCH ////////////////////////////////////////

app.get("/lecturesvashi/:course", function(req, res){
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo2=db.db("teacher_details");

		dbo2.collection("teachers_vashi").find({Course_name: req.params.course}).toArray(function(err, teacherdata){
			//dbo1.collection("courses").find({Course_name: req.params.course}).toArray(function(err, coursedata){
				console.log(teacherdata);
				//console.log(coursedata);


				res.render("lectures/addlecture_vashi.hbs",{
					viewTitle: "Schedule Lecture",
					list_teacher: teacherdata,
					
				});
				// var response="";
				// for(i=0; i<teacherdata[0].Teacher_name.length; i++){
				// 	response="<option>"+teacherdata[0].Teacher_name+"</option>";
				// }
				// res.send({list_teacher: response, list_chapter: });

				
			//});
		});
	});
});


app.get("/lecturesvashi/chapters/:course", function(req, res){
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo1=db.db("course_details");
		//var dbo2=db.db("teacher_details");

		//dbo2.collection("teachers").find({Course_name: req.params.course}).toArray(function(err, teacherdata){
			dbo1.collection("courses").find({Course_name: req.params.course}).toArray(function(err, coursedata){
				//console.log(teacherdata);
				console.log(coursedata);


				res.render("lectures/addlecture_vashi.hbs",{
					viewTitle: "Schedule Lecture",
					//list_teacher: teacherdata,
					list_chapter: coursedata

				});
				// var response="";
				// for(i=0; i<teacherdata[0].Teacher_name.length; i++){
				// 	response="<option>"+teacherdata[0].Teacher_name+"</option>";
				// }
				// res.send({list_teacher: response, list_chapter: });

				
			});
		//});
	});
});


app.get('/lectures_vashi', (req, res) => {
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	course = urlparam.query.course;


	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		var dbo1=db.db("course_details");
		var dbo2= db.db("teacher_details");

		
		dbo.collection("students_vashi").find().toArray(function(err, studentdata){
			dbo1.collection("courses").find().toArray(function(err, coursedata){
				

				//dbo2.collection("teachers").find({_id: ObjectId(courseid)}).toArray(function(err, teacherdata){
					// console.log(teacherdata);
					//console.log(coursedata);
					// console.log(studentdata);

					res.render("lectures/addlecture_vashi.hbs",{
						viewTitle: "Schedule Lecture",
						// list_teacher: teacherdata,
						list_course: coursedata,
						list_student: studentdata,
						// list_chapter: coursedata
					});
					
				//})
			});
			
		});
	});
});




app.post('/lectures_vashi', (req, res) => {
	var student_name = req.body.student;
	var course_name = req.body.course;
	var teacher_name = req.body.teacher;
	var course_name = req.body.course;
	var date = req.body.date;
	var stime = req.body.stime;
	var etime = req.body.etime;
	var chapter_name = req.body.chapter;
	var status= req.body.status;
	var lec_id = req.body._id;
	// var course_info = req.body;
	// console.log(course_info);
	var url="mongodb://localhost:27017/";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("lecture_details");
		if(req.body._id == ''){
			// function insertRecord(req, res) {
				var obj={
					Student_name: student_name,
					Course_name: course_name,
					Teacher_name: teacher_name,
					Date: date,
					Start_Time: stime,
					End_Time: etime,
					Chapter_name: chapter_name,
					Status: status,
				};
				dbo.collection("lectures_vashi").insert(obj, function(req, data){
					if (!err){
						res.redirect('/list_lecturevashi');
					}else{
						if (err.name == 'ValidationError') {
							handle1ValidationError(err, req.body);
							res.render("lectures/addlecture_vashi.hbs", {
								viewTitle: "Schedule Lecture",
								lecture: req.body
							});
						}else{
							console.log('Error during record insertion : ' + err);
						}
					}
				});
		}
	});
});



app.get('/list_lecturevashi', (req, res) => {
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("lecture_details");
		dbo.collection("lectures_vashi").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("lectures/list_lecturevashi.hbs", {
					list_lecture: docs
			});
			}else {
				console.log('Error in retrieving lecture list :' + err);
			}
		});
	});
});

app.get('/lecturesvashi/delete/:id', (req, res) => {
	var url="mongodb://localhost:27017/";
	var id = req.params.id;
	//console.log(req.params.id)
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("lecture_details");
		dbo.collection("lectures_vashi").deleteOne({_id: ObjectId(req.params.id)}, function(err, docs){
			if (!err) {
				res.redirect('/list_lecturevashi');
			}
			else { console.log('Error in student delete :' + err); }
		});
	});
});

app.get('/lectureupdate_vashi', (req,res)=>{
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	lectureid = urlparam.query.id;

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		var dbo1=db.db("course_details");
		var dbo2= db.db("teacher_details");
		var dbo3=db.db("lecture_details");

		
		dbo.collection("students_vashi").find().toArray(function(err, studentdata){
			dbo1.collection("courses").find().toArray(function(err, coursedata){
				//dbo2.collection("teachers_vashi").find().toArray(function(err, teacherdata){
					dbo3.collection("lectures_vashi").find({_id: ObjectId(lectureid)}).toArray(function(err,data){
						if(data.length!=0){

							res.render("lectures/update_lecturevashi.hbs",{
								viewTitle: "Update Lecture Details",
								//list_teacher: teacherdata,
								list_course: coursedata,
								list_student: studentdata,
								//list_chapter: coursedata,
								lecture:{
									student : data[0].Student_name,
									course: data[0].Course_name,
									teacher: data[0].Teacher_name,
									date: data[0].Date,
									stime: data[0].Start_Time,
									etime: data[0].End_Time,
									chapter: data[0].Chapter_name,
									status: data[0].Status,

								}
							})
						}else{
							res.render("lectures/addlecture_vashi.hbs",{
								viewTitle: "Insert Course Details"
							});
						}
					});
				//});
			});
		});
	});
});
			
app.post('/lectureupdate_vashi', (req, res)=>{
	var url="mongodb://localhost:27017";
	let query={
		_id:ObjectId(lectureid)
	}

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("lecture_details");
		let docobj = {
			$set:{
				Student_name: req.body.student,
				Course_name: req.body.course,
				Teacher_name: req.body.teacher,
				Date: req.body.date,
				Start_Time: req.body.stime,
				End_Time: req.body.etime,
				Chapter_name: req.body.chapter,
				Status: req.body.status,
			}
		}
		dbo.collection("lectures_vashi").updateOne(query, docobj, function(err, docs){
				// console.log(docs)
				if (!err){ res.redirect('/list_lecturevashi'); }
				else {
					if (err.name == 'ValidationError') {
						handle1ValidationError(err, req.body);
						res.render("lectures/update_lecturevashi.hbs", {
							viewTitle: 'Update Lecture Details',
							course: docobj
						});
					}else{
						console.log('Error during record update : ' + err);
					}

				}
		});
	});
});



//////////////////////////PANVEL BRANCH//////////////////////////////////////////


app.get("/lecturespanvel/:course", function(req, res){
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo2=db.db("teacher_details");

		dbo2.collection("teachers_panvel").find({Course_name: req.params.course}).toArray(function(err, teacherdata){
			//dbo1.collection("courses").find({Course_name: req.params.course}).toArray(function(err, coursedata){
				console.log(teacherdata);
				//console.log(coursedata);


				res.render("lectures/addlecture_panvel.hbs",{
					viewTitle: "Schedule Lecture",
					list_teacher: teacherdata,
					
				});
				// var response="";
				// for(i=0; i<teacherdata[0].Teacher_name.length; i++){
				// 	response="<option>"+teacherdata[0].Teacher_name+"</option>";
				// }
				// res.send({list_teacher: response, list_chapter: });

				
			//});
		});
	});
});


app.get("/lecturespanvel/chapters/:course", function(req, res){
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo1=db.db("course_details");
		//var dbo2=db.db("teacher_details");

		//dbo2.collection("teachers").find({Course_name: req.params.course}).toArray(function(err, teacherdata){
			dbo1.collection("courses").find({Course_name: req.params.course}).toArray(function(err, coursedata){
				//console.log(teacherdata);
				console.log(coursedata);


				res.render("lectures/addlecture_panvel.hbs",{
					viewTitle: "Schedule Lecture",
					//list_teacher: teacherdata,
					list_chapter: coursedata

				});
				// var response="";
				// for(i=0; i<teacherdata[0].Teacher_name.length; i++){
				// 	response="<option>"+teacherdata[0].Teacher_name+"</option>";
				// }
				// res.send({list_teacher: response, list_chapter: });

				
			});
		//});
	});
});


app.get('/lectures_panvel', (req, res) => {
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	course = urlparam.query.course;


	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		var dbo1=db.db("course_details");
		var dbo2= db.db("teacher_details");

		
		dbo.collection("students_panvel").find().toArray(function(err, studentdata){
			dbo1.collection("courses").find().toArray(function(err, coursedata){
				

				//dbo2.collection("teachers").find({_id: ObjectId(courseid)}).toArray(function(err, teacherdata){
					// console.log(teacherdata);
					//console.log(coursedata);
					// console.log(studentdata);

					res.render("lectures/addlecture_panvel.hbs",{
						viewTitle: "Schedule Lecture",
						// list_teacher: teacherdata,
						list_course: coursedata,
						list_student: studentdata,
						// list_chapter: coursedata
					});
					
				//})
			});
			
		});
	});
});




app.post('/lectures_panvel', (req, res) => {
	var student_name = req.body.student;
	var course_name = req.body.course;
	var teacher_name = req.body.teacher;
	var course_name = req.body.course;
	var date = req.body.date;
	var stime = req.body.stime;
	var etime = req.body.etime;
	var chapter_name = req.body.chapter;
	var status= req.body.status;
	var lec_id = req.body._id;
	// var course_info = req.body;
	// console.log(course_info);
	var url="mongodb://localhost:27017/";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("lecture_details");
		if(req.body._id == ''){
			// function insertRecord(req, res) {
				var obj={
					Student_name: student_name,
					Course_name: course_name,
					Teacher_name: teacher_name,
					Date: date,
					Start_Time: stime,
					End_Time: etime,
					Chapter_name: chapter_name,
					Status: status,
				};
				dbo.collection("lectures_panvel").insert(obj, function(req, data){
					if (!err){
						res.redirect('/list_lecturepanvel');
					}else{
						if (err.name == 'ValidationError') {
							handle1ValidationError(err, req.body);
							res.render("lectures/addlecture_panvel.hbs", {
								viewTitle: "Schedule Lecture",
								lecture: req.body
							});
						}else{
							console.log('Error during record insertion : ' + err);
						}
					}
				});
		}
	});
});



app.get('/list_lecturepanvel', (req, res) => {
	var url="mongodb://localhost:27017";

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("lecture_details");
		dbo.collection("lectures_panvel").find().toArray(function(err, docs){
			db.close();
			if (!err) {
				res.render("lectures/list_lecturepanvel.hbs", {
					list_lecture: docs
			});
			}else {
				console.log('Error in retrieving lecture list :' + err);
			}
		});
	});
});

app.get('/lecturespanvel/delete/:id', (req, res) => {
	var url="mongodb://localhost:27017/";
	var id = req.params.id;
	//console.log(req.params.id)
	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("lecture_details");
		dbo.collection("lectures_panvel").deleteOne({_id: ObjectId(req.params.id)}, function(err, docs){
			if (!err) {
				res.redirect('/list_lecturepanvel');
			}
			else { console.log('Error in student delete :' + err); }
		});
	});
});

app.get('/lectureupdate_panvel', (req,res)=>{
	var url="mongodb://localhost:27017";
	urlparam = url1.parse(req.url, true);
	lectureid = urlparam.query.id;

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("students_details");
		var dbo1=db.db("course_details");
		var dbo2= db.db("teacher_details");
		var dbo3=db.db("lecture_details");

		
		dbo.collection("students_panvel").find().toArray(function(err, studentdata){
			dbo1.collection("courses").find().toArray(function(err, coursedata){
				//dbo2.collection("teachers_panvel").find().toArray(function(err, teacherdata){
					dbo3.collection("lectures_panvel").find({_id: ObjectId(lectureid)}).toArray(function(err,data){
						if(data.length!=0){

							res.render("lectures/update_lecturepanvel.hbs",{
								viewTitle: "Update Lecture Details",
								//list_teacher: teacherdata,
								list_course: coursedata,
								list_student: studentdata,
								//list_chapter: coursedata,
								lecture:{
									student : data[0].Student_name,
									course: data[0].Course_name,
									teacher: data[0].Teacher_name,
									date: data[0].Date,
									stime: data[0].Start_Time,
									etime: data[0].End_Time,
									chapter: data[0].Chapter_name,
									status: data[0].Status,

								}
							})
						}else{
							res.render("lectures/addlecture_panvel.hbs",{
								viewTitle: "Insert Course Details"
							});
						}
					});
				//});
			});
		});
	});
});
			
app.post('/lectureupdate_panvel', (req, res)=>{
	var url="mongodb://localhost:27017";
	let query={
		_id:ObjectId(lectureid)
	}

	MongoClient.connect(url, {useUnifiedTopology: true}, function(err, db){
		if(err) throw err;
		var dbo=db.db("lecture_details");
		let docobj = {
			$set:{
				Student_name: req.body.student,
				Course_name: req.body.course,
				Teacher_name: req.body.teacher,
				Date: req.body.date,
				Start_Time: req.body.stime,
				End_Time: req.body.etime,
				Chapter_name: req.body.chapter,
				Status: req.body.status,
			}
		}
		dbo.collection("lectures_panvel").updateOne(query, docobj, function(err, docs){
				// console.log(docs)
				if (!err){ res.redirect('/list_lecturepanvel'); }
				else {
					if (err.name == 'ValidationError') {
						handle1ValidationError(err, req.body);
						res.render("lectures/update_lecturepanvel.hbs", {
							viewTitle: 'Update Lecture Details',
							course: docobj
						});
					}else{
						console.log('Error during record update : ' + err);
					}

				}
		});
	});
});


		
//defining port
const PORT=process.env.PORT||4000;
app.listen(PORT,()=>{
	console.log(`app is live at ${PORT}`);
})
