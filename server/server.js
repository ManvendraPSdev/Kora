const dotenv = require("dotenv");
const http = require("http");
const connectDB = require("./src/config/db");
const createApp = require("./src/app");
const { initSocket } = require("./src/config/socket");

dotenv.config();

const app = createApp();
const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${PORT}`);
  });
});
