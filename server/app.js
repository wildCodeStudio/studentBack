// 注意注意注意：  这个接口都写得本地的，就最后一个查询的接口是测试远程的（为了测试那个远程接口所以那边建立联系的表也是远程那个）

let express = require("express");
let bodyParse = require("body-parser");
let jwt = require("jsonwebtoken");
let app = express();
app.use(bodyParse.json());
let cors = require("cors"); //配置跨域
app.use(cors()); //跨域中间件
let {
  Allstudent,
  Admin,
  Headteacher,
  Market,
  Class
} = require("../db/model/user");
// 这条是与所有学生表建立连接的变量
app.use(express.static('../public'))
// 获取所有学生
app.get("/allstudent", async (req, res) => {
  try {
    Allstudent.find({}, (err, ress) => {
      if (err) {
        console.log(err);
      } else {
        if (ress) {
          res.json({
            code: 200,
            data: ress
          });
        } else {
          res.json({
            code: 201,
            msg: "查询失败"
          });
        }
      }
    });
  } catch (error) {
    res.json({
      code: 211,
      msg: error
    });
  }
});

// 在全部学生中实现分页
app.post("/allstudentPage", async (req, res) => {
  let page = req.body.page; //当前页数
  let maxPage = 7; //每页最大条数
  try {
    let allstudentList = await Allstudent.find({});
    let maxPageHome = Math.ceil(allstudentList.length / maxPage); //设置最大页数
    if (page > maxPageHome) {
      res.json({
        code: 202,
        msg: "超过最大页数"
      });
      return false;
    } else {
      let pagelist = allstudentList.slice((page - 1) * maxPage, page * maxPage);
      res.json({
        code: 200,
        data: pagelist,
        total: allstudentList.length,
        delpage: Math.ceil(allstudentList.length / maxPage) //页数,在删除时用,当删除的数据是你当前页的最后一条数据的时候,向上取最大页数
      });
    }
  } catch (error) {
    console.log(error);
  }
});
// ·························································································································
// Excel导入
app.post("/inExcel", async (req, res) => {
  let user = req.body.excarr;
  //   上述条件都不成立再进行添加
  let allstudentList = await Allstudent.find({});
  let maxPage = 7; //每页最大条数
  let maxpages = Math.ceil(allstudentList.length / maxPage); //设置最大页数
  try {
    Allstudent.insertMany(user, (err, ress) => {
      if (err) {
        console.log(err);
      } else {
        res.json({
          code: 200,
          msg: "添加成功",
          data: ress,
          maxpages: maxpages //添加的时候要拿到最大的页数，添加完毕后跳转至最大页数
        });
      }
    });
  } catch (error) {
    res.json({
      code: 211,
      msg: "连接失败"
    });
  }
});
//在全部学生中增加
app.post("/addallStudent", async (req, res) => {
  let user = req.body;
  if (
    user.name === "" ||
    user.sex === "" ||
    user.age === "" ||
    user.study === "" ||
    user.major === "" ||
    user.classes === "" ||
    user.citycenter === "" ||
    user.chengji === "" ||
    user.failss === ""
  ) {
    res.json({
      code: 201,
      msg: "提交信息中存在空项"
    });
    return false;
  } else {
    //   上述条件都不成立再进行添加
    let allstudentList = await Allstudent.find({});
    let maxPage = 7; //每页最大条数
    let maxpages = Math.ceil(allstudentList.length / maxPage); //设置最大页数
    try {
      Allstudent.create(user, (err, ress) => {
        if (err) {
          console.log(err);
        } else {
          res.json({
            code: 200,
            msg: "添加成功",
            data: ress,
            maxpages: maxpages //添加的时候要拿到最大的页数，添加完毕后跳转至最大页数
          });
        }
      });
    } catch (error) {
      res.json({
        code: 211,
        msg: "连接失败"
      });
    }
  }
});

// 在全部学生中删除
app.post("/delallStudent", async (req, res) => {
  let Id = req.body.id;
  if (Id instanceof Array) {
    let userAlllists = await Allstudent.find({ _id: { $in: Id } });
    // 查询所有符合条件的项
    if (userAlllists.length === 0) {
      //   如果说你输入的_id值在数据库里面没有，就走这里
      res.json({
        code: 201,
        msg: "没有当前项"
      });
      return false;
    }
    //   在数据库里能找到当前这几项 就进行删除
    try {
      Allstudent.remove({ _id: { $in: Id } }, error => {
        if (error) {
          console.log(error);
        } else {
          res.json({
            code: 200,
            msg: "删除成功"
          });
        }
      });
    } catch {
      res.json({
        code: 210,
        msg: "连接删除接口失败"
      });
    }
  } else {
    //   拿到传进来的_id作为唯一标识进行删除
    let _id = { _id: Id };
    let userlists = await Allstudent.find(_id);
    if (userlists.length === 0) {
      //   如果说你输入的_id值在数据库里面没有，就走这里
      res.json({
        code: 201,
        msg: "没有当前项"
      });
      return false;
    }
    //   在数据库里能找到_id值 就进行删除
    try {
      Allstudent.remove(_id, error => {
        if (error) {
          console.log(error);
        } else {
          res.json({
            code: 200,
            msg: "删除成功"
          });
        }
      });
    } catch {
      res.json({
        code: 210,
        msg: "连接删除接口失败"
      });
    }
  }
});

