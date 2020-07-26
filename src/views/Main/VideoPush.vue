<template>
    <div class="d-flex flex-column jc-center ai-center">
        <h3 class="text-center">视频采集(开发中)</h3>
        <div v-show="!Recording" class="d-flex flex-column ai-center">
            <input class="mb-2 p-1" v-model="pushUrl" type="text" style="width:300px" placeholder="请输入推流的RTMP地址">
            <button @click="beginRecording">开始摄像推流</button>
        </div>
        <div v-show="Recording" class="d-flex flex-column jc-center ai-center">
            <h4>本地预览</h4>
            <video ref="video" autoplay  controls="controls" muted="muted"></video>
            <button class="mt-2" @click="endRecording">取消摄像推流</button>
        </div>
        <p class="fs-xxs my-2 text-center" v-text="message"></p>
        <!-- <textarea ref="msg" name="msg" id="" style="width:300px" cols="30" rows="10"></textarea> -->
    </div>
</template>

<script>
    import MediaStreamRecorder from 'msr'
    import io from 'socket.io-client'
    export default {
        props:{
          connectURL:{
            type:String,
            default:'http://localhost:8090'
          }
        },
        data () {
            return {
                Recording:false,
                blobUrl:"",
                mediaRecorder:null,
                pushUrl:'rtmp://39.106.198.9:1935/live/home',
                socket:null,
                message:'点击开始摄像进行RTMP推流',
                canSend:false,
                type:'video'
            }
        },
        methods:{
          // ? websocket 方案 
          // 获取连接 
          socketConnect(wsUrl){
            this.socket = io.connect(wsUrl)
            this.socket.on('connected',()=>{
              this.socket.emit('start',this.pushUrl,this.type)
              this.message = "webscocket连接成功，正在提交推流地址"
            })
            this.socket.on('started',()=>{
              this.message = "推流地址提交成功，即将开始推流"
              this.canSend = true
            })
            this.socket.on('startError',msg =>{
              this.message = "操作异常请重试，错误信息:"+msg
            })
          },
          // 发送blob对象
          socketSend(blob){
            if(this.canSend){
              this.socket.emit("sendBlob", blob)
            }else{
              this.message = '当前连接存在波动，正在重试'
            }
            this.socket.on('sent',()=>{
              this.message = "正在推流，可到采集结果中拉流查看效果"
            })
          },
          // 断开连接
          socketDisconnect(){
            if(this.socket){
              this.socket.emit('end')
              this.socket.on('ended',()=>{
                this.message = '推流已结束'
              })
            }
          },
          beginRecording(){
              // 获取音频流媒体
              if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try{
                  navigator.mediaDevices.getUserMedia({audio:true,video:{ frameRate: { ideal: 10, max: 15 } }}).then(stream => {
                    this.$refs.video.srcObject = stream
                    this.$refs.video.volume = 0
                    this.socketConnect(this.connectURL)
                    this.Recording = true
                    // 创建MediaStreamRecorder对象
                    this.mediaRecorder = new MediaStreamRecorder(stream)
                    this.mediaRecorder.mimeType = 'video/webm';
                    this.mediaRecorder.ondataavailable = (blob) => {
                        console.log('blob: ', blob);
                        this.socketSend(blob)                                     
                    }
                    this.mediaRecorder.start(3000)
                  }).catch(err=>{
                     console.log('err: ', err);
                  })
                }catch(err){
                  console.log('err: ', err);

                }
              }else{
                alert('当前版本浏览器不支持设备麦克风获取')
              }
          },
          // 结束录音
          endRecording(){
              this.socketDisconnect()
              if(this.mediaRecorder)this.mediaRecorder.stop()
              Object.assign(this.$data, this.$options.data())
          },
          getUserMediaPolyfill () {
            // 老的浏览器可能根本没有实现 mediaDevices，所以我们可以先设置一个空的对象
            if (navigator.mediaDevices === undefined) {
              navigator.mediaDevices = {}
            }
      
            // 一些浏览器部分支持 mediaDevices。我们不能直接给对象设置 getUserMedia
            // 因为这样可能会覆盖已有的属性。这里我们只会在没有getUserMedia属性的时候添加它。
            if (navigator.mediaDevices.getUserMedia === undefined) {
              navigator.mediaDevices.getUserMedia = function (constraints) {
                // 首先，如果有getUserMedia的话，就获得它
                const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia
      
                // 一些浏览器根本没实现它 - 那么就返回一个error到promise的reject来保持一个统一的接口
                if (!getUserMedia) {
                  return Promise.reject(new Error('getUserMedia is not implemented in this browser'))
                }
      
                // 否则，为老的navigator.getUserMedia方法包裹一个Promise
                return new Promise((resolve, reject) => {
                  getUserMedia.call(navigator, constraints, resolve, reject)
                })
              }
            }
          },
        },
        watch:{
          message(val){
            console.log(val)
          }
        },
        beforeDestroy(){
          this.endRecording()
        },
        mounted () {
          this.getUserMediaPolyfill ()
        }
    }
</script>

<style lang="scss" scoped>
 video{
   width: 400px;
 }
</style>