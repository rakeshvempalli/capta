// models/Institution.js
const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  cname: String,
  eamcet: String,
  pan: String,
  gst: String,
  email: String,
  phone: String,
  addr: String,
  city: String,
  pincode: String,
  country: String,
  tname: String,
  temail: String,
  tphone: String,
});

const Institution = mongoose.model('Institution', institutionSchema);

// models/user.js

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  phone: String,
  addr: String,
  city: String,
  country: String,
  pincode: String,
  bname: String,
  bcode: String,
  anumber: String,
  ifsc: String,
  role: String,
  type: String,
  cdate: String,
  pass: String,
  salary: Number,
  resume: mongoose.Schema.Types.ObjectId, // Reference to the Resume file in GridFS
  adhar: mongoose.Schema.Types.ObjectId, // Reference to the Adhar file in GridFS
  pan: mongoose.Schema.Types.ObjectId,   // Reference to the Pan file in GridFS
  photo: mongoose.Schema.Types.ObjectId, // Reference to the Photo file in GridFS
});

const User = mongoose.model('User', userSchema);

const moduleSchema = new mongoose.Schema({
  collegeName: String,
  pocName: String,
  designation: String,
  pocEmail: String,
  pocContact: String,
  address: String,
  suitableTransport: String,
  food: String,
  accommodation: String,
  localTransport: String,
  majorTransport: String,
  previousVendor: String,
  feedback: String,
  interest: String,
  day1Company: String,
  otherCompanies: String,
  moduleName: String,
  hoursPerBatch: String,
  modulesCovered: String,
  executionType: String,
  startDate: Date,
  endDate: Date,
  numStudents: Number,
  numBatches: Number,
  startpreferredTimings: String,
  endpreferredTimings: String,
  marketingPerson: String,
  marketingContact: String,
  marketingEmail: String,
  trainingManager: String,
  trainingContact: String,
  trainingEmail: String,
  unitBasis: String,
  unitCost: Number,
  numUnits: Number,
  totalCost: Number,
  gst: Number,
  grossIncome: Number,
  tds: Number,
  camount: Number,
  instackExams: String,
  instackMonths: String,
  income: Number,
  expenses: Number,
  totalDaysTraining: Number,//check
  perDayPerTrainer: Number,
  totalContractValueBatch: Number,
  totalTrainingHours: Number,
  companySpecificHours: Number,
  totalHours: Number,
  perHourPerBatch: Number,
  perDayPerBatch: Number,
  totalStudents: Number,
  totalBatches: Number,
  totalTrainingDays:Number,//check
  totalContractValueCOIGN: Number,
  numberOfTrainers: Number,
  perHeadPerDay: Number,
  numberOfDaysPerTrainer: Number,
  portalCostPerStudent: Number,
  numberOfStudents: Number,
  travelling: String,
  commission: Number,
  indirectExpenses: Number,
  totalExpenses: Number,
  totalProfit: Number,
});

const Module = mongoose.model('Module', moduleSchema);

const curriculumSchema = new mongoose.Schema({
  name: String,
  totalHours: Number,
  totalDays: Number,
  excel: String, // Store the GridFS file ID for the uploaded Excel file
});

const Curriculum = mongoose.model('Curriculum', curriculumSchema);

module.exports = { Institution,User,Module,Curriculum};

