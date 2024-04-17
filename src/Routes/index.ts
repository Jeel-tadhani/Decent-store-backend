import * as express from 'express';
import userRoutes from './UserRouter';

const Routes = express.Router();

Routes.use("/user", userRoutes)

export default Routes; 