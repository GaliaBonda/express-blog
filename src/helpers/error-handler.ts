export const errorHandler = (err, req, res, next) => {
  if (err) {
    if (err.name === "UnauthorizedError") {
      res.status(401).json({message: 'The user is not authorized'})
      return;
    }
    if (err.name === "ValidationError") {
      res.status(401).json({message: err.message})
      return;
    }
    
    res.status(500).json({ message: err.message ?? "error in the server" });
  }
};
