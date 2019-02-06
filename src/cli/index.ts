// tslint:disable:no-console
import commander = require("commander");
import { readFileSync } from "fs-extra";
import { createConnection } from "typeorm";
import { PATH_PACKAGE } from "../constant";
import { Group } from "../entity/group";
import { User } from "../entity/user";

const version = JSON.parse(readFileSync(PATH_PACKAGE).toString()).version;

commander
    .version(version);

commander
    .command("init")
    .description("Initialize the system")
    .action(() => {
        // tslint:disable-next-line: no-floating-promises
        createConnection().then(async () => {
            const group = new Group();
            group.name = "Administrators";
            await group.save();
            const user = new User();
            user.name = "Administrator";
            user.email = "admin@zhangzisu.cn";
            user.setPassword("Administrator");
            user.isAdmin = true;
            user.isManager = true;
            user.isProvider = true;
            user.isSecretary = true;
            user.description = "System administrator";
            user.group = group;
            await user.save();
            console.log("Done");
        }).catch((err) => {
            console.error(err.message);
            console.log("ZVMS CLI runs into a problem.");
            console.log("Please report to https://github.com/ZhangZisu/zvms/issues");
        }).finally(() => {
            process.exit(0);
        });
    });

commander.parse(process.argv);
