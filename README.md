# WebPushMedia

> 该项目运行后与Node服务(`NodePushToRTMPServer`)建立webSocket连接，实时采集并发送音/视频数据。并由Node服务进行音/视频推流。项目中已默认与部署在阿里云ecs实例的8090端口上的Node服务连接，测试情况下无需调整。



**项目在线地址** ✨

> http://39.106.198.9:8050/



### 将项目clone到本地中

```shell
git clone https://gitee.com/JackyM06/WebPushMedia.git
```

### 进入`WebPushMedia`文件夹下

```shell
cd WebPushMedia
```

### 安装依赖

```shell
npm install
```

### 运行

```shell
npm run dev
```

### 说明

**推流部分由Node服务完成，可参看Node服务项目**：https://gitee.com/JackyM06/NodePushToRTMPServer

目前该DEMO已支持

- 麦克风采集推流
- 摄像头采集推流
- 文件推流
- 公网媒体资源推流
- 桌面录频推流

>  本项目主要用于功能测试、展示配合`NodePushToRTMPServer`服务进行推流的工作过程。希望能给你带来些帮助🛴

