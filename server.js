import app from "./app.js";
import config from "./config/env.js";

app.listen(config.port, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Server running at http://localhost:${config.port}`);
});
