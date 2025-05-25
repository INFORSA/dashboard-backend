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

server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
server.use(cors({
  origin: "http://localhost:5173",  
  credentials: true
}));
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