// 修改
app.post("/updateAllstud", async (req, res) => {
  let id = { _id: req.body.id };
  let newstudlist = req.body.upstud;
  let nowList = await Allstudent.find(id);
  if (nowList.length === 0) {
    //   如果你数据库里面没有当前id值，走这里，不进行修改操作
    res.json({
      code: 203,
      msg: "id是你修改数据的唯一标识，请输入正确的key值"
    });
    return false;
  }
  let oldstudlist = nowList[0]; //拿到的是个数组，所以要取第一项,取数据库中当前项的旧值
  //   通过查到的key的当前项的数据拿到当前的uesr
  try {
    //   进行修改
    Allstudent.update(oldstudlist, newstudlist, err => {
      if (err) {
        err(err);
      } else {
        res.json({
          code: 200,
          msg: "更新成功"
        });
      }
    });
  } catch {
    res.json({
      code: 201,
      msg: "连接更新接口失败"
    });
  }
});

// 在全部学生中查询
app.post("/selectAllstud", async (req, res) => {
  let obj = req.body.obj;
  let page = req.body.page; //查询出来的数据的当前页数 默认参数是1
  let maxPage = 7; //每页最大条数
  // console.log(obj, page);
  if (obj.name) {
    obj["name"] = new RegExp(obj.name);
  } //做一个姓名的模糊查询  加上这个判断和RegExp正则方法 拿到的obj如下 { name: /彭/ }
  if (obj.failss) {
    if (obj.failss == "0次") {
      obj.failss = 0;
    } else if (obj.failss == "1次") {
      obj.failss = 1;
    } else if (obj.failss == "2次") {
      obj.failss = 2;
    } else {
      obj.failss = { $gte: 3 }; //如果是查询三次及以上，则获取数据库中挂科次数大于3的
    }
  }

  try {
    Allstudent.find(obj, (err, ress) => {
      if (err) {
        console.log(err);
      } else {
        if (ress) {
          res.json({
            code: 200,
            data: ress.slice((page - 1) * maxPage, page * maxPage),
            total: ress.length
          });
        } else {
          res.json({
            code: 211,
            msg: "当前项不存在"
          });
        }
      }
    });
  } catch (error) {
    res.json({
      code: 221,
      msg: error
    });
  }
});
// ·························································································································
// 获取用户信息
app.get("/getadmin", (req, res) => {
  jwt.verify(req.query.token, "abcd", function (err, decode) {
    if (err) {
      res.json({
        code: 5005,
        data: "success",
        message: "用户未登录"
      });
    } else {
      Admin.findOne({ adminName: decode.username }, (err, ret) => {
        if (err) {
          return console.log("查询失败");
        }
        if (ret) {
          res.json({
            code: 20000,
            data: {
              roles: [ret.adminName],
              introduction: `I am an ${ret.adminName}`,
              avatar:
                "https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif",
              name: `Normal ${ret.adminName}`,
              token: jwt.sign({ username: ret.adminName }, "abcd", {
                // 过期时间
                expiresIn: "1h"
              })
            }
          });
        } else {
          ress.json({
            code: 50008,
            message: "Login failed, unable to get user details."
          });
        }
      });
    }
  });
});
// 登录
app.post("/login", (req, ress) => {
  const { username, password } = req.body;
  Admin.findOne({ adminName: username }, (err, ret) => {
    if (err) {
      return console.log("查询失败");
    }
    if (ret) {
      const { adminName } = ret;
      if (ret.password === password)
        return ress.json({
          code: 20000,
          data: {
            token: jwt.sign({ username: adminName }, "abcd", {
              // 过期时间
              expiresIn: "1h"
            })
          },
          msg: "登录成功"
        });
      ress.json({ code: 201, message: "密码不正确" });
    } else {
      ress.json({
        code: 60204,
        message: "该用户未注册"
      });
    }
  });
});
// 退出登录
app.post("/logout", (req, res) => {
  res.json({
    code: 20000,
    data: "success"
  });
});
// 创建用户
app.post("/register", (req, res) => {
  let { name, pass } = req.body;
  Admin.findOne({ adminName: name }, (err, ret) => {
    if (err) {
      return console.log("查询失败");
    }
    if (ret) {
      return res.json({ code: "203", message: "该用户已存在" });
    }
    var user = new Admin({
      adminName: name,
      password: pass
    });
    user.save(function (err, ress) {
      if (err) {
        return console.log(err);
      }
      res.json({
        code: "200",
        message: "创建成功"
      });
    });
  });
});

