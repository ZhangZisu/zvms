# 镇海中学义工管理系统后端
![](https://img.shields.io/github/license/ZhangZisu/zvms.svg?style=flat-square)
![](https://img.shields.io/github/tag/ZhangZisu/zvms.svg?style=flat-square)

后端开发中，API列表随时变动。

## 结构

系统共有7个实体（按照字典序描述）：
### Activity
这个是一次义工活动的描述

### Chance
一次义工报名机会。对于`<Activity,Group>`而言是唯一的

规定了一次义工中一个班级的最大报名人数和报名方式

### Group
一个班级

### Member
一个义工成员。对于`<Activity,User>`而言是唯一的

规定了一次义工中一个学生的义工结果和时间等

### Team
一个义工小组。对于`<Activity,Leader>`而言是唯一的

描述了一次义工中的一个小组


### User
一个系统用户。

## API列表：
请自行阅读`/src/api`下的源代码

## 设计：
见[https://www.processon.com/view/link/5c513962e4b025fe7c8f772d](https://www.processon.com/view/link/5c513962e4b025fe7c8f772d)

## 编码规范：
1. 强耦合实体对应的路由也应强耦合，如`chance`、`member`、`team`的操作都在`activities`路由中
2. 引用成员`id`时，使用上下文最近的可用定义
