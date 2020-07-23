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
            <button @click="endRecording">取消摄像推流</button>
        </div>
        <p class="fs-xxs my-2 text-center" v-text="message"></p>
        <!-- <textarea ref="msg" name="msg" id="" style="width:300px" cols="30" rows="10"></textarea> -->
    </div>
</template>

<script>
    import MediaStreamRecorder from 'msr'
    import io from 'socket.io-client'
    export default {
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
        computed:{
          connectURL(){
            // return 'http://localhost:8090'
            return 'http://39.106.198.9:8090'
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
                navigator.mediaDevices.getUserMedia({audio:true,video:true}).then(stream => {
                    this.$refs.video.srcObject = stream
                    this.$refs.video.volume = 0
                    // this.socketConnect('http://39.106.198.9:8090')
                    this.socketConnect(this.connectURL)
                    this.Recording = true
                    // 创建MediaStreamRecorder对象
                    this.mediaRecorder = new MediaStreamRecorder(stream)
                    this.mediaRecorder.mimeType = 'video/webm';
                    console.log('this.mediaRecorder: ', this.mediaRecorder);
                    
                    this.mediaRecorder.ondataavailable = (blob) => {
                        console.log('blob: ', blob);

                        this.socketSend(blob)                                     
                    }
                    this.mediaRecorder.start(3000)
                })
            },
            // 结束录音
            endRecording(){
                this.socketDisconnect()
                if(this.mediaRecorder)this.mediaRecorder.stop()
                Object.assign(this.$data, this.$options.data())
            },
        },
        watch:{
          message(val){
            console.log(val)
          }
        },
        beforeDestroy(){
          this.endRecording()
        }
    }
</script>

<style lang="scss" scoped>
 
</style>