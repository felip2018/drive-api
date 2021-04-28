"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const drive_router_1 = __importDefault(require("./routes/drive-router"));
const app = express_1.default();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(cookie_parser_1.default());
app.use(cors_1.default());
app.use('/drive', drive_router_1.default);
app.use((req, res) => {
    return res.status(500).send({ message: `Url ${req.url} Not found` });
});
exports.default = app;
//# sourceMappingURL=app.js.map