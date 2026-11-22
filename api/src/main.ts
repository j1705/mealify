import { startServer } from "./server";

startServer(process.env)
  .then(({ port }) => console.log(`Application running on port ${port}`))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
