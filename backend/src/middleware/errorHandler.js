export function errorHandler(err, _req, res, _next) {
  console.error("[Error]", err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal server error",
    ...(err.errors ? { errors: err.errors } : {}),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}