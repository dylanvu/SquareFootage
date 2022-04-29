import * as mongo from 'mongodb';
import { tenant } from '../interface';
import { defaultFt, defaultMoney } from '../constants';

export const createTenant = async (collection: mongo.Collection, id: string, name: string) => {
    await collection.insertOne({
        id: id,
        name: name,
        ft: defaultFt,
        money: defaultMoney,
        worked: false,
        gambleCount: 0,
        slotCount: 0
    } as tenant);
}