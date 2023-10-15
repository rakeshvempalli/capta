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
const mimeTypes = require('mime-types');
const app = express();
var dateObj =  new Date();
var month = dateObj.getUTCMonth() + 1; //months from 1-12
var day = dateObj.getUTCDate();
var year = dateObj.getUTCFullYear();
var date = day+"/"+month+"/"+year;
var router = express.Router()
const { Institution,User,Module,Curriculum,Session,College } = require('./models/schema'); 


//database 
const port = 3333
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
      const data = await Institution.find();
      const curriculim = await Curriculum.find();
      
  
      res.render(path.join(__dirname, '/manage/add-module'), { data,curriculim });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

app.get('/manage/add-curriculum', (req, res) => {
    res.render(path.join(__dirname+'/manage/add-curriculum'));
  });


app.get('/manage/module-confirmation-sheet', async (req, res) => {
  try {
    const institutions = await Institution.find();

    const successMessage = req.session.successMessage;
    
    delete req.session.successMessage;

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
      const users = await User.find();
      
      res.render(path.join(__dirname, '/manage/manage-user'), { data: users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Route handler for /manage/manage-institution
  app.get('/manage/manage-institution', async (req, res) => {
    try {
      const institutions = await Institution.find();
  
      res.render(path.join(__dirname, '/manage/manage-institution'), { data: institutions });
    } catch (error) {
      console.error('Error fetching institutions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

app.get('/manage', async (req, res) => {
    try {
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

app.get('/manage/session-management', (req, res) => {
    res.render(path.join(__dirname+'/manage/session-management'));
    
  });

app.get('/manage/add-college-data', (req, res) => {
    res.render(path.join(__dirname+'/manage/add-college-data'));
    
  });

app.get('/manage/session-display', async (req, res) => {
    try {
      const sessions = await Session.find(); 
      const successMessage = req.session.successMessage;
    
      delete req.session.successMessage;

      res.render(path.join(__dirname + '/manage/session-display'), { sessions , message: successMessage,});
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/edit-session/:id', (req, res) => {
    const sessionId = req.params.id;
    console.log(sessionId);
    Session.findById(sessionId)
      .then(session => {
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }
        res.render(path.join(__dirname + '/manage/edit-session'), { session });
      })
      .catch(error => {
        res.status(500).json({ error: 'Error finding session' });
      });
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
    if (!req.files || Object.keys(req.files).length === 0) {
      console.log(req.files,req.body);
      return res.status(400).send('No files were uploaded.');
    }

    const { username, email, phone, addr, city, country, pincode, bname, bcode, anumber, ifsc, role, salary, type } = req.body;

    const { resume, adhar, pan, photo } = req.files;
    console.log('Uploaded files:', req.files); 

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

    await user.save();

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads', 
    });

    const uploadFileToGridFS = async (fileInfo) => {
      return new Promise((resolve, reject) => {
        const { name, data } = fileInfo;
    
        const fileStream = new Readable();
        fileStream.push(data);
        fileStream.push(null); 
    
        const uploadStream = bucket.openUploadStream(name);
        fileStream.pipe(uploadStream)
          .on('error', reject)
          .on('finish', () => {
            resolve(uploadStream.id);
          });
      });
    };
    const [resumeID, adharID, panID, photoID] = await Promise.all([
      uploadFileToGridFS(resume),
      uploadFileToGridFS(adhar),
      uploadFileToGridFS(pan),
      uploadFileToGridFS(photo),
    ]);

    user.resume = resumeID;
    user.adhar = adharID;
    user.pan = panID;
    user.photo = photoID;
    
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

    const savedInstitution = await institutionData.save();

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

    req.session.successMessage = 'Added Successfully';

    res.redirect('/manage/module-confirmation-sheet');
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).send('Error inserting data');
  }
});


app.post('/manage/add-curriculum', async (req, res) => {
  try {
    if (!req.files || !req.files.excel) {
      return res.status(400).send('No Excel file was uploaded.');
    }

    const { cname, hours, days } = req.body;

    const { excel } = req.files; 
    const excelMimeType = mimeTypes.lookup(excel.name);
    if (
      excelMimeType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
      excelMimeType !== 'application/vnd.ms-excel'
    ) {
      return res.status(400).send('Uploaded file is not an Excel file.');
    }
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads', 
    });

    const uploadExcelToGridFS = async (fileInfo) => {
      return new Promise((resolve, reject) => {
        const { name, data } = fileInfo;

        const fileStream = new Readable();
        fileStream.push(data);
        fileStream.push(null);

        const uploadStream = bucket.openUploadStream(name);
        fileStream.pipe(uploadStream)
          .on('error', reject)
          .on('finish', () => {
            resolve(uploadStream.id);
          });
      });
    };

    const excelID = await uploadExcelToGridFS(excel);

    const curriculum = new Curriculum({
      name: cname,
      totalHours: hours,
      totalDays: days,
      excel: excelID, 
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

app.post('/manage/add-college-data', async (req, res) => {
  try {
    if (!req.files || !req.files.excel) {
      return res.status(400).send('No Excel file was uploaded.');
    }

    const excelFile = req.files.excel;

    const workbook = xlsx.read(excelFile.data);

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const jsonData = xlsx.utils.sheet_to_json(sheet);
    console.log(jsonData);
    const result = await College.insertMany(jsonData);

    console.log('Data inserted into MongoDB:', result.length, 'records');
    res.send('Excel file uploaded, and data inserted into MongoDB.');
  } catch (err) {
    console.error('Error inserting data into MongoDB:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// app.post('/manage/add-college-data', async (req, res) => {
//   try {
//     if (!req.files || !req.files.excel) {
//       return res.status(400).send('No Excel file was uploaded.');
//     }

//     const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
//       bucketName: 'uploads',
//     });
//     const {name} = req.body;
//     const { excel } = req.files;
//     const excelMimeType = mimeTypes.lookup(excel.name);


//     if (
//       excelMimeType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
//       excelMimeType !== 'application/vnd.ms-excel'
//     ) {
//       return res.status(400).send('Uploaded file is not an Excel file.');
//     }

//     const uploadExcelToGridFS = async (fileInfo) => {
//       return new Promise((resolve, reject) => {
//         const { name, data } = fileInfo;

//         const fileStream = new Readable();
//         fileStream.push(data);
//         fileStream.push(null);

//         const uploadStream = bucket.openUploadStream(name);
//         fileStream.pipe(uploadStream)
//           .on('error', reject)
//           .on('finish', () => {
//             resolve(uploadStream.id);
//           });
//       });
//     };

//     const excelID = await uploadExcelToGridFS(excel);
//     const college = new College({
//       cname: name,
//       excel: excelID, 
//     });

//     await college.save();

//     res.render(path.join(__dirname + '/manage/add-college-data'), {
//       message: 'Excel file uploaded successfully',
//     });
//   } catch (error) {
//     console.error('Error uploading Excel file:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

app.post('/manage/session-management', async (req, res) => {
  try {
    const { session_name, session_date, session_time, session_location, session_trainer } = req.body;

    const newSession = new Session({
      session_name,
      session_date,
      session_time,
      session_location,
      session_trainer,
    });

    await newSession.save();
    res.render(path.join(__dirname + '/manage/session-management'), {
      message: 'Session Added Successfully',
    });
  } catch (error) {
    console.error('Error adding session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/update-session/:id', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    for (const key in req.body) {
      if (session[key] !== undefined) {
        session[key] = req.body[key];
      }
    }
    await session.save();

    req.session.successMessage = 'updated Successfully';

    res.redirect('/manage/session-display');
    } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

//------------------------delete methods

app.delete('/delete-session/:id', (req, res) => {
  const sessionId = req.params.id; 

  Session.findByIdAndRemove(sessionId)
    .then(deletedSession => {
      if (!deletedSession) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.json({ message: 'Session deleted successfully' });
    })
    .catch(error => {
      res.status(500).json({ error: 'Error deleting session' });
    });
});





//end
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  })