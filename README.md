# sample-backend-for-kangaroo-coin
终端cd进backend文件夹， 执行'npm install'
然后执行'DEBUG=backend: * npm run devstart' 启动，包含调试，会在文件改动时自动重启服务器
或简单执行 npm start


///
后端文件包含注册、登录、加密验证，数据获取等简单路由，数据库使用基于mongoose的MongoDB(需要更换成区块链计划使用的数据库)
该后端使用swagger提供API文档