import { Request, Response } from "express";
import { User, UserStatus } from "../entity/User.entity";
import { AppDataSource } from "../data-source";
import { CustomRequest } from "../util/Interface/expressInterface";
import { bcryptpassword, comparepassword } from "../util/bcrypt";
import { generateToken } from "../util/JwtAuth";

class UserController {


    public async GetUser(req: CustomRequest, res: Response) {
        try {
            const userRepository = AppDataSource.getRepository(User)
            const id: number = parseInt(req.user.id);

            const user = await userRepository
                .createQueryBuilder("user")
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

    public async GetUserById(req: CustomRequest, res: Response) {
        try {
            const userRepository = AppDataSource.getRepository(User)
            const id: number = parseInt(req.params.id);

            const user = await userRepository
                .createQueryBuilder("user")
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

    public async GetUserList(req: CustomRequest, res: Response) {
        try {
            const userRepository = AppDataSource.getRepository(User)

            const [users, totalItems] = await userRepository
                .createQueryBuilder("user")
                .skip(req.pagination.skip)
                .take(req.pagination.limit)
                .orderBy("user.user_id", "ASC")
                .getManyAndCount();

            const data = {
                data: users,
                metadata: {
                    totalItems
                }

            }

            return res.status(200).json({
                message: "Users fetched successfully",
                status: false,
                data
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
                message: error.message,
                status: false
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
            const existingUser = await userRepository.findOne({ where: { email, status: UserStatus.Active } })
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

            const token = generateToken({ id: existingUser.user_id, email: existingUser.email, user_name: existingUser.user_name, role: existingUser.role, firstName: existingUser.first_name, lastName: existingUser.last_name, avatar: existingUser.avatar })

            res.cookie("jwt", token)
            return res.status(200).json({
                message: "User fetched successfully",
                status: false,
                data: { ...existingUser, access_token: token },
            })

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: false,
            })
        }
    }

    public async ResetPassword(req: CustomRequest, res: Response) {
        try {
            const userRepository = AppDataSource.getRepository(User)
            const user_id = req.user.id
            const { password, oldPassword, confirmPassword } = req.body

            if (!password || !oldPassword || !confirmPassword) {
                return res.status(400).json({
                    message: "Please enter all fields",
                    status: false
                })
            }
            if (password !== confirmPassword) {
                return res.status(400).json({
                    message: "Password and confirm password should match",
                    status: false,
                });
            }

            const existingUser = await userRepository.findOne({ where: { user_id } })
            if (!existingUser) {
                return res.status(404).json({
                    message: "User not found",
                    status: false
                })
            }
            const valid = await comparepassword(oldPassword, existingUser.password)
            if (!valid) {
                return res.status(402).json({
                    message: "please enter a valid password",
                    status: false
                })
            }

            existingUser.password = await bcryptpassword(password)
            await userRepository.save(existingUser);

            return res.status(200).json({
                message: "password reset successfully",
                status: false,
            })

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: false,
            })
        }
    }

    public async updateUser(req: CustomRequest, res: Response) {
        try {
            const userRepository = AppDataSource.getRepository(User)
            const user_id = req.user.id
            const { user_name, first_name, last_name, avatar, role } = req.body


            const user = await userRepository.findOne({ where: { user_id } })
            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                    status: false
                })
            }

            user.user_name = user_name || user.user_name;
            user.first_name = first_name || user.first_name;
            user.last_name = last_name || user.last_name;
            user.avatar = avatar || user.avatar;
            user.role = role || user.role;
            await userRepository.save(user);

            return res.status(200).json({
                message: "User update successfully",
                status: false,
                data: user
            })

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: false,
            })
        }
    }

    public async updateUserById(req: CustomRequest, res: Response) {
        try {
            const userRepository = AppDataSource.getRepository(User)
            const user_id = parseInt(req.params.id)
            const { user_name, first_name, last_name, avatar, role, sector, county, status } = req.body


            const user = await userRepository.findOne({ where: { user_id } })
            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                    status: false
                })
            }

            user.user_name = user_name || user.user_name;
            user.first_name = first_name || user.first_name;
            user.last_name = last_name || user.last_name;
            user.avatar = avatar || user.avatar;
            user.role = role || user.role;
            user.sector = sector || user.sector;
            user.county = county || user.county;
            user.status = status || user.status;

            await userRepository.save(user);

            return res.status(200).json({
                message: "User update successfully",
                status: false,
                data: user
            })

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: false,
            })
        }
    }

    public async deleteUserById(req: CustomRequest, res: Response) {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const user_id = parseInt(req.params.id);

            const user = await userRepository.findOne({ where: { user_id } });

            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                    status: false
                });
            }

            await userRepository.delete(user_id);

            return res.status(200).json({
                message: "User deleted successfully",
                status: true
            });

        } catch (error) {
            return res.status(500).json({
                message: error.message,
                status: false
            });
        }
    }

}

export default UserController;