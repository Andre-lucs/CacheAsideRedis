import { Sequelize } from "sequelize";

const dbName = 'bd_2_projeto_1';
const uName = 'postgres';
const uPass = 'postgres';

const sequelize = new Sequelize(dbName, uName, uPass, {
    host : 'localhost',
    dialect : 'postgres',
    port : '5432'
});

export default sequelize;

