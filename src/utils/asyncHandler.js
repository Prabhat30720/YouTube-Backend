// Higher order function - A function that takes another function as an argument and returns a new function

// asyncHandler function using Promise

const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    // if promise is resolved, then execute the function otherwise catch the error and pass it to next middleware
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

// asyncHandler function using try-catch block

/* const asyncHandler = (fun) => async (req, res, next) => {
  try {
    // execute the passed function
    await fun(req, res, next);
  } catch (error) {
    res.send(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
}; */

export { asyncHandler };
