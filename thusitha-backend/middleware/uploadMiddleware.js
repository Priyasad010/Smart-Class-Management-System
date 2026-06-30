const multer = require('multer');
const path = require('node:path');
const fs = require('node:fs');

// Ensure the uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Secure filename to avoid space issues or weird characters
    const safeName = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname).toLowerCase();
    cb(null, safeName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('application/pdf') || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`අනුමත නොකරන ලද ගොනු වර්ගයකි. (Invalid file type) - ${file.mimetype}`), false);
    }
  }
});

module.exports = upload;