// ·························································································································
// 获取所有班主任
app.get("/getHeadTeacher", async (req, res) => {
  try {
    Headteacher.find({}, (err, ret) => {
      if (err) {
        console.log(err);
      } else {
        if (ret) {
          res.json({
            code: 200,
            data: ret
          });
        } else {
          res.json({
            code: 201,
            msg: "查询失败"
          });
        }
      }
    });
  } catch (error) {
    res.json({
      code: 211,
      msg: error
    });
  }
});
// 添加班主任
app.post("/addHeadTeacher", (req, res) => {
  let { headname, headsex, college, entryDate } = req.body;
  Headteacher.findOne({ headname }, (err, ret) => {
    if (err) {
      return console.log("查询失败");
    }
    if (ret) {
      return res.json({ code: 203, message: "当前班主任已存在" });
    }
    var user = new Headteacher({
      headname,
      headsex,
      college,
      entryDate
    });
    user.save(function (err, ress) {
      if (err) {
        return console.log(err);
      }
      res.json({
        code: 200,
        message: "添加成功"
      });
    });
  });
});
// 删除一条班主任
app.post("/delHeadTeacher", async (req, res) => {
  let Id = req.body;

  let userlists = await Headteacher.find(Id, (err, ress) => {
    //   把你当前的_id值放到数据库里查找
    if (err) {
      console.log(err);
    } else {
      return ress;
    }
  });

  if (userlists.length === 0) {
    //   如果说你输入的_id值在数据库里面没有，就走这里
    res.json({
      code: 201,
      msg: "没有当前项"
    });
    return false;
  }
  //   在数据库里能找到_id值 就进行删除
  try {
    Headteacher.remove(Id, error => {
      if (error) {
        console.log(error);
      } else {
        res.json({
          code: 200,
          msg: "删除成功"
        });
      }
    });
  } catch {
    res.json({
      code: 210,
      msg: "连接删除接口失败"
    });
  }
});

// ·························································································································
// 获取所有市场部
app.get("/getMarket", async (req, res) => {
  try {
    Market.find({}, (err, ret) => {
      if (err) {
        console.log(err);
      } else {
        if (ret) {
          res.json({
            code: 200,
            data: ret
          });
        } else {
          res.json({
            code: 201,
            msg: "查询失败"
          });
        }
      }
    });
  } catch (error) {
    res.json({
      code: 211,
      msg: error
    });
  }
});

// ·························································································································
// 获取所有班级
app.get("/getClass", async (req, res) => {
  try {
    Class.find({}, (err, ret) => {
      if (err) {
        console.log(err);
      } else {
        if (ret) {
          res.json({
            code: 200,
            data: ret
          });
        } else {
          res.json({
            code: 201,
            msg: "查询失败"
          });
        }
      }
    });
  } catch (error) {
    res.json({
      code: 211,
      msg: error
    });
  }
});
// 销毁一个班级
app.post("/delClass", async (req, res) => {
  let Id = req.body;
  let userlists = await Class.find(Id, (err, ress) => {
    //   把你当前的_id值放到数据库里查找
    if (err) {
      console.log(err);
    } else {
      return ress;
    }
  });

  if (userlists.length === 0) {
    //   如果说你输入的_id值在数据库里面没有，就走这里
    res.json({
      code: 201,
      msg: "没有当前项"
    });
    return false;
  }
  //   在数据库里能找到_id值 就进行删除
  try {
    Class.remove(Id, error => {
      if (error) {
        console.log(error);
      } else {
        res.json({
          code: 200,
          msg: "删除成功"
        });
      }
    });
  } catch {
    res.json({
      code: 210,
      msg: "连接删除接口失败"
    });
  }
});
// 创建班级
app.post("/createClass", (req, res) => {
  let { classname, createDate, lecturer, headteacher } = req.body;
  createDate = createDate.substring(0, 10);
  Class.findOne({ classname }, (err, ret) => {
    if (err) {
      return console.log("查询失败");
    }
    if (ret) {
      return res.json({ code: 203, message: "当前班级已存在" });
    }
    var user = new Class({
      classname,
      createDate,
      lecturer,
      headteacher
    });
    user.save(function (err, ress) {
      if (err) {
        return console.log(err);
      }
      res.json({
        code: 200,
        message: "添加成功"
      });
    });
  });
});
// 修改班级
app.post("/updateClass", (req, res) => {
  const { _id, lecturer, headteacher } = req.body;
  Class.findByIdAndUpdate(
    _id,
    {
      lecturer,
      headteacher
    },
    (err, ret) => {
      if (err) {
        console.log("更新失败");
      } else {
        res.json({
          code: 200,
          msg: "更新成功"
        });
      }
    }
  );
});
//口令红包
app.get("/hblq", (req, res) => {
  const key = req.query.key;
  if (key === "ThankyouforComming") {
    var _html = "<p><strong>" + "你要的答案是🤣：43532622" + "</p>";
    res.send(_html);
  } else {
    res.send("你别蒙啊");
  }
});
app.listen(8998, () => {
  console.log("8998启动成功");
});
