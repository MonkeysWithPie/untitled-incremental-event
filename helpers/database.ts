import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, Sequelize } from "sequelize";
import fs from 'fs';
import path from 'path';

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: path.join(import.meta.dirname, '../data/database.sqlite'),
});

class Player extends Model<InferAttributes<Player>, InferCreationAttributes<Player>> {
    declare userId: string;

    declare clicks: number;
    declare bits: number;

    declare upgrades: { [name: string]: number };
}

Player.init(
    {
        userId: {
            type: DataTypes.STRING,
            primaryKey: true,
        },

        clicks: {
            type: DataTypes.NUMBER,
            defaultValue: 0,
        },

        bits: {
            type: DataTypes.NUMBER,
            defaultValue: 0,
        },

        upgrades: {
            type: DataTypes.JSON,
            defaultValue: {},
        }
    },
    {
        sequelize,
        modelName: "Player",
        timestamps: false,
    }
)


export const database = {
    Player,
    sequelize,
};