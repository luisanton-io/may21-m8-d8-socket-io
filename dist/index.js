"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var mongoose_1 = __importDefault(require("mongoose"));
var model_1 = __importDefault(require("./room/model"));
var express_list_endpoints_1 = __importDefault(require("express-list-endpoints"));
process.env.TS_NODE_DEV && require("dotenv").config();
var onlineUsers = [];
var app = express_1.default();
app.use(cors_1.default());
app.use(express_1.default.json());
app.get('/test', function (req, res) {
    res.status(200).send({ message: "Test success" });
});
app.get('/online-users', function (req, res) {
    res.status(200).send({ onlineUsers: onlineUsers });
});
app.get("/rooms/:name", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var room;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, model_1.default.findOne({ room: req.params.name })];
            case 1:
                room = _a.sent();
                res.send(room.chatHistory);
                return [2 /*return*/];
        }
    });
}); });
var httpServer = http_1.createServer(app);
// initializing our socket.io server....
var io = new socket_io_1.Server(httpServer, { allowEIO3: true });
io.on('connection', function (socket) {
    console.log(socket.id);
    socket.on("setUsername", function (_a) {
        var username = _a.username, room = _a.room;
        console.log(username);
        // Rooms are a server-side concept which allows socket to send a message only 
        // to some recipients who previously "joined" that room
        socket.join(room);
        // By default, when a socket is connecting, it's joining a room with the same id as its socket id
        console.log(socket.rooms);
        onlineUsers.push({ username: username, id: socket.id, room: room });
        // .emit                 will send the message back to the other side of the current channel
        // .broadcast.emit       will send the message to every other connected socket
        // .to(room).emit        will send the message to every socket connected in that room
        socket.emit("loggedin");
        socket.broadcast.emit("newConnection");
    });
    socket.on("sendmessage", function (_a) {
        var message = _a.message, room = _a.room;
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: 
                    // const { text, sender, id, timestamp } = message
                    // ... we should save the message to the database here...
                    return [4 /*yield*/, model_1.default.findOneAndUpdate({ room: room }, {
                            $push: { chatHistory: message }
                        })
                        // ... and then broadcast the message to the recipient(s)
                        // socket.broadcast.emit("message", message)
                    ];
                    case 1:
                        // const { text, sender, id, timestamp } = message
                        // ... we should save the message to the database here...
                        _b.sent();
                        // ... and then broadcast the message to the recipient(s)
                        // socket.broadcast.emit("message", message)
                        socket.to(room).emit("message", message);
                        return [2 /*return*/];
                }
            });
        });
    });
    socket.on("disconnect", function () {
        onlineUsers = onlineUsers.filter(function (user) { return user.id !== socket.id; });
        socket.broadcast.emit("newConnection");
    });
});
// Now listening...
if (!process.env.MONGO_URL) {
    throw new Error("No Mongo url defined.");
}
mongoose_1.default.connect(process.env.MONGO_URL)
    .then(function () {
    httpServer.listen(3030, function () {
        console.log(express_list_endpoints_1.default(app));
        console.log("Server listening on port 3030");
    });
});
