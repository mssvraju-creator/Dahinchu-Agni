import serverlessHttp from "serverless-http";
import app from "../artifacts/api-server/src/app";

const serverlessHandler = serverlessHttp(app);

export default function handler(req: any, res: any) {
  return serverlessHandler(req, res);
}
