//操作数据库的逻辑
let mongoose = require("mongoose");
let { db_url } = require("./config");
mongoose.connect(db_url, { useNewUrlParser: true, useUnifiedTopology: true });
// connect里面的{ useNewUrlParser: true, useUnifiedTopology: true }必须加，否则不会报错但是有警告
// 学生表
let allstudentSchema = new mongoose.Schema(
  {
    name: String,
    sex: String,
    age: String,
    study: String,
    major: String,
    classes: String,
    citycenter: String,
    chengji: String,
    failss: String
  },
  { collection: "student" }
  // mongoose.model()，会自动给表的末尾添加 s，所以当我们的数据库里的表已经建好且没有加s的情况下，
  // 想要获取到数据就必须在Schema里加上{ collection: "表名" }
);
let Allstudent = mongoose.model("student", allstudentSchema);

// 用户表
let movieSchema = new mongoose.Schema(
  {
    adminName: String,
    password: String
  },
  { collection: "admin" }
);
let Admin = mongoose.model("admin", movieSchema);
// 班主任表
let headTeacher = new mongoose.Schema(
  {
    headname: String,
    headsex: String,
    college: String,
    entryDate: String
  },
  { collection: "headteacher" }
);
let Headteacher = mongoose.model("headteacher", headTeacher);

// 市场部表
let market = new mongoose.Schema(
  {
    marketname: String
  },
  { collection: "market" }
);
let Market = mongoose.model("market", market);

// 班级表
let classSchema = new mongoose.Schema(
  {
    classname: String,
    createDate: String,
    lecturer: String,
    headteacher: String
  },
  { collection: "class" }
);
let Class = mongoose.model("class", classSchema);

module.exports = {
  Allstudent,
  Admin,
  Headteacher,
  Market,
  Class
};
