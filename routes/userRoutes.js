import { Router } from "express";
import {
  updateMyProfile,
  changeMyPassword,
} from "../controllers/userController.js";
import { validate, validationRules } from "../middleware/validate.js";

const userRoutes = Router();

// path is '/me' rather than using an id as param to prevent other users accessing
// other user's info
userRoutes.patch("/me", validate(validationRules.full_name), updateMyProfile);

userRoutes.put(
  "/me/password",
  validate(
    validationRules.currentPassword,
    validationRules.newPassword,
    validationRules.confirmNewPassword,
  ),
  changeMyPassword,
);

export default userRoutes;
