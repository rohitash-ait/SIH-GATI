const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'gati-demo-secret';
const uploadDir = path.join(__dirname, '..', 'uploads');
const frontendDist = path.resolve(__dirname, '..', '..', 'frontend', 'dist');

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in production.');
}

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedOrigins = [
  ...(process.env.FRONTEND_URL || 'http://localhost:5173').split(','),
  process.env.RENDER_EXTERNAL_URL,
]
  .filter(Boolean)
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin is not allowed by CORS.'));
  },
}));
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(uploadDir));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'GATI' });
});

const users = [
  {
    id: 'user-applicant',
    name: 'Aarav Patil',
    email: 'applicant@gati.demo',
    password: 'password123',
    phone: '9876543210',
    role: 'APPLICANT',
    district: 'Pune',
    businessName: 'ABC Food Processing Unit',
    createdAt: '2026-06-18T09:00:00.000Z',
  },
  {
    id: 'user-officer',
    name: 'Sonal Deshmukh',
    email: 'officer@gati.demo',
    password: 'password123',
    phone: '8765432109',
    role: 'OFFICER',
    department: 'Industries',
    createdAt: '2026-06-20T10:00:00.000Z',
  },
  {
    id: 'user-admin',
    name: 'Vikram Rao',
    email: 'admin@gati.demo',
    password: 'password123',
    phone: '9988776655',
    role: 'ADMIN',
    createdAt: '2026-06-15T12:30:00.000Z',
  },
];

const project = {
  id: 'project-1',
  userId: 'user-applicant',
  businessName: 'ABC Food Processing Unit',
  businessType: 'Manufacturing',
  entityType: 'Private Limited',
  industry: 'Food Processing',
  subIndustry: 'Ready-to-eat foods',
  pan: 'ABCDE1234F',
  gstin: '27ABCDE1234F1Z9',
  udyam: 'UDYAM-MH-01-123456',
  district: 'Pune',
  taluka: 'Haveli',
  city: 'Pune',
  pin: '411057',
  industrialArea: 'Ranjangaon Industrial Area',
  landStatus: 'Owned',
  projectDescription: 'Food processing and packaging facility for ready-to-eat snacks',
  businessActivity: 'Processing and packaging',
  products: 'Instant snack mix, spice blends',
  capacity: '1200 MT per year',
  landInvestment: 4500000,
  buildingInvestment: 6200000,
  machinery: 14000000,
  workingCapital: 2400000,
  totalInvestment: 27100000,
  maleEmployment: 60,
  femaleEmployment: 32,
  otherEmployment: 8,
  directEmployment: 100,
  indirectEmployment: 45,
  powerRequirement: '500 kW',
  waterRequirement: '150 KL/day',
  wasteType: 'Solid waste & wastewater',
  emissionType: 'Low emissions',
  expectedStartDate: '2026-10-01',
  constructionStart: '2026-08-15',
  productionStart: '2027-02-01',
  completion: 68,
};

