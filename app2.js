import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import {myCache} from './utils/cache.js'
import { jwtDecode } from "jwt-decode";

const __dirname = dirname(fileURLToPath(import.meta.url));
// const upload = multer({ dest: 'uploads/' });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      return callback(new Error('Only images are allowed'));
    }
    callback(null, true);
  },
  storage: storage,
});

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  console.log('object');
  res.json({ message: 'server port 4000' });
});


app.get('/update', (req, res) => {
  console.log('update');
  res.json({ message: 'update 4000' });
});


app.post('/profile', upload.single('profile'), (req, res, next) => {
  console.log(req.file.path);

  fs.access(req.file.path, (err, result) => {
    if (err) {
      return res.json({ message: 'file not exist' });
    }
    return res.json({
      path: req.file.filename,
      message: 'file uploaded successfully',
    });
  });
});

app.post('/multiple', upload.array('images', 3), (req, res, next) => {
  return res.json({ path: req.files });
});

app.get('/data', (req, res) => {
  const checkdata = myCache.get('users');
  if (checkdata) {
    res.json({ type: 'cache', data: checkdata });

  } else {

    fetch("https://jsonplaceholder.typicode.com/posts")
    .then((res)=>res.json())
    .then(data=>{
      myCache.set("users",data)
     return  res.json({ type: 'no cache', data: data });
    })
 
  }
});

app.post(
  '/multiple-fields',
  upload.fields([
    { name: 'profile', maxCount: 1 },
    { name: 'cnic', maxCount: 2 },
  ]),
  (req, res, next) => {
    console.log(':::', req.body);

    console.log(':::', req.files);
  }
);



app.use((err, req, res, next) => {
  console.log(err.message);
  res.status(404).json({
    msg: err.message,
  });
});

app.listen(process.env.PORT||4000, () => {
  console.log('serevr is running ::4000',process.env.PORT);
});
