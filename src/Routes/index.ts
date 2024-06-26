import * as express from 'express';
import userRoutes from './UserRouter';
import fileRoutes from './FileRouter';

const Routes = express.Router();

Routes.use("/user", userRoutes)
Routes.use("/file", fileRoutes)

export default Routes; 