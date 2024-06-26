import express, { Express } from 'express';
import 'dotenv/config';
import cors from "cors";
import { AppDataSource } from "./src/data-source"
import MainRoutes from "./src/Routes/index";
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';

const app: Express = express();
const port = process.env.PORT || 4000;

// express config
app.use(cors({ credentials: true, origin: "*" }));
console.log(process.env.FRONTEND_URL)
app.use(bodyParser.json())
app.use(morgan('tiny'))
app.use(cookieParser())
app.use('/src/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
    res.send("Welcome to decent store backend!")
})
// database connection 
AppDataSource.initialize().then(async () => {
    console.log("Data Source has been initialized! 🎈")
}).catch((err) => {
    console.error("Error during Data Source initialization 🏃‍♂️:", err)
})

// config mainRoute
app.use('/api/v1', MainRoutes);

app.listen(port, () => {
    console.log(`Server is running at Port :: ${port} `);
});