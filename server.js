const express = require('express');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const bodyParser = require('body-parser');
const {check, validationResult} = require('express-validator')
const urlencodedParser = bodyParser.urlencoded({extended:false})
const path = require('path');
const mysql = require('mysql');
const xlsx = require('xlsx');
const app = express();
var dateObj =  new Date();
var month = dateObj.getUTCMonth() + 1; //months from 1-12
var day = dateObj.getUTCDate();
var year = dateObj.getUTCFullYear();
var date = day+"/"+month+"/"+year;
var router = express.Router()

//database 
const port = 3333
const connection = mysql.createConnection({
	host     : 'sql984.main-hosting.eu',
	user     : 'u734900206_capta',
	password : 'Leantech@8861',
	database : 'u734900206_capta'
});

//--------------------------set methods
app.set('view engine', 'ejs');

//--------------------------use methods

app.use(express.static(path.join(__dirname+'/public')));

app.use(session({
	secret: 'uiadadq313cda241df2r01849193',
	resave: true,
	saveUninitialized: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//------------------------get methods
app.get('/', (req, res) => {
  res.render(path.join(__dirname+'/index'));
});

app.get('/dashboard', (req, res) => {
	res.render(path.join(__dirname+'/dash/index'));
  });


app.get('/manage/add-module', (req, res) => {
	connection.query('SELECT * from institution',(err2,data)=>
		{
			if (err2){throw err2}else{
				res.render(path.join(__dirname+'/manage/add-module'),{data:data});
			}
		});
  });
  app.get('/manage/add-curriculum', (req, res) => {
	res.render(path.join(__dirname+'/manage/add-curriculum'));
  });

  app.get('/manage/module-confirmation-sheet', (req, res) => {
	connection.query('SELECT * FROM institution',(err, rows)=> {
		if (err) {
			throw err
		} else {
			
			res.render(path.join(__dirname+'/manage/module-confirmation-sheet'),{data:rows});
			}
	});
	
  });
app.get('/manage', (req, res) => {
	
	connection.query('SELECT COUNT(id) AS idcount from users Where role=1',(err2,total)=>
			{
				if (err2){throw err2}else{
					res.render(path.join(__dirname+'/dash/manage'),{count:total});
			
				}
			});
  });
app.get('/manage/manage-users', (req, res) => {
	connection.query('SELECT * FROM users',(err, rows)=> {
		if (err) {
			throw err
		} else {
			
				res.render(path.join(__dirname+'/manage/manage-user'),{data:rows});
			}
	});
  });
  
  app.get('/manage/manage-institution', (req, res) => {
	connection.query('SELECT * FROM institution',(err, rows)=> {
		if (err) {
			throw err
		} else {
			
				res.render(path.join(__dirname+'/manage/manage-institution'),{data:rows});
			}
	});
  });
app.get('/manage/add-user', (req, res) => {
	res.render(path.join(__dirname+'/manage/add-user'));
  });
app.get('/manage/add-institution', (req, res) => {
	res.render(path.join(__dirname+'/manage/add-institution'));
  });
//------------------------post methods
//login 
app.post('/login',(req, res) =>{
	let email = req.body.email;
	let password = req.body.password;
	 if (email && password) {
		connection.query('SELECT * FROM users WHERE email = ? AND pass = ?', [email, password], (error, results, fields)=>{

			if (error) throw error;
			if (results.length > 0) {
				req.session.loggedin = true;
				req.session.email = email;
				res.redirect('/dashboard');
			} else {
				res.render(path.join(__dirname+'/'),{message:'Invalid Email or Password'});
			}			
			res.end();
		});
	} else {
		res.render(path.join(__dirname+'/'),{message:'Please check all the input'});
		res.end();
	}
	//res.json(req.body);
});
//-----------add user details 
//helper 


app.post('/manage/add-user',(req, res) =>{
	 let name = req.body.username
	 let email = req.body.email
	 let phone = req.body.phone
	 let addr = req.body.addr
	 let city = req.body.city
	 let country = req.body.country
	 let pincode= req.body.pincode
	 let bname= req.body.bname
	 let bcode = req.body.bcode
	 let anumber = req.body.anumber
	 let ifsc = req.body.ifsc
	 let role = req.body.role
	 //file upload 
	 var pan = req.body.pan
	 var panname= req.body.pan
	 var adhar = req.body.adhar 
	 var resume = req.body.resume
	 var photo = req.body.photo
	 var salary = req.body.salary;
	 var type=""
	 if(req=='1'){
		type="Manager"
	 }else{
		type="Trainer"
	 }
	 var defaultpass= "123456"
	 //validate and add to trainer 
	 if ( name && email) {
		connection.query('Insert Into users(name,email,phone,address,city,country,postcode,bname,bcode,ifsc,anumber,role,type,cdate,pass,salary) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', 
		[name,email, phone,addr,city,country,pincode,bname,bcode,ifsc,anumber,role,type,date,defaultpass,salary], (error, results, fields)=>{
			if (error) throw error;
				req.session.loggedin = true;
				req.session.email = email;
				res.render(path.join(__dirname+'/manage/add-user'),{message:'User Addedd Sucessfully'});
				res.end();
		});
	} else {
		res.render(path.join(__dirname+'/manage/add-user'),{message:'Please Enter Valid Details'});
		res.end();
	//	const token = localStorage.getItem('token');
	}


	// req.body.pan.mv('/uploads/pan'+panname,(err)=>{
	// 	if(err){console.log(err)}
	//abhi@gmail_logo.png
	// 	else{
	// 		console.log("uploaded");
	// 	}

	// });
	//res.json(req.body);
});

///manage/add-institution
app.post('/manage/add-institution',(req, res) =>{
	console.log(req.body.length)
	if ( req.body['cname'] && req.body['tname']) {
		connection.query('Insert Into institution (cname,eamcet,pan,gst,email,phone,addr,city,pincode,country,tname,temail,tphone) values(?,?,?,?,?,?,?,?,?,?,?,?,?)', 
		[req.body['cname'],
		req.body['eamcet'],
		req.body['gst'],
		req.body['pan'],
		req.body['email'],
		req.body['phone'],
		req.body['addr'],
		req.body['city'],
		req.body['country'],
		req.body['pincode'],
		req.body['tname'],
		req.body['tphone'],
		req.body['tphone']], (error, results, fields)=>{
			if (error) throw error;
		
				res.render(path.join(__dirname+'/manage/add-institution'),{message:'Addedd Sucessfully'});
				res.end();
		});
	} else {
		res.render(path.join(__dirname+'/manage/add-institution'),{message:'Please Enter Valid Details'});
		res.end();
	//	const token = localStorage.getItem('token');
	}

});


app.post('/manage/add-curriculum',(req, res) =>{

	
	  const file = req.body.excel;
	
	  // Check if the uploaded file is an Excel file
	//   const allowedFileTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
	//   if (!allowedFileTypes.includes(file.mimetype)) {
	// 	res.render(path.join(__dirname+'/manage/add-curriculum'),{message:'Only Excel Sheet Allowed'});
	// 	res.end();
	//   }
	   // Move the file to the desired folder
  const filePath = '/uploads/excel' + file.name;
//   file.mv(filePath, (error) => {
//     if (error) {
//       console.error('Error uploading file:', error);
//     //   return res.status(500).send('Error uploading file.');
//     }

    console.log('File uploaded successfully.');
    // res.send('File uploaded successfully.');
//   });


	
	//res.json(req.body);
});
//----------------------helper functions 
app.post('/manage/module-confirmation-sheet', (req, res) => {
	const data = req.body;
	// Perform the MySQL insert operation

const {
  collgeName,
  pocName,
  designation,
  pocEmail,
  pocContact,
  address,
  suitableTransport,
  food,
  accommodation,
  localTransport,
  majorTransport,
  previousVendor,
  feedback,
  interest,
  day1Company,
  otherCompanies,
  moduleName,
  hoursPerBatch,
  modulesCovered,
  executionType,
  startDate,
  endDate,
  numStudents,
  numBatches,
  startpreferredTimings,
  endpreferredTimings,
  marketingPerson,
  marketingContact,
  marketingEmail,
  trainingManager,
  trainingContact,
  trainingEmail,
  unitBasis,
  unitCost,
  numUnits,
  totalCost,
  gst,
  grossIncome,
  tds,
  camount,
  instackExams,
  instackMonths,
  income,
  expenses,
  totalTrainingDays,
  perDayPerTrainer,
  totalContractValueBatch,
  totalTrainingHours,
  companySpecificHours,
  totalHours,
  perHourPerBatch,
  perDayPerBatch,
  totalStudents,
  totalBatches,
  totalContractValueCOIGN,
  numberOfTrainers,
  perHeadPerDay,
  numberOfDaysPerTrainer,
  portalCostPerStudent,
  numberOfStudents,
  travelling,
  commission,
  indirectExpenses,
  totalExpenses,
  totalProfit
  } = req.body;

const values = [collgeName,pocName,designation,pocEmail,pocContact,address,suitableTransport,food,accommodation,localTransport,
	majorTransport,previousVendor,feedback,interest,day1Company,otherCompanies,moduleName,hoursPerBatch,modulesCovered,
	executionType,
	startDate,
	endDate,
	numStudents,
	numBatches,
	startpreferredTimings,
	endpreferredTimings,
	marketingPerson,
	marketingContact,
	marketingEmail,
	trainingManager,
	trainingContact,
	trainingEmail,
	unitBasis,
	unitCost,
	numUnits,
	totalCost,
	gst,
	grossIncome,
	tds,
	camount,
	instackExams,
	instackMonths,
	income,
	expenses,
	totalTrainingDays,
	perDayPerTrainer,
	totalContractValueBatch,
	totalTrainingHours,
	companySpecificHours,
	totalHours,
	perHourPerBatch,
	perDayPerBatch,
	totalStudents,
	totalBatches,
	totalContractValueCOIGN,
	numberOfTrainers,
	perHeadPerDay,
	numberOfDaysPerTrainer,
	portalCostPerStudent,
	numberOfStudents,
	travelling,
	commission,
	indirectExpenses,
	totalExpenses,
	totalProfit
] 
console.log(values);
const query =`INSERT INTO module (
    collegeName,
    pocName,
    designation,
    pocEmail,
    pocContact,
    address,
    suitableTransport,
    food,
    accommodation,
    localTransport,
    majorTransport,
    previousVendor,
    feedback,
    interest,
    day1Company,
    otherCompanies,
    moduleName,
    hoursPerBatch,
    modulesCovered,
    executionType,
    startDate,
    endDate,
    numStudents,
    numBatches,
    startpreferredTimings,
    endpreferredTimings,
    marketingPerson,
    marketingContact,
    marketingEmail,
    trainingManager,
    trainingContact,
    trainingEmail,
    unitBasis,
    unitCost,
    numUnits,
    totalCost,
    gst,
    grossIncome,
    tds,
    camount,
    instackExams,
    instackMonths,
    income,
    expenses,
    totalTrainingDays,
    perDayPerTrainer,
    totalContractValueBatch,
    totalTrainingHours,
    companySpecificHours,
    totalHours,
    perHourPerBatch,
    perDayPerBatch,
    totalStudents,
    totalBatches,
    totalContractValueCOIGN,
    numberOfTrainers,
    perHeadPerDay,
    numberOfDaysPerTrainer,
    portalCostPerStudent,
    numberOfStudents,
    travelling,
    commission,
    indirectExpenses,
    totalExpenses,
    totalProfit
) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)`

  connection.query(query, values, (error, results) => {
	if (error) {
	  console.error('Error inserting data:', error);
	  return;
	}
	res.render(path.join(__dirname+'/manage/module-confirmation-sheet'),{message:'Added Successfully'});
  });
});  
app.post('/trainer/day-work', (req, res) => {
	// Retrieve the form data from the request body
	const formData = req.body;
  
	// Insert query
	const query = 'INSERT INTO training SET ?';
  
	// Execute the query with the form data
	connection.query(query, formData, (error, results, fields) => {
	  if (error) {
		console.error('Error occurred during insertion:', error);
		res.render(path.join(__dirname+'/trainer/day-work'),{message:'Server Error '});
	  } else {
		res.render(path.join(__dirname+'/trainer/day-work'),{message:'Submitted Successfully'});
	  }
	});
  });
app.get('/trainer/day-work', (req, res) => {
	res.render(path.join(__dirname+'/trainer/day-work'));
	
  });
//end
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})
