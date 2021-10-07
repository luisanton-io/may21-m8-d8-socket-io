"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var schema_1 = __importDefault(require("./schema"));
var mongoose_1 = __importDefault(require("mongoose"));
var RoomModel = mongoose_1.default.model("rooms", schema_1.default);
exports.default = RoomModel;
