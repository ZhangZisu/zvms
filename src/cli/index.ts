// tslint:disable:no-console
import { default as c } from "chalk";
import commander = require("commander");
import { existsSync, move, readFileSync, remove, removeSync, rmdir, unlinkSync, writeFileSync } from "fs-extra";
import { join } from "path";
import prompts = require("prompts");
import { generate } from "randomstring";
import { createConnection } from "typeorm";
import { PTH_PACKAGE } from "../constant";
import { User, UserRoles } from "../entity/user";

const version = JSON.parse(readFileSync(PTH_PACKAGE).toString()).version;

commander
    .version(version);

commander
    .command("init")
    .description("Initialize the system")
    .action(() => {
        createConnection().then(async (connection) => {
            const user = new User();
            user.name = "Administrator";
            user.email = "admin@zhangzisu.cn";
            user.setPassword("Administrator");
            user.role = UserRoles.Administrator;
            await connection.getRepository(User).save(user);
            console.log("Done");
        });
    });

commander.parse(process.argv);
