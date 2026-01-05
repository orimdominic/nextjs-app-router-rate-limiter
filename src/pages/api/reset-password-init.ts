import { applyRateLimiter } from "../../lib/server/rate-limiter";

import type { NextApiRequest, NextApiResponse } from "next";

export default function handleRequestResetPassword(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: { message: "Not allowed" },
    });
  }

  if (!req.body.email || typeof req.body.email != "string") {
    return res.status(400).json({
      error: { message: "'email' is required" },
    });
  }

  const generateOptions = function (req: NextApiRequest) {
    const now = new Date();
    const inFiveSeconds = new Date(now.getTime() + 5000);

    return {
      expiresAt: inFiveSeconds,
      key: `post.reset-password.${req.body.email.toLowerCase()}`,
      maxTries: 1,
    };
  };

  applyRateLimiter(req, res, generateOptions);

  // Write code to send email

  return res.json({
    message: "Reset password email sent",
  });
}
