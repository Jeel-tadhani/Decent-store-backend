import { Request, Response } from "express";
import { User } from "../entity/User.entity";
import { AppDataSource } from "../data-source";
import { CustomRequest } from "../util/Interface/expressInterface";
import { bcryptpassword, comparepassword } from "../util/bcrypt";
import { generateToken } from "../util/JwtAuth";

class UserController {


    public async GetUser(req: CustomRequest, res: Response) {
        try {
            const userRepository = AppDataSource.getRepository(User)
            const id: number = parseInt(req.user.user_id);

            const user = await userRepository
                .createQueryBuilder("user")
                .select(["user.user_name", "user.email", "user.sso_id", "user.avatar", "user.password_changed", "user.course"])
                .leftJoinAndSelect("user.course", "course")
                .where("user.user_id = :id", { id })
                .getOne();

            if (!user) {
                return res.status(404).json({
                    message: "User does not exist",
                    status: false
                });
            }

            return res.status(200).json({
                message: "User fetched successfully",
                status: false,
                data: user
            })


        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                status: false,
                error: error.message
            })
        }
    }

    public async createUser(req: CustomRequest, res: Response) {
        try {
            const userRepository = AppDataSource.getRepository(User)

            const { user_name, email, password } = req.body

            if (!user_name || !email || !password) {
                return res.status(400).json({
                    message: "Please enter all required fields",
                    status: false
                })
            }
            const existingUser = await userRepository.findOne({ where: { email } })
            if (existingUser) {
                return res.status(409).json({
                    message: "User already exists",
                    status: false
                })
            }

            req.password = await bcryptpassword(password)
            console.log(req.password)
            const user = await userRepository.create({
                user_name: user_name,
                email,
                password: req.password
            })

            const saveUser = await userRepository.save(user)
            return res.status(200).json({
                message: "User fetched successfully",
                status: false,
                data: saveUser
            })
        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                status: false,
                error: error.message
            })
        }
    }

    public async loginUser(req: CustomRequest, res: Response) {
        try {
            const userRepository = AppDataSource.getRepository(User)

            const { email, password } = req.body

            if (!email || !password) {
                return res.status(400).json({
                    message: "Please enter email and password",
                    status: false
                })
            }
            const existingUser = await userRepository.findOne({ where: { email } })
            if (!existingUser) {
                return res.status(404).json({
                    message: "User not found",
                    status: false
                })
            }
            const valid = await comparepassword(password, existingUser.password)
            if (!valid) {
                return res.status(402).json({
                    message: "please enter a valid password",
                    status: false
                })
            }

            const token = generateToken({ email: existingUser.email, user_name: existingUser.user_name })

            res.cookie("jwt", token)
            return res.status(200).json({
                message: "User fetched successfully",
                status: false,
                data: { ...existingUser, access_token: token },
            })

        } catch (error) {
            return res.status(500).json({
                message: "Internal Server Error",
                status: false,
                error: error.message
            })
        }
    }

}

export default UserController;