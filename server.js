const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swagger/apidocs.json');
const cookieParser = require("cookie-parser");

const authRoutes = require('./routes/authRoutes');
const inseventRoutes = require('./routes/inseventRoutes');
const nilaiRoutes = require('./routes/performanceRoutes');
const staffRoutes = require('./routes/staffRoutes');
const deptRoutes = require('./routes/deptRoutes');
const userRoutes = require('./routes/userRoutes');
const importRoutes = require('./routes/importRoutes');

const server = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://zslnjmx0-5173.asse.devtunnels.ms",
  "https://dashboard-inforsa.netlify.app"
];

server.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  credentials: true
}));

server.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.json());
server.use(cookieParser()); 


// Route utama
server.get('/', (req, res) => res.send('Welcome to INFORSA API'));

// Routing modular
server.use('/api', authRoutes);
server.use('/insevent', inseventRoutes);
server.use('/penilaian', nilaiRoutes);
server.use('/staff', staffRoutes);
server.use('/dept', deptRoutes);
server.use('/user', userRoutes);
server.use('/import', importRoutes);


const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server berjalan pada port ${port}`);
});