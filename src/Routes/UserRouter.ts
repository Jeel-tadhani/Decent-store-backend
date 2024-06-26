import * as express from 'express';
import UserController from '../controllers/UserController';
import { authorizeRoles } from '../middleware/verifyToken';
import { paginationMiddleware } from '../middleware/pagination';

const userRoutes = express.Router();

const Controller = new UserController();

userRoutes.get("/get", authorizeRoles(), Controller.GetUser);
userRoutes.get("/get/:id", authorizeRoles(), Controller.GetUserById);
userRoutes.get("/list", paginationMiddleware, authorizeRoles(), Controller.GetUserList);
userRoutes.post("/register", Controller.createUser);
userRoutes.post("/login", Controller.loginUser);
userRoutes.post("/reset-password", authorizeRoles(), Controller.ResetPassword);
userRoutes.patch("/update", authorizeRoles(), Controller.updateUser);
userRoutes.patch("/update/:id", authorizeRoles(), Controller.updateUserById);
userRoutes.delete("/delete/:id", authorizeRoles(), Controller.deleteUserById);
export default userRoutes;