const approvals = [
  {
    id: 'factory-license',
    name: 'Factory License',
    department: 'Industries / Factory Inspectorate',
    category: 'Factory & Labour',
    why: 'Required for operating a factory and undertaking manufacturing activities.',
    processingTime: '15-30 days',
    sla: '30 days',
    fee: '₹1,500',
    validity: 'One year',
    prerequisites: ['Project plan', 'Identity proof', 'Land document', 'Machinery details'],
    requiredDocuments: ['Project plan', 'Identity proof', 'Land document', 'Machinery details'],
    dependency: 'Building Plan Approval',
    status: 'Required',
    description: 'Factory license for manufacturing facilities under industrial operations.',
    whoNeedsIt: 'Manufacturing units and processing plants',
    eligibility: 'Projects with production activity above threshold and compliant factory layout.',
    renewalFrequency: 'Annual renewal',
    processSteps: ['Submit application', 'Review document set', 'Site verification', 'Issue approval'],
    dependencies: ['Building Plan Approval'],
    risk: 'Medium',
  },
  {
    id: 'fire-safety',
    name: 'Fire Safety Approval',
    department: 'Fire Department',
    category: 'Fire & Safety',
    why: 'Ensures the facility meets fire safety and emergency preparedness standards.',
    processingTime: '10-20 days',
    sla: '20 days',
    fee: '₹2,200',
    validity: 'One year',
    prerequisites: ['Building layout', 'Fire extinguishing plan'],
    requiredDocuments: ['Building plan', 'Fire safety layout', 'Emergency drill plan'],
    dependency: 'Building Plan Approval',
    status: 'Required',
    description: 'Approval for fire safety equipment, exits, and emergency response arrangements.',
    whoNeedsIt: 'All manufacturing and processing arrangements with occupancy risk',
    eligibility: 'Buildings meeting fire code requirements',
    renewalFrequency: 'Annual',
    processSteps: ['Submit building plan', 'Inspection', 'NOC issuance'],
    dependencies: ['Building Plan Approval'],
    risk: 'High',
  },
  {
    id: 'pollution-consent',
    name: 'Pollution Consent',
    department: 'MPCB / Pollution Control Board',
    category: 'Pollution',
    why: 'Required for environmental compliance before operating the facility.',
    processingTime: '20-45 days',
    sla: '45 days',
    fee: '₹4,500',
    validity: 'Five years',
    prerequisites: ['Environmental impact details', 'Water and waste plan'],
    requiredDocuments: ['Consent application', 'Site plan', 'Waste management plan', 'Water balance chart'],
    dependency: 'Factory License',
    status: 'Required',
    description: 'Consent to establish and operate under environmental regulations.',
    whoNeedsIt: 'Industrial facilities producing process emissions or wastewater',
    eligibility: 'Units meeting pollution control design standards',
    renewalFrequency: 'Five years',
    processSteps: ['Application', 'Technical review', 'Inspection', 'Consent issuance'],
    dependencies: ['Factory License'],
    risk: 'High',
  },
  {
    id: 'shop-establishment',
    name: 'Shop & Establishment Registration',
    department: 'Local Municipal Authority',
    category: 'Trade',
    why: 'Required for trading and service-related business operations.',
    processingTime: '7-15 days',
    sla: '15 days',
    fee: '₹800',
    validity: 'Perennial with renewal as applicable',
    prerequisites: ['Business registration', 'Owner identity proof'],
    requiredDocuments: ['Identity proof', 'Address proof', 'Business address proof'],
    dependency: 'None',
    status: 'Optional',
    description: 'Municipal registration for a commercial establishment.',
    whoNeedsIt: 'Retail, commercial and service entities',
    eligibility: 'Commercial premise and business entity compliance',
    renewalFrequency: 'Variable',
    processSteps: ['Submit form', 'Document check', 'Certificate issuance'],
    dependencies: [],
    risk: 'Low',
  },
];

const schemes = [
  {
    id: 'manufacturing-subsidy',
    name: 'Manufacturing Investment Support',
    department: 'MSME / Industries Department',
    eligibility: 'Manufacturing and processing sectors',
    sector: 'Manufacturing',
    location: 'Maharashtra',
    investmentRange: '₹25L - ₹10Cr',
    incentiveType: 'Capital Subsidy',
    validity: '2026-2027',
    description: 'Illustrative support for eligible manufacturing and value-added processing projects.',
    sectorMatch: true,
    locationMatch: true,
    investmentMatch: true,
    employmentMatch: true,
    status: 'Eligible',
  },
  {
    id: 'employment-incentive',
    name: 'Employment Incentive',
    department: 'Labour & Skills',
    eligibility: 'Units creating sustained employment in Maharashtra',
    sector: 'Employment',
    location: 'Pune',
    investmentRange: '₹10L - ₹5Cr',
    incentiveType: 'Employment Incentive',
    validity: 'Current cycle',
    description: 'Illustrative employment-linked incentive for job creation in eligible sectors.',
    sectorMatch: true,
    locationMatch: true,
    investmentMatch: true,
    employmentMatch: true,
    status: 'Eligible',
  },
  {
    id: 'electricity-duty-support',
    name: 'Electricity Duty Support',
    department: 'Energy Department',
    eligibility: 'Industries with qualifying power usage and investment',
    sector: 'Utility',
    location: 'Maharashtra',
    investmentRange: '₹50L - ₹15Cr',
    incentiveType: 'Electricity Duty',
    validity: '2026-2028',
    description: 'Illustrative duty support aligned to industrial power consumption profiles.',
    sectorMatch: true,
    locationMatch: true,
    investmentMatch: true,
    employmentMatch: false,
    status: 'Potentially Eligible',
  },
];

