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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTenant = void 0;
const constants_1 = require("../constants");
const createTenant = (collection, id, name) => __awaiter(void 0, void 0, void 0, function* () {
    yield collection.insertOne({
        id: id,
        name: name,
        ft: constants_1.defaultFt,
        money: constants_1.defaultMoney,
        worked: false,
        gambleCount: 0,
        slotCount: 0
    });
});
exports.createTenant = createTenant;
