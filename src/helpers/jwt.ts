import { expressjwt, IsRevoked } from "express-jwt";
import { JwtPayload } from "jsonwebtoken";

export const authJwt = () => {
  return expressjwt({ secret: process.env.JWT_SECRET, algorithms: ["HS256"], isRevoked }).unless({
    // custom: (req) => {
    //   return req.method === "GET";
    // },
    path: [
      { url: /\/api\/v1\/posts(.*)/, methods: ["GET", "OPTIONS"] },
      { url:/\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      "/api/v1/users/login",
      "/api/v1/users/register",
    ],
  });
};

 const isRevoked: IsRevoked =  (_req, token)=> {
  if (!(token.payload as JwtPayload).isAdmin) {
    return true
  }
  return false;
}
