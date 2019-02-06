import { join } from "path";

// Errors
export const ERR_UNKNOW = "位置错误";
export const ERR_NOT_FOUND = "未找到";
export const ERR_BAD_REQUEST = "无效请求";
export const ERR_ACCESS_DENIED = "没有权限";

// Security
export const SEC_SECRET = "666233";

// Path
export const PATH_PACKAGE = join(__dirname, "..", "package.json");
export const PATH_MEDIA = join(__dirname, "..", "static");

// Defaults
export const DEF_DESCRIPTION = "没有描述";
export const DEF_COMMENT = "没有评论";

// Limits
export const LIM_SEARCH_ITEMS = 15;
export const LIM_PAGINATION_ITEMS = 256;
export const LIM_MIMES = [
    "image/jpeg",
    "image/png",
];
