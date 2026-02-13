const { validationResult, body } = require("express-validator");

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const registerValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .isAlphanumeric()
    .withMessage("Username must be 3-20 alphanumeric characters"),
  body("password")
    .isLength({ min: 6, max: 128 })
    .withMessage("Password must be 6-128 characters"),
  handleValidationErrors,
];

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

const createRoomValidation = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Room name must be 1-50 characters"),
  body("isPrivate").optional().isBoolean().withMessage("isPrivate must be boolean"),
  body("password")
    .optional()
    .isLength({ min: 1, max: 128 })
    .withMessage("Password must be 1-128 characters"),
  body("waitingRoomEnabled").optional().isBoolean().withMessage("waitingRoomEnabled must be boolean"),
  handleValidationErrors,
];

module.exports = {
  registerValidation,
  loginValidation,
  createRoomValidation,
  handleValidationErrors,
};
