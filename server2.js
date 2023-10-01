const express = require('express');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const bodyParser = require('body-parser');
const {check, validationResult} = require('express-validator')
const urlencodedParser = bodyParser.urlencoded({extended:false})
const path = require('path');
const mongoose = require('mongoose');
const { GridFSBucket, ObjectID } = require('mongodb');
const { Readable } = require('stream');
const bcrypt = require('bcrypt');
const xlsx = require('xlsx');
const app = express();
var dateObj =  new Date();
var month = dateObj.getUTCMonth() + 1; //months from 1-12
var day = dateObj.getUTCDate();
var year = dateObj.getUTCFullYear();
var date = day+"/"+month+"/"+year;
var router = express.Router()
const { Institution,User,Module,Curriculum } = require('./models/schema'); 


//database 
const port = 3333
// Set up MongoDB connection
mongoose.connect('mongodb+srv://jinxforever8341:iZ4rHLYSTCGpLeWg@cluster0.ur01jol.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB Atlas');
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
app.use(fileUpload());


//------------------------get methods
app.get('/', (req, res) => {
    res.render(path.join(__dirname+'/index'));
  });


app.get('/dashboard', (req, res) => {
	res.render(path.join(__dirname+'/dash/index'));
});

app.get('/manage/add-module', async (req, res) => {
    try {
      // Use Mongoose to retrieve data from the MongoDB collection 'institutions'
      const data = await Institution.find();
      const curriculim = await Curriculum.find();
      
  
      // Render your template with the MongoDB data
      res.render(path.join(__dirname, '/manage/add-module'), { data,curriculim });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

app.get('/manage/add-curriculum', (req, res) => {
    res.render(path.join(__dirname+'/manage/add-curriculum'));
  });

// Assuming you have the 'Institution' model defined in 'models/Institution.js'

app.get('/manage/module-confirmation-sheet', async (req, res) => {
  try {
    // Use Mongoose to retrieve data from the MongoDB 'Institution' collection
    const institutions = await Institution.find();

    // Check if a success message exists in the session
    const successMessage = req.session.successMessage;
    
    // Clear the success message from the session
    delete req.session.successMessage;

    // Render your template with the MongoDB data and the success message
    res.render(path.join(__dirname, '/manage/module-confirmation-sheet'), {
      data: institutions,
      message: successMessage,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route handler for /manage/manage-users
app.get('/manage/manage-users', async (req, res) => {
    try {
      // Use Mongoose to retrieve all users
      const users = await User.find();
      
      // Render the 'manage-user' template and pass the retrieved users as data
      res.render(path.join(__dirname, '/manage/manage-user'), { data: users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Route handler for /manage/manage-institution
  app.get('/manage/manage-institution', async (req, res) => {
    try {
      // Use Mongoose to retrieve all institutions
      const institutions = await Institution.find();
  
      // Render the 'manage-institution' template and pass the retrieved institutions as data
      res.render(path.join(__dirname, '/manage/manage-institution'), { data: institutions });
    } catch (error) {
      console.error('Error fetching institutions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

app.get('/manage', async (req, res) => {
    try {
      // Count the number of users with role 1 in the MongoDB collection
      const user = await User.countDocuments({ role: "1" });
      const institution=await Institution.countDocuments({});
      const module = await Module.countDocuments({});
      console.log(user,institution,module);
      res.render(path.join(__dirname + '/dash/manage'), { user,institution,module });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
    
app.get('/manage/add-user', (req, res) => {
	res.render(path.join(__dirname+'/manage/add-user'));
  });

app.get('/manage/add-institution', (req, res) => {
	res.render(path.join(__dirname+'/manage/add-institution'));
  });

app.get('/trainer/day-work', (req, res) => {
    res.render(path.join(__dirname+'/trainer/day-work'));
    
  });

//------------------------post methods

app.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    if (email && password) {
      const user = await User.findOne({ email });

      if (user) {
        const passwordMatch = await compare(password, user.pass);

        if (passwordMatch) {
          req.session.loggedin = true;
          req.session.email = email;
          res.redirect('/dashboard');
        } else {
          res.render(path.join(__dirname + '/'), {
            message: 'Invalid Email or Password',
          });
        }
      } else {
        res.render(path.join(__dirname + '/'), {
          message: 'Invalid Email or Password',
        });
      }
    } else {
      res.render(path.join(__dirname + '/'), { message: 'Please check all the input' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/manage/add-user', async (req, res) => {
  try {
    // Check if any files were uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      console.log(req.files,req.body);
      return res.status(400).send('No files were uploaded.');
    }

    // Parse form data and file uploads
    const { username, email, phone, addr, city, country, pincode, bname, bcode, anumber, ifsc, role, salary, type } = req.body;

    // Handle file uploads
    const { resume, adhar, pan, photo } = req.files;
    console.log('Uploaded files:', req.files); // Log the uploaded files

      // Create a new user record and save it to MongoDB using mongoose
    const user = new User({
      username,
      email,
      phone,
      addr,
      city,
      country,
      pincode,
      bname,
      bcode,
      anumber,
      ifsc,
      role,
      cdate: date,
      pass: '123456', // Set the default password as needed
      salary,
    });
    if (role === "2") {
      user.type = type;
      await user.save();
    }

    // Save the user data to MongoDB
    await user.save();

    // Now, handle file uploads and store them using GridFS
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads', // Specify your GridFS bucket name
    });

    const uploadFileToGridFS = async (fileInfo) => {
      return new Promise((resolve, reject) => {
        const { name, data } = fileInfo;
    
        // Create a readable stream from the buffer
        const fileStream = new Readable();
        fileStream.push(data);
        fileStream.push(null); // Signal the end of the stream
    
        const uploadStream = bucket.openUploadStream(name);
        fileStream.pipe(uploadStream)
          .on('error', reject)
          .on('finish', () => {
            resolve(uploadStream.id);
          });
      });
    };
    // Upload files and get their ObjectIDs
    const [resumeID, adharID, panID, photoID] = await Promise.all([
      uploadFileToGridFS(resume),
      uploadFileToGridFS(adhar),
      uploadFileToGridFS(pan),
      uploadFileToGridFS(photo),
    ]);

    // Update the user record with GridFS ObjectIDs
    user.resume = resumeID;
    user.adhar = adharID;
    user.pan = panID;
    user.photo = photoID;
    
    // Save the user data again to include GridFS ObjectIDs
    await user.save();

    res.render(path.join(__dirname + '/manage/add-user'), {
      message: 'User Added Successfully',
    });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/manage/add-institution', async (req, res) => {
  try {
    // Create a new instance of the Institution model with data from the request body
    const institutionData = new Institution({
      cname: req.body['cname'],
      eamcet: req.body['eamcet'],
      pan: req.body['pan'],
      gst: req.body['gst'],
      email: req.body['email'],
      phone: req.body['phone'],
      addr: req.body['addr'],
      city: req.body['city'],
      pincode: req.body['pincode'],
      country: req.body['country'],
      tname: req.body['tname'],
      temail: req.body['temail'],
      tphone: req.body['tphone'],
    });

    // Save the institution data to MongoDB
    const savedInstitution = await institutionData.save();

    // Render a success message
    res.render(path.join(__dirname, '/manage/add-institution'), { message: 'Added Successfully' });
  } catch (error) {
    console.error('Error adding institution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/manage/module-confirmation-sheet', async (req, res) => {
  const data = req.body;
  console.log(data);

  try {
    const newModule = new Module(data); 

    await newModule.save(); 

    // Store the success message in the session
    req.session.successMessage = 'Added Successfully';

    // Redirect to the GET route
    res.redirect('/manage/module-confirmation-sheet');
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).send('Error inserting data');
  }
});


app.post('/manage/add-curriculum', async (req, res) => {
  try {
    // Check if an Excel file was uploaded
    if (!req.files || !req.files.excel) {
      return res.status(400).send('No Excel file was uploaded.');
    }

    // Parse form data
    const { cname, hours, days } = req.body;

    // Handle the Excel file upload
    const { excel } = req.files; // Access the file using the correct field name "excel"
    const excelMimeType = mime.lookup(excel.name);
    if (
      excelMimeType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
      excelMimeType !== 'application/vnd.ms-excel'
    ) {
      return res.status(400).send('Uploaded file is not an Excel file.');
    }
    // Store the Excel file in MongoDB using GridFS
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads', 
    });

    const uploadExcelToGridFS = async (fileInfo) => {
      return new Promise((resolve, reject) => {
        const { name, data } = fileInfo;

        // Create a readable stream from the buffer
        const fileStream = new Readable();
        fileStream.push(data);
        fileStream.push(null); // Signal the end of the stream

        const uploadStream = bucket.openUploadStream(name);
        fileStream.pipe(uploadStream)
          .on('error', reject)
          .on('finish', () => {
            resolve(uploadStream.id);
          });
      });
    };

    // Upload the Excel file and get its ObjectID
    const excelID = await uploadExcelToGridFS(excel);

    // Create a new curriculum record and save it to MongoDB
    const curriculum = new Curriculum({
      name: cname,
      totalHours: hours,
      totalDays: days,
      excel: excelID, // Store the GridFS file ID for the uploaded Excel file
    });

    await curriculum.save();

    res.render(path.join(__dirname + '/manage/add-curriculum'), {
      message: 'Curriculum Added Successfully',
    });
  } catch (error) {
    console.error('Error adding curriculum:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//end
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  })