const documents = [
  {
    id: 'doc-1',
    name: 'Project plan',
    approval: 'Factory License',
    status: 'Verified',
    uploadedDate: '2026-09-01',
    expiryDate: '2027-09-01',
    validation: 'Readable',
    required: true,
  },
  {
    id: 'doc-2',
    name: 'Land ownership document',
    approval: 'Factory License',
    status: 'Under Review',
    uploadedDate: '2026-09-12',
    expiryDate: '2028-10-01',
    validation: 'Needs review',
    required: true,
  },
  {
    id: 'doc-3',
    name: 'GST certificate',
    approval: 'Trade License',
    status: 'Verified',
    uploadedDate: '2026-08-15',
    expiryDate: '2027-08-15',
    validation: 'Valid',
    required: false,
  },
];

const applications = [
  {
    id: 'GATI-2026-000123',
    userId: 'user-applicant',
    approvalId: 'factory-license',
    approval: 'Factory License',
    department: 'Industries / Factory Inspectorate',
    submittedDate: '2026-09-10',
    status: 'DOCUMENT_VERIFICATION',
    currentStage: 'Document verification',
    nextAction: 'Review submitted land documentation',
    lastUpdated: '2026-09-18',
    priority: 'High',
    sla: '15 days',
  },
  {
    id: 'GATI-2026-000145',
    userId: 'user-applicant',
    approvalId: 'fire-safety',
    approval: 'Fire Safety Approval',
    department: 'Fire Department',
    submittedDate: '2026-09-05',
    status: 'QUERY_RAISED',
    currentStage: 'Query raised',
    nextAction: 'Respond to land use query',
    lastUpdated: '2026-09-16',
    priority: 'Medium',
    sla: '10 days',
  },
];

const notifications = [
  { id: 'n1', title: 'Application submitted', message: 'Factory License application has been logged.', read: false, createdAt: '2026-09-18T10:00:00.000Z', type: 'application' },
  { id: 'n2', title: 'Document verification', message: 'Land document is under review.', read: false, createdAt: '2026-09-17T13:00:00.000Z', type: 'document' },
  { id: 'n3', title: 'Query raised', message: 'Additional land document required for Pollution Consent.', read: true, createdAt: '2026-09-15T08:00:00.000Z', type: 'query' },
  { id: 'n4', title: 'Scheme recommendation', message: 'Manufacturing Investment Support matches your project profile.', read: false, createdAt: '2026-09-14T16:00:00.000Z', type: 'scheme' },
];

const renewals = [
  { id: 'renewal-1', approval: 'Factory License', expiryDate: '2026-11-30', status: 'Upcoming', daysRemaining: 34, lastRenewed: '2025-11-05' },
  { id: 'renewal-2', approval: 'Fire Safety Approval', expiryDate: '2026-10-15', status: 'Due Soon', daysRemaining: 19, lastRenewed: '2025-10-02' },
  { id: 'renewal-3', approval: 'Trade License', expiryDate: '2026-09-20', status: 'Due Soon', daysRemaining: 5, lastRenewed: '2025-09-18' },
];

const officerDashboard = {
  applicationsReceived: 142,
  pendingVerification: 28,
  queriesPending: 11,
  approved: 74,
  rejected: 6,
  slaBreaches: 4,
};

