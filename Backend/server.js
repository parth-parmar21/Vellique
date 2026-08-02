import app from "./src/app.js";
import connectDB from "./config/database.js";
import { config } from "./config/config.js";

const PORT = config.PORT

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
