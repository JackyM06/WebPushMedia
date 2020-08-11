<template>
    <div class="d-flex flex-column jc-center ai-center">
        <h3 class="text-center">屏幕采集</h3>
        <div v-show="!Recording" class="d-flex flex-column ai-center">
            <input class="mb-2 p-1" v-model="pushUrl" type="text" style="width:300px" placeholder="请输入推流的RTMP地址">
            <button @click.stop="beginRecording">开始共享屏幕推流</button>
        </div>
        <div v-show="Recording" class="d-flex flex-column jc-center ai-center">
            <h4>本地预览</h4>
            <video ref="video" autoplay  controls="controls" muted="muted"></video>
            <button class="mt-2" @click.stop="endRecording">取消共享屏幕推流</button>
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
                pushUrl:null,
                socket:null,
                message:'点击开始共享屏幕进行RTMP推流',
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
              this.message = "推流地址提交成功，即将开始推流，请稍等"
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
              this.socket.on('sent',()=>{
              this.message = "正在推流直播中，现在可到“采集结果”中拉流查看效果"
            })
            }else{
              this.message = '当前连接存在波动，正在重试'
            }
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
              if(!navigator.mediaDevices) return this.throwError()
              // 获取音频流媒体
              if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({video:true}).then(stream => {
                  this.$refs.video.srcObject = stream
                  this.$refs.video.volume = 0
                  this.socketConnect(this.connectURL)
                  this.Recording = true
                  // 创建MediaStreamRecorder对象
                  this.mediaRecorder = new MediaStreamRecorder(stream)
                  this.mediaRecorder.mimeType = 'video/webm';
                  this.mediaRecorder.ondataavailable = (blob) => {
                      this.socket && this.socketSend(blob)                                     
                  }
                  // 启动后3s发送一次数据包
                  this.mediaRecorder.start(3000)
                }).catch(err=>{
                   console.log('err: ', err);
                   this.throwError()
                })
              }else{
                alert('当前版本浏览器不支持共享屏幕')
              }
          },
          // 结束录音
          endRecording(){
              if(this.mediaRecorder)this.mediaRecorder.stop()
              this.socketDisconnect()
              Object.assign(this.$data, this.$options.data())
              this.initPushURL()
          },
          getDisplayMediaPolyfill () {
            // 老的浏览器可能根本没有实现 mediaDevices，所以我们可以先设置一个空的对象
            if (navigator.mediaDevices === undefined) {
              navigator.mediaDevices = {}
            }
      
            // 一些浏览器部分支持 mediaDevices。我们不能直接给对象设置 getUserMedia
            // 因为这样可能会覆盖已有的属性。这里我们只会在没有getUserMedia属性的时候添加它。
            if (navigator.mediaDevices.getDisplayMedia === undefined) {
              navigator.mediaDevices.getDisplayMedia = function (constraints) {
                // 首先，如果有getDisplayMedia的话，就获得它
                const getDisplayMedia = navigator.getDisplayMedia
      
                // 一些浏览器根本没实现它 - 那么就返回一个error到promise的reject来保持一个统一的接口
                if (!getDisplayMedia) {
                  return Promise.reject(new Error('getDisplayMedia is not implemented in this browser'))
                }
      
                // 否则，为老的navigator.getDisplayMedia方法包裹一个Promise
                return new Promise((resolve, reject) => {
                  getDisplayMedia.call(navigator, constraints, resolve, reject)
                })
              }
            }
          },
          initPushURL(){
              if(localStorage.getItem('rtmp') == undefined || !localStorage.getItem('rtmp').includes('rtmp://')){
                let mockUrl = `rtmp://${window.location.hostname}:1935/live/root_`+parseInt(Math.random()*100000)
                this.pushUrl = mockUrl
              }else{
                this.pushUrl = localStorage.getItem('rtmp')
              }
            },
            setPushURL(val){
              if(val.includes && val.includes('rtmp://')){
                localStorage.setItem('rtmp',val)
              }
            },
            throwError(){
                this.$parent.mediaError()
            }
        },
        mounted(){
          this.initPushURL()
          this.getDisplayMediaPolyfill ()
        },
        watch:{
          message(val){
            console.log(val)
          }
        },
        beforeDestroy(){
          this.endRecording()
        },
        
    }
</script>

<style lang="scss" scoped>
 video{
   width: 400px;
 }
</style>