const adminDashboard = {
  users: 231,
  applicants: 174,
  officers: 19,
  projects: 68,
  applications: 421,
  approvals: 62,
  schemes: 19,
  documents: 1491,
};

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
}

function getUserByToken(token) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return users.find((user) => user.id === decoded.sub) || null;
  } catch {
    return null;
  }
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const user = getUserByToken(token);
  if (!user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  req.user = user;
  next();
}

function parseBodyJson(req) {
  return req.body || {};
}

app.post('/api/auth/login', (req, res) => {
  const { email, password } = parseBodyJson(req);
  const user = users.find(
    (entry) => (entry.email === email || entry.phone === email) && entry.password === password,
  );

  if (!user) {
    return res.status(401).json({ message: 'Incorrect email/mobile or password.' });
  }

  const token = signToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, district: user.district, businessName: user.businessName } });
});

app.post('/api/auth/register', (req, res) => {
  const payload = parseBodyJson(req);
  const emailExists = users.some((user) => user.email === payload.email);
  const mobileExists = users.some((user) => user.phone === payload.mobileNumber);

  if (emailExists || mobileExists) {
    return res.status(409).json({ message: 'An account with this email or mobile already exists.' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: payload.fullName,
    email: payload.email,
    phone: payload.mobileNumber,
    password: payload.password,
    role: 'APPLICANT',
    district: payload.district,
    businessName: payload.businessName,
  };

  users.push(newUser);
  const token = signToken(newUser);
  res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, role: newUser.role, district: newUser.district, businessName: newUser.businessName } });
});

app.get('/api/me', authMiddleware, (req, res) => {
  const { id, name, email, phone, role, district, businessName } = req.user;
  res.json({ user: { id, name, email, phone, role, district, businessName } });
});

app.get('/api/dashboard', authMiddleware, (req, res) => {
  const nextSteps = [
    { title: 'Complete Factory License documents', action: 'Complete Documents', route: '/documents' },
    { title: 'Respond to query for Pollution Consent', action: 'View Query', route: '/applications/GATI-2026-000145' },
    { title: 'Submit Fire Safety application', action: 'Continue Application', route: '/applications/new/fire-safety' },
  ];

  const overview = {
    totalApprovals: 8,
    completed: 2,
    inProgress: 3,
    actionRequired: 2,
    upcomingRenewals: 4,
  };

  const timeline = [
    'Project profile completed',
    'Factory License application submitted',
    'Land documents uploaded',
    'Query received for Pollution Consent',
  ];

  res.json({
    user: { name: req.user.name, role: req.user.role },
    project: { name: project.businessName, location: `${project.district}, Maharashtra`, readiness: 68 },
    nextSteps,
    overview,
    timeline,
    schemes: schemes.slice(0, 3),
    notifications: notifications.slice(0, 3),
  });
});

app.get('/api/approvals', authMiddleware, (req, res) => {
  res.json({ approvals });
});

app.get('/api/approvals/:id', authMiddleware, (req, res) => {
  const approval = approvals.find((item) => item.id === req.params.id);
  if (!approval) {
    return res.status(404).json({ message: 'Approval not found' });
  }
  res.json({ approval });
});

app.get('/api/project', authMiddleware, (req, res) => {
  res.json({ project, completion: 68 });
});

app.post('/api/project', authMiddleware, (req, res) => {
  const incoming = parseBodyJson(req);
  Object.assign(project, incoming);
  res.json({ project, completion: 80, message: 'Project profile saved successfully.' });
});

app.get('/api/documents', authMiddleware, (req, res) => {
  res.json({ documents, summary: { required: 6, uploaded: 3, verified: 2, missing: 2, expiring: 1 } });
});

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Unsupported file type. Use PDF, JPG, JPEG, or PNG.'));
  }
  cb(null, true);
}});

