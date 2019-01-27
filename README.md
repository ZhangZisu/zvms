# 镇海中学义工管理系统

API列表：
- `api`
  - `auth`
    - `login`
      - `POST`\
        获取授权所需的token
  - `users`
    - `GET`\
      获取所有用户
    - `:id`
      - `GET`\
        获取指定用户信息
      - `PUT`\
        更新指定用户信息
  - `groups`
    - `GET`\
      获取所有用户组
    - `:id`
      - `GET`\
        获取指定用户组
      - `PUT`\
        更新指定用户组