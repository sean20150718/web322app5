const fs = require('fs');
 const { Sequelize, DataTypes } = require('sequelize');
 const { gte } = Sequelize.Op;
module.exports = Sequelize;
var sequelize = new Sequelize('zvjknmbj', 'zvjknmbj', '1BLLuM0V3N43xNd2GwzgBc6jpN0uFqbk', {
    host: 'mahmud.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});
//Define a "post" model
var sequelize = new Sequelize(
  "tgxufbkt",
  "tgxufbkt",
  "Jcv_k8x_AoNEzn36l-r6Q24T7Oy1nIud",
  {
    host: "babar.db.elephantsql.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
  }
);
var Post=sequelize.define("Post",{
   body: Sequelize.TEXT,
  title:Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage:Sequelize.STRING,
  published:Sequelize.BOOLEAN,
});
//Define a "Category" model
var Category=sequelize.define("Category",{
  Category:Sequelize.STRING,
});
//	belongsTo Relationship
Post.belongsTo(Category, {foreignKey: 'category'});

// const Post = require('./models').Post;
//const { sequelize } = require('./models');
//  const { Post } = require('./models');

const initialize = () => {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        console.log('Database synced successfully.');
        resolve();
      })
      .catch((err) => {
        console.log('Unable to sync the database:', err);
        reject('Unable to sync the database');
      });
  });
};

const getAllPosts = () => {
  return new Promise((resolve, reject) => {
    Post.findAll()
      .then(posts => {
        if (posts.length === 0) {
          reject("No posts found");
        } else {
          resolve(posts);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

const getPostsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: { category: category }
    })
      .then((posts) => {
        if (posts.length === 0) {
          reject('No results returned');
        } else {
          resolve(posts);
        }
      })
      .catch((err) => {
        console.log('Error retrieving posts by category:', err);
        reject('Error retrieving posts by category');
      });
  });
};

const getPostsByMinDate = (minDateStr) => {
  return new Promise((resolve, reject) => {
    const { gte } = Sequelize.Op;
    const minDate = new Date(minDateStr);

    Post.findAll({
      where: {
        postDate: {
          [gte]: minDate
        }
      }
    }).then((posts) => {
      resolve(posts);
    }).catch((error) => {
      reject("no results returned");
    });
  });
};

const getPostById = (id) => {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        id: id
      }
    })
    .then((data) => {
      if (data.length === 0) {
        reject("no results returned");
      } else {
        resolve(data[0]);
      }
    })
    .catch((error) => {
      reject(error);
    });
  });
};

const addPost = (postData) => {
  postData.published = (postData.published) ? true : false;

  for (let prop in postData) {
    if (postData[prop] === "") {
      postData[prop] = null;
    }
  }
    let dateObj =new Date() ;
  let year = dateObj.getFullYear();
  let month = (dateObj.getMonth() + 1).toString();
  let day = dateObj.getDate().toString();
  postData.postDate=`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  // new Date().toISOString().slice(0,10);
  console.log( postData.postDate);
  return new Promise((resolve, reject) => {
    Post.create(postData)
      .then(() => {
        resolve("Post created successfully");
      })
      .catch((error) => {if (error.name === 'SequelizeValidationError') {
        reject("Invalid post data");
      } else {
        console.error(error);
        reject("Unable to create post");
      }
    });
  });
};

function addCategory(categoryData) {
  return new Promise((resolve, reject) => {
    for (let i in categoryData) {
      if (categoryData[i] === "") {
        categoryData[i] = null;
      }
    }
console.log("categoryData",categoryData);
    Category.create(categoryData)
      .then((category) => {
        resolve(category);
      })
      .catch(() => {
        reject("unable to create category");
      });
  });
}



function deletePostById(id) {
  return new Promise((resolve, reject) => {
    Post.destroy({
      where: {
        id: id,
      },
    })
      .then(() => {
        resolve("Destroyed");
      })
      .catch(() => {
        reject("Unable to delete post");
      });
  });
}

function deleteCategoryById(id) {
  return new Promise((resolve, reject) => {
    console.log("three step");
    Category.destroy({
      where: {
        id: id,
      },
    })
      .then(() => {
        resolve("Destroyed");
      })
      .catch(() => {
        reject("Unable to delete category");
      });
  });
}

  function getPublishedPosts () {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        published: true
      }
    }).then(posts => {
      resolve(posts);
    }).catch(error => {
      reject("no results returned");
    });
  });
};

  function getPublishedPostsByCategory (category) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        published: true,
        category: category
      }
    })
      .then(posts => {
        resolve(posts);
      })
      .catch(error => {
        reject("no results returned");
      });
  });
};

function getCategories() {
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("No results returned");
      });
  });
}

// const getCategories = () => {
//   return new Promise((resolve, reject) => {
//     Category.findAll()
//       .then(categories => {
//         resolve(categories);
//       })
//       .catch(error => {
//         reject("no results returned");
//       });
//   });
// };


module.exports = {
initialize,
getAllPosts,
getPublishedPosts,
getCategories,
//getCategoriesSync,
deletePostById,
deleteCategoryById,
addPost,
addCategory,
getPostsByCategory,
 getPostsByMinDate,
getPostById,
 getPublishedPostsByCategory,
  };