app.post('/api/documents/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  const form = parseBodyJson(req) || {};
  const documentEntry = {
    id: `doc-${Date.now()}`,
    name: req.file.originalname,
    approval: form.approval || 'Factory License',
    status: 'Uploaded',
    uploadedDate: new Date().toISOString().slice(0, 10),
    expiryDate: form.expiryDate || '2027-01-01',
    validation: 'Uploaded',
    required: true,
    storedPath: `/uploads/${req.file.filename}`,
  };
  documents.push(documentEntry);
  res.status(201).json({ message: 'Document uploaded successfully.', document: documentEntry });
});

app.get('/api/applications', authMiddleware, (req, res) => {
  res.json({ applications });
});

app.get('/api/applications/:id', authMiddleware, (req, res) => {
  const appItem = applications.find((item) => item.id === req.params.id);
  if (!appItem) {
    return res.status(404).json({ message: 'Application not found' });
  }
  res.json({ application: appItem, timeline: ['Application created', 'Submitted', 'Document verification', 'Query raised', 'Response submitted', 'Approved'] });
});

app.post('/api/applications', authMiddleware, (req, res) => {
  const payload = parseBodyJson(req);
  const generatedId = `GATI-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900000) + 100000)}`;
  const application = {
    id: generatedId,
    userId: req.user.id,
    approvalId: payload.approvalId || 'factory-license',
    approval: payload.approval || 'Factory License',
    department: payload.department || 'Industries / Factory Inspectorate',
    submittedDate: new Date().toISOString().slice(0, 10),
    status: 'SUBMITTED',
    currentStage: 'Submitted',
    nextAction: 'Await document review',
    lastUpdated: new Date().toISOString().slice(0, 10),
    priority: 'High',
    sla: '15 days',
  };
  applications.unshift(application);
  notifications.unshift({ id: `n-${Date.now()}`, title: 'Application submitted', message: `${application.approval} has been submitted.`, read: false, createdAt: new Date().toISOString(), type: 'application' });
  res.status(201).json({ message: 'Application submitted successfully.', application });
});

app.get('/api/schemes', authMiddleware, (req, res) => {
  res.json({ schemes });
});

app.get('/api/schemes/:id', authMiddleware, (req, res) => {
  const scheme = schemes.find((item) => item.id === req.params.id);
  if (!scheme) {
    return res.status(404).json({ message: 'Scheme not found' });
  }
  res.json({ scheme });
});

app.get('/api/renewals', authMiddleware, (req, res) => {
  res.json({ renewals });
});

app.get('/api/notifications', authMiddleware, (req, res) => {
  res.json({ notifications });
});

app.patch('/api/notifications/:id/read', authMiddleware, (req, res) => {
  const notification = notifications.find((item) => item.id === req.params.id);
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  notification.read = true;
  res.json({ message: 'Notification marked as read.', notification });
});

app.get('/api/officer/dashboard', authMiddleware, (req, res) => {
  if (req.user.role !== 'OFFICER') {
    return res.status(403).json({ message: 'Only officers can access the officer dashboard.' });
  }
  res.json({ dashboard: officerDashboard, applications: applications.slice(0, 3) });
});

app.get('/api/admin/dashboard', authMiddleware, (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Only admins can access the admin dashboard.' });
  }
  res.json({ dashboard: adminDashboard, audit: [{ user: 'Officer 1', action: 'Application approved', entity: 'Factory License', timestamp: '2026-09-18', previousStatus: 'DOCUMENT_VERIFICATION', newStatus: 'APPROVED' }] });
});

app.use(express.static(frontendDist));
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    next();
    return;
  }
  res.sendFile(path.join(frontendDist, 'index.html'), (error) => {
    if (error) next(error);
  });
});

app.use((err, _req, res, _next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File is too large. Maximum upload size is 5MB.' });
  }
  if (err) {
    return res.status(400).json({ message: err.message || 'Upload failed.' });
  }
  res.status(500).json({ message: 'Something went wrong.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`GATI backend running on http://localhost:${PORT}`);
});
