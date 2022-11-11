import { Router } from "express";
import verifyRequest from "../middleware/verify-request";

const router = Router();

router.use(verifyRequest({ billing: { required: false } }));

router.get("/", (req, res) => {
  // Server api routes here
  res.json({
    status: 'success',
    data: {
      name: 'John Doe',
      height: '6ft',
    },
    message: "Hello World!",
  });
});

router.get('/greeting', (req, res) => {
  res.json({
    status: 'success',
    data: {
      name: 'John Doe',
      height: '6ft',
    },
    message: "Hello World!",
  });
});

export default router;