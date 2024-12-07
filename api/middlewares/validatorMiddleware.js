const { validationResult } = require("express-validator");

//@desc Finds the vailidation errors in this request and wraps them in an object with handy functions
const validatorMiddleware = (req , res, next)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();  // Pass control to the next middleware (getCategory)
}

module.exports = validatorMiddleware;