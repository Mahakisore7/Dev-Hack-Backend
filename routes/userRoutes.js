import { checkAuth,login,signup } from "../controllers/UserController";
import { protectRoute } from "../middleware/auth";

const userRouter=express.Router();

userRouter.post("/signup",signup);
userRouter.post("/login",login);
userRouter.get("/check", protectRoute, checkAuth);

export default userRouter;