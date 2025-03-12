const allowedOrigins = [
  "http://localhost:4000",
  "htpp://localhost:3000",
  "https://punch-bookkeeping.vercel.app",
];

const corsOptions = {
  origin: (origin: any, callback: any) => {
    const allowedOriginPatterns = allowedOrigins.map(
      (origin) =>
        new RegExp(`^${origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`)
    );

    if (
      !origin ||
      allowedOriginPatterns.some((pattern) => pattern.test(origin))
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

export default corsOptions;
